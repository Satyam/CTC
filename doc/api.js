YUI.add("yuidoc-meta", function(Y) {
   Y.YUIDoc = { meta: {
    "classes": [
        "EventEmitter",
        "Parcel",
        "ParcelEv",
        "Radio",
        "vDOM",
        "vNode"
    ],
    "modules": [
        "Browserify",
        "Components",
        "Events",
        "Parcela",
        "parcel",
        "parcelEv",
        "radio",
        "virtual-DOM"
    ],
    "allModules": [
        {
            "displayName": "Browserify",
            "name": "Browserify"
        },
        {
            "displayName": "Components",
            "name": "Components"
        },
        {
            "displayName": "Events",
            "name": "Events",
            "description": "Browserify implementation of NodeJS Events module.\n\nThis is for *documentation purposes only*. \n\nThe information herein was taken from NodeJS documentation and reformatted in JSDoc format.\n\nMany objects in Node emit events: a net.Server emits an event each time a peer connects to it, a fs.readStream emits an event when the file is opened. All objects which emit events are instances of events.EventEmitter. You can access this module by doing: require(\"events\");\n\nTypically, event names are represented by a camel-cased string, however, there aren't any strict restrictions on that, as any string will be accepted.\n\nFunctions can then be attached to objects, to be executed when an event is emitted. These functions are called listeners. Inside a listener function, this refers to the EventEmitter that the listener was attached to."
        },
        {
            "displayName": "parcel",
            "name": "parcel",
            "description": "Represents a section of real state in the HTML page.\n\nAll Parcela apps should inherit from this class.\n\nSeveral properties might be configured on instantiation:\n\n* [containerType](#property_containerType)\n* [className](#property_className)\n* [attributes](#property_attributes)\n* [text](#property_text)"
        },
        {
            "displayName": "Parcela",
            "name": "Parcela"
        },
        {
            "displayName": "parcelEv",
            "name": "parcelEv",
            "description": "Subclass of [Parcel](Parcel.html) capable of listening and\nrelaying DOM events.\n\nBesides the configuration attributes used by [Parcel](Parcel.html), \n`ParcelEv` accepts the `EVENTS` property which is a hash map of DOM events to listen to.\n\nEach entry into `EVENTS` must contain the name of a DOM event (i.e.: `click`, `keypress`)\nfollowed either by a listener function or a further object.   \n\n* A function can be given as a reference or as a string with the name of the method within this class\n  that handles it.  The function will be called whenever that event is fired.\n* If an object, it should be a hash map of CSS selectors and functions.  \n  This limits the kind of DOM element or elements whose events you want to listen to.  \n  The function will then be called only when the element generating it satisfies the condition.\n\n`ParcelEv` will queue a request to redraw the page unless any of the listeners cancels it by returning a **truish** value.\n\n`ParcelEv` is also an `EventEmitter` thus, it will have methods to deal with custom events.\nSee: [NodeJS EventEmitter](https://nodejs.org/docs/latest/api/events.html)"
        },
        {
            "displayName": "radio",
            "name": "radio",
            "description": "Provides a set of HTML radio buttons optionally enclosed in a `&lt;fieldset&gt;`.\nEmits the [`click`](#event_click) when clicked."
        },
        {
            "displayName": "virtual-DOM",
            "name": "virtual-DOM",
            "description": "Provides virtual dom functionality for other modules."
        }
    ]
} };
});