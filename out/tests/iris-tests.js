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
    function MyMessage(_paramOne, childNames) {
        if (childNames === void 0) { childNames = []; }
        _super.call(this, _super.prototype.derive.call(this, childNames, MyMessage.name));
        this._paramOne = _paramOne;
    }
    Object.defineProperty(MyMessage.prototype, "description", {
        get: function () {
            return this.paramOne.toString();
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(MyMessage.prototype, "paramOne", {
        get: function () {
            return this._paramOne;
        },
        enumerable: true,
        configurable: true
    });
    MyMessage.name = "MyMessage";
    return MyMessage;
})(iris.Message);
var MyDerivedMessage = (function (_super) {
    __extends(MyDerivedMessage, _super);
    function MyDerivedMessage(_paramOne, _paramTwo, childNames) {
        if (childNames === void 0) { childNames = []; }
        _super.call(this, _paramOne, _super.prototype.derive.call(this, childNames, MyDerivedMessage.name));
        this._paramTwo = _paramTwo;
    }
    Object.defineProperty(MyDerivedMessage.prototype, "description", {
        get: function () {
            return [this.paramOne.toString(), this.paramTwo.toString()].join();
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(MyDerivedMessage.prototype, "paramTwo", {
        get: function () {
            return this._paramTwo;
        },
        enumerable: true,
        configurable: true
    });
    MyDerivedMessage.name = "MyDerivedMessage";
    return MyDerivedMessage;
})(MyMessage);
var Target = (function () {
    function Target() {
        iris.register(MyMessage.name, { thisArg: this }, this.OnMyMessage);
        iris.register(MyDerivedMessage.name, { thisArg: this, registerForSubclasses: true }, this.OnMyMessageOrDerived);
        iris.register(MyDerivedMessage.name, { thisArg: this }, this.OnMyDerivedMessage);
    }
    Object.defineProperty(Target.prototype, "lastMyMessage", {
        get: function () {
            return this._lastMyMessage;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Target.prototype, "lastMyMessageOrDerived", {
        get: function () {
            return this._lastMyMessageOrDerived;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Target.prototype, "lastMyDerivedMessage", {
        get: function () {
            return this._lastMyDerivedMessage;
        },
        enumerable: true,
        configurable: true
    });
    Target.prototype.OnMyMessage = function (msg) {
        this._lastMyMessage = msg;
    };
    Target.prototype.OnMyDerivedMessage = function (msg) {
        this._lastMyDerivedMessage = msg;
    };
    Target.prototype.OnMyMessageOrDerived = function (msg) {
        this._lastMyMessageOrDerived = msg;
    };
    return Target;
})();
describe('Iris', function () {
    it("Correctly handle message type", function () {
        var message = new MyDerivedMessage(false, 1);
        should.equal(message.type, "MyDerivedMessage");
        should.equal(message.description, "false,1");
    }), it("Doesn't receive messages after unregister all", function () {
        var receivedMessage = null;
        iris.register(MyMessage.name, null, function (msg) {
            receivedMessage = msg;
        });
        iris.unregister();
        iris.send(new MyMessage(true));
        should.equal(receivedMessage, null);
    }), describe('Registration without target object', function () {
        it('does receive direct message', function () {
            var receivedMessage = null;
            iris.register(MyMessage.name, null, function (msg) {
                receivedMessage = msg;
            });
            iris.send(new MyMessage(true));
            iris.unregister();
            should.notEqual(receivedMessage, null);
        }), it("doesn't receive direct message after unregistrering", function () {
            var receivedMessage = null;
            iris.register(MyMessage.name, null, function (msg) {
                receivedMessage = msg;
            });
            iris.unregister(MyMessage.name);
            iris.send(new MyMessage(true));
            should.equal(receivedMessage, null);
        }), it("doesn't receive derived message if not subscribed", function () {
            var receivedMessage = null;
            iris.register(MyMessage.name, null, function (msg) {
                receivedMessage = msg;
            });
            iris.send(new MyDerivedMessage(true, 1));
            iris.unregister();
            should.equal(receivedMessage, null);
        }), it("does receive derived message if subscribed", function () {
            var receivedMessage = null;
            iris.register(MyMessage.name, { registerForSubclasses: true }, function (msg) {
                receivedMessage = msg;
            });
            iris.send(new MyDerivedMessage(true, 1));
            iris.unregister();
            should.notEqual(receivedMessage, null);
        });
    }), describe('Registration with target object', function () {
        it('does receive direct message', function () {
            var target = new Target();
            iris.send(new MyMessage(true));
            iris.unregister();
            should.notEqual(target.lastMyMessage, null);
        }), it("doesn't receive direct message after unregistrering message", function () {
            var target = new Target();
            iris.unregister(MyMessage.name);
            iris.send(new MyMessage(true));
            should.equal(target.lastMyMessage, null);
        }), it("doesn't receive direct message after unregistrering target", function () {
            var target = new Target();
            iris.unregister(target);
            iris.send(new MyMessage(true));
            should.equal(target.lastMyMessage, null);
        }), it("doesn't receive derived message if not subscribed", function () {
            var target = new Target();
            iris.send(new MyDerivedMessage(true, 1));
            iris.unregister();
            should.equal(target.lastMyMessage, null);
        }), it("does receive derived message if subscribed", function () {
            var target = new Target();
            iris.send(new MyDerivedMessage(true, 1));
            iris.unregister();
            should.notEqual(target.lastMyMessageOrDerived, null);
        });
    });
});
