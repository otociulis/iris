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

