/**
Browserify implementation of NodeJS Events module.

This is for *documentation purposes only*.

The information herein was taken from NodeJS documentation and reformatted in JSDoc format.

Many objects in Node emit events: a net.Server emits an event each time a peer connects to it, a fs.readStream emits an event when the file is opened. All objects which emit events are instances of events.EventEmitter. You can access this module by doing: require("events");

Typically, event names are represented by a camel-cased string, however, there aren't any strict restrictions on that, as any string will be accepted.

Functions can then be attached to objects, to be executed when an event is emitted. These functions are called listeners. Inside a listener function, this refers to the EventEmitter that the listener was attached to.

@module Browserify
@submodule Events
*/

/**
To access the EventEmitter class, require('events').EventEmitter.

When an EventEmitter instance experiences an error, the typical action is to emit an 'error' event. Error events are treated as a special case in node. If there is no listener for it, then the default action is to print a stack trace and exit the program.

All EventEmitters emit the event 'newListener' when new listeners are added and 'removeListener' when a listener is removed.

@class EventEmitter

*/

/**
Adds a listener to the end of the listeners array for the specified event. No checks are made to see if the listener has already been added. Multiple calls passing the same combination of event and listener will result in the listener being added multiple times.

@example
	server.addListener('connection', function (stream) {
	  console.log('someone connected!');
	});

Returns emitter, so calls can be chained.

@method addListener
@param name {String} Identifier of the event to subscribe to
@param listener {Function} Callback function to receive the event
@chainable
*/
/**
Adds a listener to the end of the listeners array for the specified event. No checks are made to see if the listener has already been added. Multiple calls passing the same combination of event and listener will result in the listener being added multiple times.

@example
	server.on('connection', function (stream) {
	  console.log('someone connected!');
	});

Returns emitter, so calls can be chained.

@method on
@param name {String} Identifier of the event to subscribe to
@param listener {Function} Callback function to receive the event
@chainable
*/
/**
Adds a one time listener for the event. This listener is invoked only the next time the event is fired, after which it is removed.

@example
	server.once('connection', function (stream) {
	  console.log('Ah, we have our first user!');
	});

Returns emitter, so calls can be chained.

@method once
@param name {String} Identifier of the event to subscribe to
@param listener {Function} Callback function to receive the event
@chainable
*/
/**
Remove a listener from the listener array for the specified event. Caution: changes array indices in the listener array behind the listener.

@example
	var callback = function(stream) {
	  console.log('someone connected!');
	};
	server.on('connection', callback);
	// ...
	server.removeListener('connection', callback);

removeListener will remove, at most, one instance of a listener from the listener array. If any single listener has been added multiple times to the listener array for the specified event, then removeListener must be called multiple times to remove each instance.

Returns emitter, so calls can be chained.
@method removeListener
@param name {String} identifier of the event to remove
@param listener {Function} callback that handled the event
@chainable
*/
/**
Removes all listeners, or those of the specified event. It's not a good idea to remove listeners that were added elsewhere in the code, especially when it's on an emitter that you didn't create (e.g. sockets or file streams).

Returns emitter, so calls can be chained.
@method removeAllListeners
@param [name] {String} identifier of the events to be removed
@chainable
*/
/**
By default EventEmitters will print a warning if more than 10 listeners are added for a particular event. This is a useful default which helps finding memory leaks. Obviously not all Emitters should be limited to 10. This function allows that to be increased. Set to zero for unlimited.

Returns emitter, so calls can be chained.

@method setMaxListeners
@param n {Number} maximum number of listeners to accept
@chainable
*/
/**
`setMaxListeners(n)` sets the maximum on a per-instance basis. This class property lets you set it for all EventEmitter instances, current and future, effective immediately. Use with care.

Note that emitter.setMaxListeners(n) still has precedence over EventEmitter.defaultMaxListeners.

@property defaultMaxListeners
@static
*/
/**
Returns an array of listeners for the specified event.

@example
	server.on('connection', function (stream) {
	  console.log('someone connected!');
	});
	console.log(util.inspect(server.listeners('connection'))); // [ [Function] ]

@method listeners
@param name {String} Name of the listeners to count
@return {Number} Number of listeners
*/
/**
Execute each of the listeners in order with the supplied arguments.

Returns true if event had listeners, false otherwise.

@method emit
@param name {String} Identifier of the event being emitted
@param [arg*] Arguments to be provided to the listeners
@return {Boolean} true if event had listeners subscribed to it
*/
/**
Return the number of listeners for a given event.

@method ListenerCount
@static
@param emitter {EventEmitter} instance of a EventEmitter to check
@param name {String} identifier of the event
@return {Number} number of listeners
*/
/**
This event is emitted any time a listener is added. When this event is triggered, the listener may not yet have been added to the array of listeners for the event.

@event newListener
@param name {String} Identifier of the event being subscribed
@param listener {Function} the listener
*/
/**
This event is emitted any time someone removes a listener. When this event is triggered, the listener may not yet have been removed from the array of listeners for the event.
@event removeListener
@param name {String} Identifier of the event being subscribed
@param listener {Function} the listener
*/
