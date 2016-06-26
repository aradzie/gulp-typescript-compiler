/// <reference path="globals/chalk/index.d.ts" />
/// <reference path="globals/chokidar/index.d.ts" />
/// <reference path="globals/glob/index.d.ts" />
/// <reference path="globals/gulp-util/index.d.ts" />
/// <reference path="globals/lodash/index.d.ts" />
/// <reference path="globals/minimatch/index.d.ts" />
/// <reference path="globals/node/index.d.ts" />
/// <reference path="globals/semver/index.d.ts" />
/// <reference path="globals/source-map/index.d.ts" />
/// <reference path="globals/tape/index.d.ts" />
/// <reference path="globals/through2/index.d.ts" />
/// <reference path="globals/vinyl/index.d.ts" />

interface String {
    startsWith(needle: string, position?: number): boolean;
    endsWith(needle: string, position?: number): boolean;
    includes(needle: string, position?: number): boolean;
}

interface Array<T> {
    includes(needle: T, position?: number): boolean;
}

interface NumberConstructor {
    EPSILON: number;
    MIN_SAFE_INTEGER: number;
    MAX_SAFE_INTEGER: number;
    parseFloat(string: string);
    parseInt(string: string, radix?: number);
    isNaN(number: number): boolean;
    isFinite(number: number): boolean;
    isInteger(number: number): boolean;
    isSafeInteger(number: number): boolean;
}

interface ObjectConstructor {
    assign(target: any, ...sources: any[]): any;
}

interface ArrayConstructor {
    from<T, U>(arrayLike: ArrayLike<T>, mapfn: (v: T, k: number) => U, thisArg?: any): Array<U>;
    from<T>(arrayLike: ArrayLike<T>): Array<T>;
    of<T>(...items: T[]): Array<T>;
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
