define(["require", "exports", "datetimeserver", "timecontrol"], function (require, exports, datetimeserver, timecontrol) {
    timecontrol.init();
    datetimeserver.start();
});
