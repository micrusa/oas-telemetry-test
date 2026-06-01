import * as esbuild from 'esbuild';
import { TransformOptions, BuildOptions, Loader, Plugin } from 'esbuild';
export * from 'esbuild';
export { BuildOptions, ImportKind, Loader, Metafile, Plugin } from 'esbuild';

/**
 * Options for requiring code from a string.
 */
interface RequireFromStringOptions {
    /**
     * The virtual file name of the code to import.
     * @default `${Date.now()}.js`
     */
    filename?: string;
    /**
     * The directory name to resolve dependencies relative to.
     * @default The directory where the function is called
     */
    dirname?: string;
    /**
     * An array of additional paths to append when resolving modules.
     */
    appendPaths?: string[];
    /**
     * An array of additional paths to prepend when resolving modules.
     */
    prependPaths?: string[];
}
/**
 * Requires code from a string.
 *
 * @param code - The code to require.
 * @param options - Options for requiring the code.
 * @returns The exports object of the required module.
 * @throws If the code is empty or encounters an error during execution.
 */
declare const requireFromString: (code: string, options?: RequireFromStringOptions) => any;

/**
 * Options for importing code from a string.
 */
interface ImportFromStringOptions {
    /**
     * The virtual file name of the code to import.
     * @default `${Date.now()}.js`
     */
    filename?: string;
    /**
     * The directory name to resolve dependencies relative to.
     * @default The directory where the function is called
     */
    dirname?: string;
    /**
     * esbuild transform options.
     */
    transformOptions?: TransformOptions;
    /**
     * esbuild options.
     */
    esbuildOptions?: BuildOptions;
    /**
     * skip esbuild build.
     * @default false
     */
    skipBuild?: boolean;
}
/**
 * Asynchronously import module from string.
 *
 * @param code - The code to import.
 * @param options - Options for importing the code.
 * @returns A promise that resolves to the imported module.
 * @throws If the import or transformation process encounters an error.
 */
declare function importFromString(code: string, options?: ImportFromStringOptions): Promise<any>;

declare const IMPORT_META_URL_VAR_NAME = "__injected_import_meta_url__";
declare const JS_EXT_RE: RegExp;
declare function inferLoader(ext: string): Loader;
declare function injectFileScopePlugin(): Plugin;

declare function externalPlugin(): Plugin;

declare function buildBundler(esbuildOptions?: BuildOptions): Promise<esbuild.BuildResult<{
    bundle: boolean;
    splitting?: boolean | undefined;
    preserveSymlinks?: boolean | undefined;
    outfile?: string | undefined;
    metafile: boolean;
    outdir?: string | undefined;
    outbase?: string | undefined;
    external?: string[] | undefined;
    packages?: "external" | undefined;
    alias?: Record<string, string> | undefined;
    loader?: {
        [ext: string]: esbuild.Loader;
    } | undefined;
    resolveExtensions?: string[] | undefined;
    mainFields?: string[] | undefined;
    conditions?: string[] | undefined;
    write: boolean;
    allowOverwrite?: boolean | undefined;
    tsconfig?: string | undefined;
    outExtension?: {
        [ext: string]: string;
    } | undefined;
    publicPath?: string | undefined;
    entryNames?: string | undefined;
    chunkNames?: string | undefined;
    assetNames?: string | undefined;
    inject?: string[] | undefined;
    banner?: {
        [type: string]: string;
    } | undefined;
    footer?: {
        [type: string]: string;
    } | undefined;
    entryPoints?: string[] | Record<string, string> | {
        in: string;
        out: string;
    }[] | undefined;
    stdin?: esbuild.StdinOptions | undefined;
    plugins: esbuild.Plugin[];
    absWorkingDir?: string | undefined;
    nodePaths?: string[] | undefined;
    sourcemap?: boolean | "external" | "inline" | "linked" | "both" | undefined;
    legalComments: "external" | "none" | "inline" | "eof" | "linked";
    sourceRoot?: string | undefined;
    sourcesContent?: boolean | undefined;
    format: esbuild.Format;
    globalName?: string | undefined;
    target?: string | string[] | undefined;
    supported?: Record<string, boolean> | undefined;
    platform: esbuild.Platform;
    mangleProps?: RegExp | undefined;
    reserveProps?: RegExp | undefined;
    mangleQuoted?: boolean | undefined;
    mangleCache?: Record<string, string | false> | undefined;
    drop?: esbuild.Drop[] | undefined;
    dropLabels?: string[] | undefined;
    minify?: boolean | undefined;
    minifyWhitespace?: boolean | undefined;
    minifyIdentifiers?: boolean | undefined;
    minifySyntax?: boolean | undefined;
    lineLimit?: number | undefined;
    charset?: esbuild.Charset | undefined;
    treeShaking?: boolean | undefined;
    ignoreAnnotations?: boolean | undefined;
    jsx?: "transform" | "preserve" | "automatic" | undefined;
    jsxFactory?: string | undefined;
    jsxFragment?: string | undefined;
    jsxImportSource?: string | undefined;
    jsxDev?: boolean | undefined;
    jsxSideEffects?: boolean | undefined;
    define?: {
        [key: string]: string;
    } | undefined;
    pure?: string[] | undefined;
    keepNames?: boolean | undefined;
    color?: boolean | undefined;
    logLevel: esbuild.LogLevel;
    logLimit?: number | undefined;
    logOverride?: Record<string, esbuild.LogLevel> | undefined;
    tsconfigRaw?: string | esbuild.TsconfigRaw | undefined;
}>>;

/**
 * Checks if a given URL is a file URL.
 *
 * @param value - The URL to check.
 * @returns `true` if the URL is a file URL, `false` otherwise.
 */
declare const isFileURL: (value: string) => boolean;
/**
 * Ensures that a given value is a file URL. If the value is not a file URL,
 * it converts it to a file URL using `pathToFileURL`.
 *
 * @param value - The value to ensure as a file URL.
 * @returns The file URL.
 */
declare const ensureFileURL: (value: string) => string;
/**
 * Ensures that a given value is a file path. If the value is a file URL,
 * it converts it to a file path using `fileURLToPath`.
 *
 * @param value - The value to ensure as a file path.
 * @returns The file path.
 */
declare const ensurePath: (value: string) => string;
/**
 * Checks if the current execution context is in an ECMAScript module scope.
 *
 * @returns `true` if the current context is in an ES module scope, `false` otherwise.
 */
declare const isInESModuleScope: () => boolean;
/**
 * Retrieves the directory name of the caller function.
 *
 * @returns The directory name of the caller.
 */
declare const getCallerDirname: () => string;
/**
 * Retrieves an array of node_modules paths starting from the given file path and going up the directory tree.
 *
 * @param filePath - The file path to start from.
 * @returns An array of node_modules paths.
 */
declare function getNodeModulesPaths(filePath: string): string[];

var version = "0.0.4";

export { IMPORT_META_URL_VAR_NAME, type ImportFromStringOptions, JS_EXT_RE, type RequireFromStringOptions, buildBundler, ensureFileURL, ensurePath, externalPlugin, getCallerDirname, getNodeModulesPaths, importFromString, inferLoader, injectFileScopePlugin, isFileURL, isInESModuleScope, requireFromString, version };
