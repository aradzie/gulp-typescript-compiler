var M1;
(function (M1) {
    function test(id) {
        console.log("internal module1 called from " + id);
    }
    M1.test = test;
})(M1 || (M1 = {}));
//# sourceMappingURL=internal1.js.map