"use strict";
define(["require", "exports"], function (require, exports) {
    var Reference = (function () {
        function Reference(messageType, registerForSubclasses, callback, parentObject) {
            if (parentObject === void 0) { parentObject = null; }
            this.messageType = messageType;
            this.registerForSubclasses = registerForSubclasses;
            this.callback = callback;
            this.parentObject = parentObject;
        }
        return Reference;
    })();
    ;
    var Message = (function () {
        function Message(childNames) {
            this._childNames = childNames;
            var self = this;
            var registered = false;
            _hierarchy.forEach(function (x) {
                registered = x[x.length - 1] === self.type ? true : registered;
            });
            if (!registered) {
                _hierarchy.push(childNames);
            }
        }
        Message.prototype.derive = function (childNames, name) {
            var result = childNames.slice(0);
            result.splice(0, 0, name);
            return result;
        };
        Object.defineProperty(Message.prototype, "type", {
            get: function () {
                return this._childNames[this._childNames.length - 1];
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Message.prototype, "description", {
            get: function () {
                return "";
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Message.prototype, "isLogging", {
            get: function () {
                return true;
            },
            enumerable: true,
            configurable: true
        });
        return Message;
    })();
    exports.Message = Message;
    var _callbacks = [];
    var _hierarchy = [];
    exports.options = {
        logError: function (message) {
            console.log(message);
        },
        logMessage: function (message) {
            console.log(message);
        }
    };
    function register(message, callback) {
        var msg = typeof message === "string" ? { type: message } : message;
        _callbacks.push(new Reference(msg.type, msg.registerForSubclasses || false, callback, msg.thisArg || null));
    }
    exports.register = register;
    function unregister(messageTypeOrTarget) {
        if (messageTypeOrTarget === void 0) { messageTypeOrTarget = undefined; }
        if (typeof messageTypeOrTarget === "undefined" || messageTypeOrTarget === null) {
            _callbacks = [];
        }
        else {
            var messageIndex = -1;
            do {
                messageIndex = -1;
                _callbacks.forEach(function (c, index) {
                    if (c.messageType == messageTypeOrTarget || c.parentObject == messageTypeOrTarget) {
                        messageIndex = index;
                    }
                });
                if (messageIndex != -1) {
                    _callbacks.splice(messageIndex, 1);
                }
            } while (messageIndex != -1);
        }
    }
    exports.unregister = unregister;
    function send(message, body) {
        var hier = null;
        var haveBody = typeof body !== "undefined";
        var msg;
        if (typeof message === "string") {
            msg = { type: message, isLogging: true, description: null };
            hier = [message];
        }
        else {
            msg = message;
            _hierarchy.forEach(function (x) {
                hier = x[x.length - 1] === msg.type ? x : hier;
            });
        }
        if (null != hier) {
            if (msg.isLogging) {
                exports.options.logMessage("Sending message " + msg.type + ": " + msg.description);
            }
            _callbacks.forEach(function (c) {
                var typesToCheck = c.registerForSubclasses ? hier : hier.slice(hier.length - 1, hier.length);
                typesToCheck.forEach(function (messageType) {
                    if (c.messageType === messageType) {
                        if (c.parentObject == null) {
                            c.callback(haveBody ? body : message);
                        }
                        else {
                            c.callback.bind(c.parentObject)(haveBody ? body : message);
                        }
                    }
                });
            });
        }
        else {
            exports.options.logError("No such message registered: " + msg.type);
        }
    }
    exports.send = send;
});
