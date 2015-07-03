/// <reference path="../../typings/mocha/mocha.d.ts" />
/// <reference path="../../typings/should/should.d.ts" />
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var should = require("should");
var iris = require("../iris");
var MyMessage = (function (_super) {
    __extends(MyMessage, _super);
    function MyMessage() {
        _super.apply(this, arguments);
    }
    return MyMessage;
})(iris.Message);
describe('Array', function () {
    describe('#indexOf()', function () {
        it('should return -1 when the value is not present', function () {
            should.equal(-1, [1, 2, 3].indexOf(5));
            should.equal(-1, [1, 2, 3].indexOf(0));
        });
    });
});
