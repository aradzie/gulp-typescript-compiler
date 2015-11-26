/// <reference path="chalk/chalk.d.ts" />
/// <reference path="chokidar/chokidar.d.ts" />
/// <reference path="glob/glob.d.ts" />
/// <reference path="gulp-util/gulp-util.d.ts" />
/// <reference path="lodash/lodash.d.ts" />
/// <reference path="minimatch/minimatch.d.ts" />
/// <reference path="node/node.d.ts" />
/// <reference path="semver/semver.d.ts" />
/// <reference path="source-map/source-map.d.ts" />
/// <reference path="tape/tape.d.ts" />
/// <reference path="through2/through2.d.ts" />
/// <reference path="vinyl/vinyl.d.ts" />

interface String {
    startsWith(needle: string, position?: number): boolean;
    endsWith(needle: string, position?: number): boolean;
    includes(needle: string, position?: number): boolean;
}

interface Array<T> {
    includes(needle: T, position?: number): boolean;
}

interface PromiseLike<T> {
    then<TResult>(onfulfilled?: (value: T) => TResult | PromiseLike<TResult>, onrejected?: (reason: any) => TResult | PromiseLike<TResult>): PromiseLike<TResult>;
    then<TResult>(onfulfilled?: (value: T) => TResult | PromiseLike<TResult>, onrejected?: (reason: any) => void): PromiseLike<TResult>;
}

interface Promise<T> {
    then<TResult>(onfulfilled?: (value: T) => TResult | PromiseLike<TResult>, onrejected?: (reason: any) => TResult | PromiseLike<TResult>): Promise<TResult>;
    then<TResult>(onfulfilled?: (value: T) => TResult | PromiseLike<TResult>, onrejected?: (reason: any) => void): Promise<TResult>;
    catch(onrejected?: (reason: any) => T | PromiseLike<T>): Promise<T>;
    catch(onrejected?: (reason: any) => void): Promise<T>;
    //[Symbol.toStringTag]: string;
}

interface PromiseConstructor {
    prototype: Promise<any>;
    new <T>(executor: (resolve: (value?: T | PromiseLike<T>) => void, reject: (reason?: any) => void) => void): Promise<T>;
    all<T>(values: (T | PromiseLike<T>)[]): Promise<T[]>;
    race<T>(values: (T | PromiseLike<T>)[]): Promise<T>;
    reject(reason: any): Promise<void>;
    reject<T>(reason: any): Promise<T>;
    resolve<T>(value: T | PromiseLike<T>): Promise<T>;
    resolve(): Promise<void>;
    //[Symbol.species]: Function;
}

declare var Promise: PromiseConstructor;
