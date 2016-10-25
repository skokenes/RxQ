# RxQAP
RxQAP is a reactive JS wrapper for the Qlik Analytics Platform APIs. It uses RxJS to model the API calls used with QAP as Observables. This enables developers to build functional reactive applications with the Qlik platform. Both the browser and node are supported. 

Functional reactive programming pairs well with the reactive nature of the QIX engine. Check out some of the examples included in this repository, such as the [Simple Hub](http://viz.axisgroup.com/simple-hub/) that implements a very basic Qlik Sense hub with a few reactive streams. Then move on to more complex examples, like our [Advanced Hub](http://viz.axisgroup.com/advanced-hub/) that combines multiple servers into a single hub.

##### Support
As of v0.1.0, the following APIs are supported:
- Engine API for QS 3.1

Qlik Repository Service API and Qlik Proxy Service API wrappers are planned for future releases.

## Installation and Usage
Install in node via npm:
```
$ npm install rxqap
```

In the browser, load in a script tag:
```javascript
<script src="rxqap.build.js"></script>
```

### Connect to an engine
Define a server with a `config` object. This can then be used to produce an Observable that will connect to the engine and return the global class:
```javascript
// Describe a server
var config = {
    host: "sense.axisgroup.com",
    isSecure: false
};

// Connect to engine
var engine$ = RxQ.connectEngine(config);
// -> returns a Hot Observable that will connect to server upon first subscription
```

### Get the product version
```javascript
// Create an Observable for the product version
var productVersion$ = engine$
    .mergeMap(function(global) {
        return global.GetProductVersion();
    });
// -> Returns a Cold Observable that will get the product version of the server

// Print the resulting product version to the console
productVersion$.subscribe(function(pv) {
    console.log("Product version is: " + pv);
});
```

### Configuring an engine connection
The `config` object for a server can be defined with the following properties:
* `host` - (String) Hostname of server
* `appname` - (String) Scoped connection to app.
* `isSecure` - (Boolean) If true uses wss and port 443, otherwise ws and port 80
* `port` - (Integer) Port of connection, defaults 443/80
* `prefix` - (String) Virtual Proxy, defaults to '/'
* `origin` - (String) Origin of requests, node only.
* `rejectUnauthorized` - (Boolean) False will ignore unauthorized self-signed certs.
* `headers` - (Object) HTTP headers
* `ticket` - (String) Qlik Sense ticket, consumes ticket on Connect()
* `key` - (String) Client Certificate key for QIX connections
* `cert` - (String) Client certificate for QIX connections
* `ca` - (Array of String) CA root certificates for QIX connections
* `identity` - (String) Session identity  
* `debug` - (Boolean || Function) Will pipe socket messages to console.log or pipe to supplied function  
* `disconnect` - (Function) Called if socket is closed

## Builds
The latest build can be found [here]().

To create your own builds, you can use the following commands to create a build and a minimized build in a `/build` subdirectory:
```
$ npm run build
$ npm run build-min
```
