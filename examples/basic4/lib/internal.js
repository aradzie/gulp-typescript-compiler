var M1;
(function (M1) {
    function test(id) {
        console.log("internal module1 called from " + id);
    }
    M1.test = test;
})(M1 || (M1 = {}));
var M2;
(function (M2) {
    function test(id) {
        console.log("internal module2 called from " + id);
    }
    M2.test = test;
})(M2 || (M2 = {}));
//# sourceMappingURL=internal.js.map