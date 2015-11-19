var S_UNDEFINED = 'undefined', S_STRING = 'string', S_NUMBER = 'number', S_BOOLEAN = 'boolean', S_OBJECT = 'object', S_FUNCTION = 'function';
function isUndefined(value) {
    return typeof value === S_UNDEFINED;
}
exports.isUndefined = isUndefined;
function isString(value) {
    return typeof value === S_STRING;
}
exports.isString = isString;
function isNumber(value) {
    return typeof value === S_NUMBER;
}
exports.isNumber = isNumber;
function isBoolean(value) {
    return typeof value === S_BOOLEAN;
}
exports.isBoolean = isBoolean;
function isObject(value) {
    return value !== null && typeof value === S_OBJECT && !Array.isArray(value);
}
exports.isObject = isObject;
function isFunction(value) {
    return typeof value === S_FUNCTION;
}
exports.isFunction = isFunction;
/**
 * Creates a new naked object, and copies own properties from the specified map, if any.
 * A naked object is an object without prototype.
 * @param map A map of properties to copy to the naked object.
 * @returns A new naked object instance.
 */
function naked(map) {
    var result = Object.create(null);
    if (isObject(map)) {
        for (var _i = 0, _a = Object.keys(map); _i < _a.length; _i++) {
            var name_1 = _a[_i];
            result[name_1] = map[name_1];
        }
    }
    return result;
}
exports.naked = naked;
function forEach(map, fn, thisArg) {
    Object.keys(map).forEach(function (key, index) {
        fn.call(thisArg, key, map[key], index, map);
    });
}
exports.forEach = forEach;
function every(map, fn, thisArg) {
    return Object.keys(map).every(function (key, index) {
        return fn.call(thisArg, key, map[key], index, map);
    });
}
exports.every = every;
function some(map, fn, thisArg) {
    return Object.keys(map).some(function (key, index) {
        return fn.call(thisArg, key, map[key], index, map);
    });
}
exports.some = some;
function map(map, fn, thisArg) {
    return mapTo(map, fn, Object.create(Object.getPrototypeOf(map)), thisArg);
}
exports.map = map;
function mapTo(map, fn, to, thisArg) {
    Object.keys(map).forEach(function (key, index) {
        to[key] = fn.call(thisArg, key, map[key], index, map);
    });
    return to;
}
exports.mapTo = mapTo;
function filter(map, fn, thisArg) {
    return filterTo(map, fn, Object.create(Object.getPrototypeOf(map)), thisArg);
}
exports.filter = filter;
function filterTo(map, fn, to, thisArg) {
    Object.keys(map).forEach(function (key, index) {
        if (fn.call(thisArg, key, map[key], index, map)) {
            to[key] = map[key];
        }
    });
    return to;
}
exports.filterTo = filterTo;
function clone(source) {
    var result = Object.create(Object.getPrototypeOf(source));
    Object.getOwnPropertyNames(source).forEach(function (name) {
        Object.defineProperty(result, name, Object.getOwnPropertyDescriptor(source, name));
    });
    return result;
}
exports.clone = clone;
