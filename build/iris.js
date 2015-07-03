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
    var Message = (function () {
        function Message(childNames) {
            this._childNames = childNames;
            var registered = false;
            var self = this;
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
        return Message;
    })();
    exports.Message = Message;
    var _callbacks = [];
    var _hierarchy = [];
    ;
    function register(messageType, options, callback) {
        var haveOptions = (typeof options !== "undefined" && options !== null);
        _callbacks.push(new Reference(messageType, haveOptions ? options.registerForSubclasses : false, callback, haveOptions ? options.thisArg : null));
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
    function send(message) {
        var hier = null;
        _hierarchy.forEach(function (x) {
            hier = x[x.length - 1] === message.type ? x : hier;
        });
        if (null != hier) {
            console.log("Sending message " + message.type + ": " + message.description);
            _callbacks.forEach(function (c) {
                var typesToCheck = c.registerForSubclasses ? hier : hier.slice(hier.length - 1, hier.length);
                typesToCheck.forEach(function (messageType) {
                    if (c.messageType === messageType) {
                        if (c.parentObject == null) {
                            c.callback(message);
                        }
                        else {
                            c.callback.bind(c.parentObject)(message);
                        }
                    }
                });
            });
        }
        else {
            console.log("No such message registered: " + message.type);
        }
    }
    exports.send = send;
});
