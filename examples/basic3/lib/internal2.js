var M2;
(function (M2) {
    function test(id) {
        console.log("internal module2 called from " + id);
    }
    M2.test = test;
})(M2 || (M2 = {}));
//# sourceMappingURL=internal2.js.map