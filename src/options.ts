import _ts = require('typescript');
import _adapter = require('./adapter');
import _util = require('./util');
import _lang = require('./lang');

export interface ResolvePath {
    (path: string): string;
}

interface Option {
    name: string;
    type: string | _lang.Map<number>;
    isFilePath?: boolean;
    experimental?: boolean;
}

const optionsList: Option[] = [
    {
        name: 'charset',
        type: 'string',
    },
    {
        name: 'declaration',
        type: 'boolean',
    },
    {
        name: 'diagnostics',
        type: 'boolean',
    },
    {
        name: 'emitBOM',
        type: 'boolean'
    },
    {
        name: 'emitDecoratorMetadata',
        type: 'boolean',
        experimental: true,
    },
    {
        name: 'experimentalAsyncFunctions',
        type: 'boolean',
    },
    {
        name: 'experimentalDecorators',
        type: 'boolean',
    },
    {
        name: 'help',
        type: 'boolean',
    },
    {
        name: 'init',
        type: 'boolean',
    },
    {
        name: 'inlineSourceMap',
        type: 'boolean',
    },
    {
        name: 'inlineSources',
        type: 'boolean',
    },
    {
        name: 'isolatedModules',
        type: 'boolean',
    },
    {
        name: 'jsx',
        type: {
            'preserve': _ts.JsxEmit.Preserve,
            'react': _ts.JsxEmit.React,
        },
    },
    {
        name: 'listFiles',
        type: 'boolean',
    },
    {
        name: 'locale',
        type: 'string',
    },
    {
        name: 'mapRoot',
        type: 'string',
        isFilePath: true,
    },
    {
        name: 'module',
        type: {
            'commonjs': _ts.ModuleKind.CommonJS,
            'amd': _ts.ModuleKind.AMD,
            'system': _ts.ModuleKind.System,
            'umd': _ts.ModuleKind.UMD,
            //'es6': _ts.ModuleKind.ES6,
        },
    },
    {
        name: 'moduleResolution',
        type: {
            'node': _ts.ModuleResolutionKind.NodeJs,
            'classic': _ts.ModuleResolutionKind.Classic,
        },
    },
    {
        name: 'newLine',
        type: {
            'crlf': _ts.NewLineKind.CarriageReturnLineFeed,
            'lf': _ts.NewLineKind.LineFeed,
        },
    },
    {
        name: 'noEmit',
        type: 'boolean',
    },
    {
        name: 'noEmitHelpers',
        type: 'boolean',
    },
    {
        name: 'noEmitOnError',
        type: 'boolean',
    },
    {
        name: 'noImplicitAny',
        type: 'boolean',
    },
    {
        name: 'noLib',
        type: 'boolean',
    },
    {
        name: 'noResolve',
        type: 'boolean',
    },
    {
        name: 'outDir',
        type: 'string',
        isFilePath: true,
    },
    {
        name: 'outFile',
        type: 'string',
        isFilePath: true,
    },
    {
        name: 'preserveConstEnums',
        type: 'boolean',
    },
    {
        name: 'removeComments',
        type: 'boolean',
    },
    {
        name: 'rootDir',
        type: 'string',
        isFilePath: true,
    },

    {
        name: 'skipDefaultLibCheck',
        type: 'boolean',
    },
    {
        name: 'sourceMap',
        type: 'boolean',
    },
    {
        name: 'sourceRoot',
        type: 'string',
        isFilePath: true,
    },
    {
        name: 'suppressExcessPropertyErrors',
        type: 'boolean',
        experimental: true
    },
    {
        name: 'suppressImplicitAnyIndexErrors',
        type: 'boolean',
    },
    {
        name: 'stripInternal',
        type: 'boolean',
        experimental: true
    },
    {
        name: 'target',
        type: {
            'es3': _ts.ScriptTarget.ES3,
            'es5': _ts.ScriptTarget.ES5,
            'es6': _ts.ScriptTarget.ES6,
        },
    },
];

const optionsMap: _lang.Map<Option> = _lang.groupBy(optionsList, 'name');

const S_TYPESCRIPT = 'typescript';

export function parseCompilerOptions(config: Object,
                                     resolvePath: ResolvePath,
                                     notifier: _util.Notifier): _ts.CompilerOptions {
    let options: _ts.CompilerOptions = Object.create(null);

    _lang.forEach(config, (name, value) => {
        if (name in optionsMap) {
            let option = optionsMap[name];
            if (option.type === 'string') {
                if (!_lang.isString(value)) {
                    notifier.notify(`Expected string value of the config property ${q(name)}`);
                }
            }
            else if (option.type === 'number') {
                if (!_lang.isNumber(value)) {
                    notifier.notify(`Expected number value of the config property ${q(name)}`);
                }
            }
            else if (option.type === 'boolean') {
                if (!_lang.isBoolean(value)) {
                    notifier.notify(`Expected boolean value of the config property ${q(name)}`);
                }
            }
            else {
                if (value in <any>option.type) {
                    value = option.type[value];
                }
                else {
                    notifier.notify(`Unknown value ${q(value)} of the config property ${q(name)}, ` +
                        `expected one of ${Object.keys(option.type).map(q).join(', ')}`);
                }
            }

            if (option.isFilePath) {
                value = resolvePath(value);
            }

            options[name] = value;
        }
        else {
            if (name !== S_TYPESCRIPT) {
                notifier.notify(`Unknown config property ${q(name)}`);
            }
        }
    });

    if (options.rootDir == null) {
        options.rootDir = resolvePath('.');
    }

    return options;

    function q(s: string): string {
        return `'${s}'`;
    }
}

export function loadAdapter(config: Object): _adapter.Adapter {
    if (S_TYPESCRIPT in config) {
        let ts = config[S_TYPESCRIPT];
        if (!_lang.isObject(ts) || !_lang.isString(ts.version)) {
            throw new Error(`Invalid TypeScript opbect in the config property 'typescript'`);
        }
        return _adapter.load(ts);
    }
    else {
        return _adapter.load(_ts);
    }
}
