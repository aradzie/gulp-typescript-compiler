(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
function test(id) {
    console.log("external module1 called from " + id);
}
exports.test = test;
console.log('external module1 loaded');

},{}],2:[function(require,module,exports){
function test(id) {
    console.log("external module2 called from " + id);
}
exports.test = test;
console.log('external module2 loaded');

},{}],3:[function(require,module,exports){
/// <reference path="./internal1.ts"/>
/// <reference path="./internal2.ts"/>
var E1 = require('./external1');
var E2 = require('./external2');
var id = 'main';
function main() {
    E1.test(id);
    E2.test(id);
    M1.test(id);
    M2.test(id);
}
console.log(id + " loaded");
main();

},{"./external1":1,"./external2":2}]},{},[3])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJleHRlcm5hbDEudHMiLCJleHRlcm5hbDIudHMiLCJtYWluLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUEsY0FBcUIsRUFBVTtJQUMzQixPQUFPLENBQUMsR0FBRyxDQUFDLGtDQUFnQyxFQUFJLENBQUMsQ0FBQztBQUN0RCxDQUFDO0FBRmUsWUFBSSxPQUVuQixDQUFBO0FBRUQsT0FBTyxDQUFDLEdBQUcsQ0FBQyx5QkFBeUIsQ0FBQyxDQUFDOzs7QUNKdkMsY0FBcUIsRUFBVTtJQUMzQixPQUFPLENBQUMsR0FBRyxDQUFDLGtDQUFnQyxFQUFJLENBQUMsQ0FBQztBQUN0RCxDQUFDO0FBRmUsWUFBSSxPQUVuQixDQUFBO0FBRUQsT0FBTyxDQUFDLEdBQUcsQ0FBQyx5QkFBeUIsQ0FBQyxDQUFDOzs7QUNKdkMsc0NBQXNDO0FBQ3RDLHNDQUFzQztBQUV0QyxJQUFZLEVBQUUsV0FBTSxhQUFhLENBQUMsQ0FBQTtBQUNsQyxJQUFZLEVBQUUsV0FBTSxhQUFhLENBQUMsQ0FBQTtBQUVsQyxJQUFNLEVBQUUsR0FBRyxNQUFNLENBQUM7QUFFbEI7SUFDSSxFQUFFLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDO0lBQ1osRUFBRSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQztJQUNaLEVBQUUsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUM7SUFDWixFQUFFLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDO0FBQ2hCLENBQUM7QUFFRCxPQUFPLENBQUMsR0FBRyxDQUFJLEVBQUUsWUFBUyxDQUFDLENBQUM7QUFFNUIsSUFBSSxFQUFFLENBQUMiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiZXhwb3J0IGZ1bmN0aW9uIHRlc3QoaWQ6IHN0cmluZykge1xuICAgIGNvbnNvbGUubG9nKGBleHRlcm5hbCBtb2R1bGUxIGNhbGxlZCBmcm9tICR7aWR9YCk7XG59XG5cbmNvbnNvbGUubG9nKCdleHRlcm5hbCBtb2R1bGUxIGxvYWRlZCcpO1xuIiwiZXhwb3J0IGZ1bmN0aW9uIHRlc3QoaWQ6IHN0cmluZykge1xuICAgIGNvbnNvbGUubG9nKGBleHRlcm5hbCBtb2R1bGUyIGNhbGxlZCBmcm9tICR7aWR9YCk7XG59XG5cbmNvbnNvbGUubG9nKCdleHRlcm5hbCBtb2R1bGUyIGxvYWRlZCcpO1xuIiwiLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4vaW50ZXJuYWwxLnRzXCIvPlxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4vaW50ZXJuYWwyLnRzXCIvPlxuXG5pbXBvcnQgKiBhcyBFMSBmcm9tICcuL2V4dGVybmFsMSc7XG5pbXBvcnQgKiBhcyBFMiBmcm9tICcuL2V4dGVybmFsMic7XG5cbmNvbnN0IGlkID0gJ21haW4nO1xuXG5mdW5jdGlvbiBtYWluKCkge1xuICAgIEUxLnRlc3QoaWQpO1xuICAgIEUyLnRlc3QoaWQpO1xuICAgIE0xLnRlc3QoaWQpO1xuICAgIE0yLnRlc3QoaWQpO1xufVxuXG5jb25zb2xlLmxvZyhgJHtpZH0gbG9hZGVkYCk7XG5cbm1haW4oKTtcbiJdfQ==
