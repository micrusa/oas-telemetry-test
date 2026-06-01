/**
 * Name: import-from-string
 * Version: 0.0.4
 * Author: CondorHero
 * Homepage: https://github.com/condorheroblog/import-from-string#readme
 * License MIT © 2023-Present
 */

'use strict';

var node_path = require('node:path');
var node_url = require('node:url');
var node_module = require('node:module');
var node_fs = require('node:fs');
var esbuild = require('esbuild');

const FILE_URL_PROTOCOL = "file:";
const isFileURL = (value) => value.startsWith(FILE_URL_PROTOCOL);
const ensureFileURL = (value) => isFileURL(value) ? value : node_url.pathToFileURL(value).href;
const ensurePath = (value) => isFileURL(value) ? node_url.fileURLToPath(value) : value;
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
  return node_path.dirname(ensurePath(callerFilename));
};
function getNodeModulesPaths(filePath) {
  const nodeModulesPaths = [];
  let currentDir = node_path.dirname(filePath);
  while (true) {
    const nodeModulesPath = node_path.resolve(currentDir, "node_modules");
    nodeModulesPaths.push(nodeModulesPath);
    const parentDir = node_path.resolve(currentDir, "..");
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
  const absolutePath = node_path.join(dirname, filename);
  let mainModule;
  let mainModulePaths = [];
  if (isInESModuleScope()) {
    mainModule = void 0;
    mainModulePaths = getNodeModulesPaths(absolutePath);
  } else {
    mainModulePaths = mainModule?.paths ?? getNodeModulesPaths(absolutePath);
    mainModule = require.main;
  }
  const contextModule = new node_module.Module(absolutePath, mainModule);
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
        const contents = await node_fs.promises.readFile(args.path, "utf-8");
        const injectLines = [`const ${IMPORT_META_URL_VAR_NAME} = ${JSON.stringify(node_url.pathToFileURL(args.path).href)};`];
        return {
          contents: injectLines.join("") + contents,
          loader: inferLoader(node_path.extname(args.path))
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
        if (args.path[0] === "." || node_path.isAbsolute(args.path)) {
          return;
        }
        if (args.kind === "import-statement" || args.kind === "dynamic-import") {
          const { resolve } = await import('import-meta-resolve');
          return {
            path: resolve(args.path, node_url.pathToFileURL(node_path.join(args.resolveDir, "__TEMP__.js")).href),
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
  const bundledResult = await esbuild.build({
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
  const absolutePath = node_path.join(dirname, filename);
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
    const transformCode = esbuild.transformSync(bundled, {
      format: "esm",
      ...options.transformOptions,
      define: {
        [IMPORT_META_URL_VAR_NAME]: JSON.stringify(node_url.pathToFileURL(absolutePath).href),
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

exports.IMPORT_META_URL_VAR_NAME = IMPORT_META_URL_VAR_NAME;
exports.JS_EXT_RE = JS_EXT_RE;
exports.buildBundler = buildBundler;
exports.ensureFileURL = ensureFileURL;
exports.ensurePath = ensurePath;
exports.externalPlugin = externalPlugin;
exports.getCallerDirname = getCallerDirname;
exports.getNodeModulesPaths = getNodeModulesPaths;
exports.importFromString = importFromString;
exports.inferLoader = inferLoader;
exports.injectFileScopePlugin = injectFileScopePlugin;
exports.isFileURL = isFileURL;
exports.isInESModuleScope = isInESModuleScope;
exports.requireFromString = requireFromString;
exports.version = version;
Object.keys(esbuild).forEach(function (k) {
	if (k !== 'default' && !Object.prototype.hasOwnProperty.call(exports, k)) Object.defineProperty(exports, k, {
		enumerable: true,
		get: function () { return esbuild[k]; }
	});
});
