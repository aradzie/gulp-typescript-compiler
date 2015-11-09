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
 * Returns an array of property name/value pairs.
 * @param map A map object.
 * @returns An array of property name/value pairs.
 */
function properties(map) {
    var result = [];
    forEach(map, function (key, value) {
        result.push({ name: key, value: value });
    });
    return result;
}
exports.properties = properties;
/**
 * Returns array of object property values.
 * @param map A map object.
 * @returns An array of property values.
 */
function values(map) {
    var result = [];
    forEach(map, function (key, value) {
        result.push(value);
    });
    return result;
}
exports.values = values;
/**
 * Convert a list of objects to a map.
 * @param list A list of objects with a specified grouping property.
 * @param name Grouping property name.
 * @returns A map of objects grouped by the key value.
 */
function groupBy(list, name) {
    var result = Object.create(null);
    for (var _i = 0; _i < list.length; _i++) {
        var value = list[_i];
        result[value[name]] = value;
    }
    return result;
}
exports.groupBy = groupBy;
/**
 * Creates a new naked object, and copies own properties from the specified map, if any.
 * A naked object is an object without prototype.
 * @param map A map of properties to copy to the naked object.
 * @returns A new naked object instance.
 */
function naked(map) {
    var result = Object.create(null);
    if (isObject(map)) {
        for (var name_1 in map) {
            if (Object.prototype.hasOwnProperty.call(map, name_1)) {
                result[name_1] = map[name_1];
            }
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
