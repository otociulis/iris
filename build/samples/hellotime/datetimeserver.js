define(["require", "exports", "../../iris"], function (require, exports, iris) {
    var intervalId;
    function start() {
        intervalId = window.setInterval(function () {
            iris.send("dateTimeUpdated", new Date());
        }, 1000);
    }
    exports.start = start;
});
