/*global module, window*/
module.exports = function(target) {
	if (!window) {
		return;
	}
	var customEvent,
		type = 'click',
		bubbles = true, //all mouse events bubble
		cancelable = false,
		view = window,
		detail = 1,  //number of mouse clicks must be at least one
		screenX = 0,
		screenY = 0,
		clientX = 0,
		clientY = 0,
		ctrlKey = false,
		altKey = false,
		shiftKey = false,
		metaKey = false,
		button = 0,
		relatedTarget = null;

	if (window.document.createEvent) {
		customEvent = window.document.createEvent('MouseEvents');
		customEvent.initMouseEvent(type, bubbles, cancelable, view, detail,
								 screenX, screenY, clientX, clientY,
								 ctrlKey, altKey, shiftKey, metaKey,
								 button, relatedTarget);
		//fire the event
		target.dispatchEvent(customEvent);

	}
	else if (window.document.createEventObject) { //IE
		//create an IE event object
		customEvent = window.document.createEventObject();
		//assign available properties
		customEvent.bubbles = bubbles;
		customEvent.cancelable = cancelable;
		customEvent.view = view;
		customEvent.detail = detail;
		customEvent.screenX = screenX;
		customEvent.screenY = screenY;
		customEvent.clientX = clientX;
		customEvent.clientY = clientY;
		customEvent.ctrlKey = ctrlKey;
		customEvent.altKey = altKey;
		customEvent.metaKey = metaKey;
		customEvent.shiftKey = shiftKey;
		//fix button property for IE's wacky implementation
		switch(button){
			case 0:
				customEvent.button = 1;
				break;
			case 1:
				customEvent.button = 4;
				break;
			case 2:
				//leave as is
				break;
			default:
				customEvent.button = 0;
		}
		customEvent.relatedTarget = relatedTarget;
		//fire the event
		target.fireEvent('onclick', customEvent);
	}
};
