(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";
function test(id) {
    console.log("external module1 called from " + id);
}
exports.test = test;
console.log('external module1 loaded');

},{}],2:[function(require,module,exports){
"use strict";
function test(id) {
    console.log("external module2 called from " + id);
}
exports.test = test;
console.log('external module2 loaded');

},{}],3:[function(require,module,exports){
"use strict";
var E1 = require("./external1");
var E2 = require("./external2");
var id = 'main';
function main() {
    E1.test(id);
    E2.test(id);
}
console.log(id + " loaded");
main();

},{"./external1":1,"./external2":2}]},{},[3])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIuLi9zcmMvZXh0ZXJuYWwxLnRzIiwiLi4vc3JjL2V4dGVybmFsMi50cyIsIi4uL3NyYy9tYWluLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOztBQ0FBLGNBQXFCLEVBQVU7SUFDM0IsT0FBTyxDQUFDLEdBQUcsQ0FBQyxrQ0FBZ0MsRUFBSSxDQUFDLENBQUM7QUFDdEQsQ0FBQztBQUZELG9CQUVDO0FBRUQsT0FBTyxDQUFDLEdBQUcsQ0FBQyx5QkFBeUIsQ0FBQyxDQUFDOzs7O0FDSnZDLGNBQXFCLEVBQVU7SUFDM0IsT0FBTyxDQUFDLEdBQUcsQ0FBQyxrQ0FBZ0MsRUFBSSxDQUFDLENBQUM7QUFDdEQsQ0FBQztBQUZELG9CQUVDO0FBRUQsT0FBTyxDQUFDLEdBQUcsQ0FBQyx5QkFBeUIsQ0FBQyxDQUFDOzs7O0FDSnZDLGdDQUFrQztBQUNsQyxnQ0FBa0M7QUFFbEMsSUFBTSxFQUFFLEdBQUcsTUFBTSxDQUFDO0FBRWxCO0lBQ0ksRUFBRSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQztJQUNaLEVBQUUsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUM7QUFDaEIsQ0FBQztBQUVELE9BQU8sQ0FBQyxHQUFHLENBQUksRUFBRSxZQUFTLENBQUMsQ0FBQztBQUU1QixJQUFJLEVBQUUsQ0FBQyIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJleHBvcnQgZnVuY3Rpb24gdGVzdChpZDogc3RyaW5nKSB7XG4gICAgY29uc29sZS5sb2coYGV4dGVybmFsIG1vZHVsZTEgY2FsbGVkIGZyb20gJHtpZH1gKTtcbn1cblxuY29uc29sZS5sb2coJ2V4dGVybmFsIG1vZHVsZTEgbG9hZGVkJyk7XG4iLCJleHBvcnQgZnVuY3Rpb24gdGVzdChpZDogc3RyaW5nKSB7XG4gICAgY29uc29sZS5sb2coYGV4dGVybmFsIG1vZHVsZTIgY2FsbGVkIGZyb20gJHtpZH1gKTtcbn1cblxuY29uc29sZS5sb2coJ2V4dGVybmFsIG1vZHVsZTIgbG9hZGVkJyk7XG4iLCJpbXBvcnQgKiBhcyBFMSBmcm9tICcuL2V4dGVybmFsMSc7XG5pbXBvcnQgKiBhcyBFMiBmcm9tICcuL2V4dGVybmFsMic7XG5cbmNvbnN0IGlkID0gJ21haW4nO1xuXG5mdW5jdGlvbiBtYWluKCkge1xuICAgIEUxLnRlc3QoaWQpO1xuICAgIEUyLnRlc3QoaWQpO1xufVxuXG5jb25zb2xlLmxvZyhgJHtpZH0gbG9hZGVkYCk7XG5cbm1haW4oKTtcbiJdfQ==
