import iris = require("../../iris");

var intervalId: Number;

export function start() {
  intervalId = window.setInterval(function() {
      iris.send("dateTimeUpdated", new Date());
  }, 1000);
}