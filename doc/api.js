YUI.add("yuidoc-meta", function(Y) {
   Y.YUIDoc = { meta: {
    "classes": [
        "ConfigCelda",
        "ConfigEnclavamiento",
        "ConfigLuz",
        "ConfigSector",
        "ConfigSenal",
        "Enclavamiento",
        "Enclavamiento.Apareados",
        "Enclavamiento.SenalCambio",
        "Enclavamiento.SenalTriple",
        "EnclavamientoFactory",
        "EventEmitter",
        "Parcel",
        "ParcelEv",
        "Radio",
        "Sector",
        "Senal",
        "TabView",
        "http",
        "vDOM",
        "vNode"
    ],
    "modules": [
        "Browserify",
        "CTC",
        "Components",
        "Events",
        "Parcela",
        "TabView",
        "configCelda",
        "configEnclavamiento",
        "configSector",
        "configSenal",
        "enclavamientos",
        "http",
        "parcel",
        "parcelEv",
        "radio",
        "sector",
        "senal",
        "utilities",
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
            "displayName": "configCelda",
            "name": "configCelda",
            "description": "Contiene la configuración de una celda dentro de un sector.\n\nCada celda contendrá un tramo de vía que podrá ser de varios tipos (ver [tipo](#property_tipo)).\n\nTodas las vías pasan por el centro de la celda \ny se extienden a los extremos de la misma en 8 direcciones posibles\ndesignadas según los puntos cardinales: `N`, `NE`, `E`, `SE`, `S`, `SW`, `W`, `NW`\ndonde conectan con las vías de la celda vecina.\n\nUna celda puede tener señales, una por cada dirección.\nVer [ConfigSenal](ConfigSenal.html).\nTodas las señales apuntan tal que sean visibles al tren que entra a la celda."
        },
        {
            "displayName": "configEnclavamiento",
            "name": "configEnclavamiento",
            "description": "Describe la relación entre el estado de un elemento del sector y otro u otros.\n\nCada tipo de enclavamiento actua de forma diferente.  Se lo distingue por el [tipo](#property_tipo)."
        },
        {
            "displayName": "configSector",
            "name": "configSector",
            "description": "Provee la descripción de un sector."
        },
        {
            "displayName": "configSenal",
            "name": "configSenal",
            "description": "Describe las señales existentes en una celda."
        },
        {
            "displayName": "CTC",
            "name": "CTC"
        },
        {
            "displayName": "enclavamientos",
            "name": "enclavamientos",
            "description": "Clases cuyas instancias manejan cada tipo de enclavamiento disponible."
        },
        {
            "displayName": "Events",
            "name": "Events",
            "description": "Browserify implementation of NodeJS Events module.\n\nThis is for *documentation purposes only*.\n\nThe information herein was taken from NodeJS documentation and reformatted in JSDoc format.\n\nMany objects in Node emit events: a net.Server emits an event each time a peer connects to it, a fs.readStream emits an event when the file is opened. All objects which emit events are instances of events.EventEmitter. You can access this module by doing: require(\"events\");\n\nTypically, event names are represented by a camel-cased string, however, there aren't any strict restrictions on that, as any string will be accepted.\n\nFunctions can then be attached to objects, to be executed when an event is emitted. These functions are called listeners. Inside a listener function, this refers to the EventEmitter that the listener was attached to."
        },
        {
            "displayName": "http",
            "name": "http",
            "description": "Helper functions to generate standard HTTP requests using the\n[xhr](https://www.npmjs.com/package/xhr) npm module.\n\nAll methods return a Promise.\n\nIt is integrated with the rendering engine so that upon completion of a request,\na redraw is requested."
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
            "description": "Subclass of [Parcel](Parcel.html) capable of listening and\nrelaying DOM events.\n\nBesides the configuration attributes used by [Parcel](Parcel.html),\n`ParcelEv` accepts the `EVENTS` property which is a hash map of DOM events to listen to.\n\nEach entry into `EVENTS` must contain the name of a DOM event (i.e.: `click`, `keypress`)\nfollowed either by a listener function or a further object.\n\n* A function can be given as a reference or as a string with the name of the method within this class\n  that handles it.  The function will be called whenever that event is fired.\n* If an object, it should be a hash map of CSS selectors and functions.\n  This limits the kind of DOM element or elements whose events you want to listen to.\n  The function will then be called only when the element generating it satisfies the condition.\n\n`ParcelEv` will queue a request to redraw the page unless all of the listeners agree to cancel it by all returning exactly `false`.\n\n`ParcelEv` is also an `EventEmitter` thus, it will have methods to deal with custom events.\nSee: [NodeJS EventEmitter](https://nodejs.org/docs/latest/api/events.html)"
        },
        {
            "displayName": "radio",
            "name": "radio",
            "description": "Provides a set of HTML radio buttons optionally enclosed in a `<fieldset>`.\nEmits the [`click`](#event_click) when clicked."
        },
        {
            "displayName": "sector",
            "name": "sector"
        },
        {
            "displayName": "senal",
            "name": "senal",
            "description": "Maneja el mostrado de las señales en una celda"
        },
        {
            "displayName": "TabView",
            "name": "TabView",
            "description": "Provides a set of tabs to show alternate content on the screen.\n\nEach tab is described by an object within the `tabs` array in the initial configuration.\nThe array is required to ensure the order of the tabs.\n\nIndividual tabs can be left-justified or right-justified.\nThe left-justified are usually the variable ones,\nnew tabs can be added to them and existing ones removed.\nIf the `canClose` configuration property is true or missing,\nthe markup in the [closeTag](#property_closeTag) will be shown\nby the label.\n\nThe right-justified, if present, are usually fixed in number.\n\nEach tab is identified by a `name` that should be unique within the TabView.\nThe `label` property provides the text to be shown in the tab.\nThis can be localized and if missing, it defaults to the `name`.\nThe `content` should be an instance of [Parcel](Parcel.html),\n\nIn the tabs configuration, a separator marks the split point in between the sets of left and right justified tabs.\nA `null` will not be displayed.  Any other thing will produce a tab with no contents\nand its label given by the markup in the [moreTag](#property_moreTag) property.\nWhen clicked the [more](#event_more) event is emitted for the application to add a new tab."
        },
        {
            "displayName": "utilities",
            "name": "utilities"
        },
        {
            "displayName": "virtual-DOM",
            "name": "virtual-DOM",
            "description": "Provides virtual dom functionality for other modules."
        }
    ]
} };
});