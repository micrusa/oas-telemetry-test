import * as fs from 'fs';
import * as path from 'path';

export type StreamWriterOptions = {
    directoryPath: string;
    segmentPrefix: string;
    maxSegmentBytes?: number;
};

/**
 * Writes JSON in disk without loading all content into memory, and rotating to the next file when the size limit is reached.
 */
export class DiskJsonStreamWriter {
    private readonly directoryPath: string;
    private readonly segmentPrefix: string;
    private readonly maxSegmentBytes: number;
    
    private currentFileIndex = 0;
    private currentFilePath: string = '';
    private currentFileSize = 0;
    private isFirstRecordInFile = true;

    constructor(options: StreamWriterOptions) {
        this.directoryPath = options.directoryPath;
        this.segmentPrefix = options.segmentPrefix;
        this.maxSegmentBytes = options.maxSegmentBytes || 256 * 1024 * 1024; // 256 MB

        if (!fs.existsSync(this.directoryPath)) {
            fs.mkdirSync(this.directoryPath, { recursive: true });
        }
        
        this.rotateFile();
    }

    /**
     * Rotates the file pointer to a new segment file and initializes its JSON structure.
     */
    private rotateFile(): void {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        this.currentFilePath = path.join(
            this.directoryPath,
            `${this.segmentPrefix}_${timestamp}_part${this.currentFileIndex}.json`
        );
        this.currentFileIndex++;
        this.isFirstRecordInFile = true;
        this.currentFileSize = 0;
    }

    /**
     * Initializes the file with the opening structure if it does not exist or is empty.
     */
    private async initJsonFile(handle: fs.promises.FileHandle, rootKey: string): Promise<number> {
        const header = `{\n  "${rootKey}": [\n`;
        const footer = `\n  ]\n}`;
        const initialContent = header + footer;
        
        await handle.writeFile(initialContent, 'utf-8');
        return Buffer.byteLength(initialContent, 'utf-8');
    }

    /**
     * Adds a batch of records to the JSON on disk without loading it into memory.
     */
    public async appendRecords(rootKey: string, records: any[]): Promise<void> {
        if (records.length === 0) return;

        // Converts the batch of objects to a JSON string fragment (one by one)
        let recordsString = records.map(r => JSON.stringify(r, null, 4)).join(',\n');
        
        // Formats indentation so it looks nice inside the array
        recordsString = recordsString.split('\n').map(line => '    ' + line).join('\n');

        // If it's not the first record we're adding to this file, we need an initial comma
        if (!this.isFirstRecordInFile) {
            recordsString = ',\n' + recordsString;
        }

        const bytesToWrite = Buffer.byteLength(recordsString, 'utf-8');
        const footerStr = `\n  ]\n}`;
        const footerBytes = Buffer.byteLength(footerStr, 'utf-8');

        // Checks if the current file size exceeds the configured limit (current size, new data, and footer)
        if (this.currentFileSize > 0 && (this.currentFileSize + bytesToWrite + footerBytes > this.maxSegmentBytes)) {
            this.rotateFile();
        }

        let fileHandle: fs.promises.FileHandle | null = null;

        try {
            // If the file does not exist on disk (new or rotated), we create and initialize it
            if (!fs.existsSync(this.currentFilePath)) {
                fileHandle = await fs.promises.open(this.currentFilePath, 'w+');
                this.currentFileSize = await this.initJsonFile(fileHandle, rootKey);
            } else {
                fileHandle = await fs.promises.open(this.currentFilePath, 'r+');
            }

            // The footer currently measures exactly 'footerBytes'.
            // We position ourselves just before the footer to overwrite it.
            const positionToInsert = this.currentFileSize - footerBytes;

            // Writes the new records and then re-seals the JSON with the footer
            const dataToAppend = recordsString + footerStr;
            await fileHandle.write(Buffer.from(dataToAppend, 'utf-8'), 0, Buffer.byteLength(dataToAppend, 'utf-8'), positionToInsert);

            // Updates the internal states of the writer
            this.isFirstRecordInFile = false;
            this.currentFileSize = positionToInsert + Buffer.byteLength(dataToAppend, 'utf-8');

        } finally {
            if (fileHandle) {
                await fileHandle.close();
            }
        }
    }
}