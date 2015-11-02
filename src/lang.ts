export interface Map<T> {
    [name: string]: T;
}

const S_UNDEFINED = 'undefined',
    S_STRING = 'string',
    S_NUMBER = 'number',
    S_BOOLEAN = 'boolean',
    S_OBJECT = 'object',
    S_FUNCTION = 'function';

export function isUndefined(value): boolean {
    return typeof value === S_UNDEFINED;
}

export function isString(value): value is string {
    return typeof value === S_STRING;
}

export function isNumber(value): value is number {
    return typeof value === S_NUMBER;
}

export function isBoolean(value): value is boolean {
    return typeof value === S_BOOLEAN;
}

export function isObject(value): value is Object {
    return value !== null && typeof value === S_OBJECT && !Array.isArray(value);
}

export function isFunction(value): value is Function {
    return typeof value === S_FUNCTION;
}

/**
 * Returns an array of property name/value pairs.
 * @param map A map object.
 * @returns An array of property name/value pairs.
 */
export function properties<T>(map: Object): { name: string; value: T; }[] {
    let result = [];
    forEach(map, (key, value) => {
        result.push({ name: key, value: value });
    });
    return result;
}

/**
 * Returns array of object property values.
 * @param map A map object.
 * @returns An array of property values.
 */
export function values<T>(map: Object): T[] {
    let result = [];
    forEach(map, (key, value) => {
        result.push(value);
    });
    return result;
}

/**
 * Convert a list of objects to a map.
 * @param list A list of objects with a specified grouping property.
 * @param name Grouping property name.
 * @returns A map of objects grouped by the key value.
 */
export function groupBy<T>(list: T[], name: string): Map<T> {
    let result = Object.create(null);
    for (let value of list) {
        result[value[name]] = value;
    }
    return result;
}

/**
 * Creates a new naked object, and copies own properties from the specified map, if any.
 * A naked object is an object without prototype.
 * @param map A map of properties to copy to the naked object.
 * @returns A new naked object instance.
 */
export function naked<T>(map?: T): T {
    let result = Object.create(null);
    if (isObject(map)) {
        for (let name in map) {
            if (Object.prototype.hasOwnProperty.call(map, name)) {
                result[name] = map[name];
            }
        }
    }
    return result;
}

export function forEach<T extends Object>(map: T, fn: (key: string, value: any, index: number, map: T) => void, thisArg?: any): void {
    Object.keys(map).forEach((key, index) => {
        fn.call(thisArg, key, map[key], index, map);
    });
}

export function every<T extends Object>(map: T, fn: (key: string, value: any, index: number, map: T) => boolean, thisArg?: any): boolean {
    return Object.keys(map).every((key, index) => {
        return fn.call(thisArg, key, map[key], index, map);
    });
}

export function some<T extends Object>(map: T, fn: (key: string, value: any, index: number, map: T) => boolean, thisArg?: any): boolean {
    return Object.keys(map).some((key, index) => {
        return fn.call(thisArg, key, map[key], index, map);
    });
}

export function map<T extends Object>(map: T, fn: (key: string, value: any, index: number, map: T) => any, thisArg?: any): T {
    return mapTo(map, fn, Object.create(Object.getPrototypeOf(map)), thisArg);
}

export function mapTo<T extends Object>(map: T, fn: (key: string, value: any, index: number, map: T) => any, to: T, thisArg?: any): T {
    Object.keys(map).forEach((key, index) => {
        to[key] = fn.call(thisArg, key, map[key], index, map);
    });
    return to;
}

export function filter<T extends Object>(map: T, fn: (key: string, value: any, index: number, map: T) => boolean, thisArg?: any): T {
    return filterTo(map, fn, Object.create(Object.getPrototypeOf(map)), thisArg);
}

export function filterTo<T extends Object>(map: T, fn: (key: string, value: any, index: number, map: T) => boolean, to: T, thisArg?: any): T {
    Object.keys(map).forEach((key, index) => {
        if (fn.call(thisArg, key, map[key], index, map)) {
            to[key] = map[key];
        }
    });
    return to;
}

export function clone<T extends Object>(source: T): T {
    let result = Object.create(Object.getPrototypeOf(source));
    Object.getOwnPropertyNames(source).forEach((name) => {
        Object.defineProperty(result, name, Object.getOwnPropertyDescriptor(source, name));
    });
    return result;
}
