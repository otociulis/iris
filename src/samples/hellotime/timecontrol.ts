import iris = require("../../iris");

var dateTime: HTMLElement;

export function init() {
	dateTime = document.getElementById("dateTime");
	
	iris.register("dateTimeUpdated", msg => {
		dateTime.innerText = msg.toString();
	})
}