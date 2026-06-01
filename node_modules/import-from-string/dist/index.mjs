/**
 * Name: import-from-string
 * Version: 0.0.4
 * Author: CondorHero
 * Homepage: https://github.com/condorheroblog/import-from-string#readme
 * License MIT © 2023-Present
 */

import { dirname, resolve, join, extname, isAbsolute } from 'node:path';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { Module } from 'node:module';
import { promises } from 'node:fs';
import { build, transformSync } from 'esbuild';
export * from 'esbuild';

const FILE_URL_PROTOCOL = "file:";
const isFileURL = (value) => value.startsWith(FILE_URL_PROTOCOL);
const ensureFileURL = (value) => isFileURL(value) ? value : pathToFileURL(value).href;
const ensurePath = (value) => isFileURL(value) ? fileURLToPath(value) : value;
const isInESModuleScope = () => {
  try {
    return module === void 0;
  } catch {
    return true;
  }
};
const internalFunctionNames = ["getCallerDirname", "requireFromString", "importFromString"];
const getCallerDirname = () => {
  const __prepareStackTrace = Error.prepareStackTrace;
  Error.prepareStackTrace = (_err, stackTraces) => stackTraces;
  const callSites = new Error().stack.filter((callSite) => {
    const functionName = callSite.getFunctionName();
    return functionName === null || !internalFunctionNames.includes(functionName);
  });
  Error.prepareStackTrace = __prepareStackTrace;
  const caller = callSites[0];
  const callerFilename = caller.getFileName() ?? process.argv[1];
  return dirname(ensurePath(callerFilename));
};
function getNodeModulesPaths(filePath) {
  const nodeModulesPaths = [];
  let currentDir = dirname(filePath);
  while (true) {
    const nodeModulesPath = resolve(currentDir, "node_modules");
    nodeModulesPaths.push(nodeModulesPath);
    const parentDir = resolve(currentDir, "..");
    if (parentDir === currentDir) {
      break;
    }
    currentDir = parentDir;
  }
  return nodeModulesPaths;
}

const requireFromString = (code, options = {}) => {
  if (!code.length) {
    throw new Error(`code cannot be empty`);
  }
  const filename = options?.filename ?? `${Date.now()}.js`;
  const dirname = options?.dirname ?? getCallerDirname();
  const absolutePath = join(dirname, filename);
  let mainModule;
  let mainModulePaths = [];
  if (isInESModuleScope()) {
    mainModule = void 0;
    mainModulePaths = getNodeModulesPaths(absolutePath);
  } else {
    mainModulePaths = mainModule?.paths ?? getNodeModulesPaths(absolutePath);
    mainModule = require.main;
  }
  const contextModule = new Module(absolutePath, mainModule);
  contextModule.filename = absolutePath;
  const appendPaths = options?.appendPaths ?? [];
  const prependPaths = options?.prependPaths ?? [];
  contextModule.paths = [...prependPaths, ...mainModulePaths, ...appendPaths];
  contextModule._compile(code, absolutePath);
  contextModule.loaded = true;
  return contextModule.exports;
};

var name = "import-from-string";
var version = "0.0.4";

const IMPORT_META_URL_VAR_NAME = "__injected_import_meta_url__";
const JS_EXT_RE = /\.([mc]?[tj]s|[tj]sx)$/;
function inferLoader(ext) {
  if (ext === ".mjs" || ext === ".cjs")
    return "js";
  if (ext === ".mts" || ext === ".cts")
    return "ts";
  return ext.slice(1);
}
function injectFileScopePlugin() {
  return {
    name: `[${name}]:inject-file-scope`,
    setup(build) {
      build.initialOptions.define = {
        ...build.initialOptions.define,
        "import.meta.url": IMPORT_META_URL_VAR_NAME
      };
      build.onLoad({ filter: JS_EXT_RE }, async (args) => {
        const contents = await promises.readFile(args.path, "utf-8");
        const injectLines = [`const ${IMPORT_META_URL_VAR_NAME} = ${JSON.stringify(pathToFileURL(args.path).href)};`];
        return {
          contents: injectLines.join("") + contents,
          loader: inferLoader(extname(args.path))
        };
      });
    }
  };
}

function externalPlugin() {
  return {
    name: `[${name}]:external-plugin`,
    setup(ctx) {
      ctx.onResolve({ filter: /.*/ }, async (args) => {
        if (args.path[0] === "." || isAbsolute(args.path)) {
          return;
        }
        if (args.kind === "import-statement" || args.kind === "dynamic-import") {
          const { resolve } = await import('import-meta-resolve');
          return {
            path: resolve(args.path, pathToFileURL(join(args.resolveDir, "__TEMP__.js")).href),
            // Most like importing from node_modules and builtin modules, mark external
            external: true
          };
        } else {
          return {
            external: true
          };
        }
      });
    }
  };
}

async function buildBundler(esbuildOptions = {}) {
  const bundledResult = await build({
    bundle: true,
    platform: "node",
    format: "esm",
    write: false,
    legalComments: "none",
    logLevel: "silent",
    metafile: true,
    plugins: [externalPlugin(), injectFileScopePlugin()],
    ...esbuildOptions
  });
  return bundledResult;
}

async function importFromString(code, options = {}) {
  if (!code.length) {
    throw new Error(`code cannot be empty`);
  }
  const filename = options?.filename ?? `${Date.now()}.js`;
  const dirname = options?.dirname ?? getCallerDirname();
  const skipBuild = options?.skipBuild ?? false;
  const absolutePath = join(dirname, filename);
  let result = code;
  if (!skipBuild) {
    const bundledResult = await buildBundler({
      ...options?.esbuildOptions,
      stdin: {
        contents: code,
        resolveDir: dirname,
        loader: "js",
        ...options?.esbuildOptions?.stdin
      }
    });
    if (!bundledResult.outputFiles) {
      throw new Error(`[${name}] no output files`);
    }
    const bundled = bundledResult.outputFiles[0].text;
    const transformCode = transformSync(bundled, {
      format: "esm",
      ...options.transformOptions,
      define: {
        [IMPORT_META_URL_VAR_NAME]: JSON.stringify(pathToFileURL(absolutePath).href),
        ...options.transformOptions?.define
      }
    });
    result = transformCode.code;
  }
  try {
    return import(`data:text/javascript;base64,${Buffer.from(result).toString("base64")}`);
  } catch (error) {
    throw new Error(result);
  }
}

export { IMPORT_META_URL_VAR_NAME, JS_EXT_RE, buildBundler, ensureFileURL, ensurePath, externalPlugin, getCallerDirname, getNodeModulesPaths, importFromString, inferLoader, injectFileScopePlugin, isFileURL, isInESModuleScope, requireFromString, version };
