/// <reference path="./internal1.ts"/>
/// <reference path="./internal2.ts"/>
"use strict";
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
//# sourceMappingURL=main.js.map