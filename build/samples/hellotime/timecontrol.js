define(["require", "exports", "../../iris"], function (require, exports, iris) {
    var dateTime;
    function init() {
        dateTime = document.getElementById("dateTime");
        iris.register("dateTimeUpdated", function (msg) {
            dateTime.innerText = msg.toString();
        });
    }
    exports.init = init;
});
