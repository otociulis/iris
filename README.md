![Travis CI](https://travis-ci.org/otociulis/iris.svg?branch=master)
[![Coverage Status](https://coveralls.io/repos/otociulis/iris/badge.svg?branch=master)](https://coveralls.io/r/otociulis/iris?branch=master)

# Overview

Iris is a simple message dispatch framework intendent to support message driven development in Javascript. Main idea behind message driven development is that application components communicate together via well-defined, immutable messages instead of calling methods on each other.

For example, sample application (see [HelloTime](./build/samples/hellotime) sample) wishes to display current date and time in HTML web page. In this case we can identify two components: 

* date publishing component sending new date and time in regular intervals
* rendering component displaying date and time in user format

Date publishing component ([datetimeserver.js](./build/samples/hellotime/datetimeserver.js)):

```javascript
  var iris = require("iris");
    
  window.setInterval(function() {
      iris.send("dateTimeUpdated", new Date());
  }, 1000);
```

Rendering component ([timecontrol.js](./build/samples/hellotime/timecontrol.js)):

```javascript
  var iris = require("iris");
  
  iris.register("dateTimeUpdated", function(date) {
    document.getElementById("dateTime").innerText = date.toString();
  });
```

This approach allows very loosely tied component development which automatically allow good unit testing since there are essentially no ties between components; furthermore it's very easy to remove or add new components without affecting the functionality of the remaining components.

# API

At core API consist of three methods:

* register - registers for message
* send - sends the message
* unregister - unregisters receiver of message or message type

All methods returns `iris` object allowing to chain requests; usefull when multiple `register` or `send` calls are needed:

```javascript
  iris.register("MyMessage", OnMyMessage)
      .register("MyDerivedMessage", OnMyMessageOrDerived);
```

## Function register

```javascript
  function register(type, callback);
```

Parameters:
* `type`: string -name of the message to register for
* `callback`: Function - callback method to be invoked when message arrives. Callback method will receive one parameter with arguments sent by `send` function

```javascript
  function register(options, callback);
```

Parameters:
* `options` - object allowing to fine-tune the behavior:
  * `type`: string - name of the message to register for
  * `registerForSubclasses`: boolean - indicates if `callback` should receive also messages derived from `type`
  * `thisArg`: any - used to `bind` the call to `callback` to other object. Usefull when defining callback inside other class (see below for example)
* `callback`: Function - callback method to be invoked when message arrives. Callback method will receive one parameter with arguments sent by `send` function

To bind callback in other object use `thisArg` parameter:

```javascript

var Target = (function () {
    function Target() {
        iris.register({ type: MyMessage.name, thisArg: this }, this.OnMyMessage);
    }
    
    function OnMyMessage(msg) {
        // this will be correct context - instance of class Target
    }
}

```

## Function send

```javascript
  function send(type, body);
```

Parameters:
* `type`: string - name of the message to send
* `body`: any - object to be sent

```javascript
  function send(options);
```
Parameters:
* `options` - object allowing to fine-tune the behavior:
  * `type`: string - name of the message to send
  * `isLogging`: boolean - indicates if message should be logged; usefull for performance improvements when particular message is sent many times
  * `description`: string - additional information to be logged (e.g. context information)

## Function unregister

```javascript
  function unregister(type);
```

Parameters:
* `type`: string - name of the message to unregister from all receivers

```javascript
  function unregister(obj);
```

This call works only for messages registered using `thisArg` option.

Parameters:
* `obj`: any - instance of object from which to unregister all messages.

```javascript
  function unregister();
```

Unregisters all messages and all receivers.



