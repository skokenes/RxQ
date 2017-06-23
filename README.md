# RxQ
RxQ is a reactive JS wrapper for the Qlik Analytics Platform APIs. It uses RxJS to model the API calls used with QAP as Observables. This enables developers to build functional reactive applications with the Qlik platform. Both the browser and node are supported. 

Functional reactive programming pairs well with the reactive nature of the QIX engine. Check out some of the examples included in this repository, such as the [Simple Hub](http://viz.axisgroup.com/simple-hub/) that implements a very basic Qlik Sense hub with a few reactive streams. Then move on to more complex examples, like our [Combined Hub](http://viz.axisgroup.com/combined-hub/) that combines multiple servers into a single hub.

##### Support
As of v0.6.7, the following APIs are supported:
- Engine API for QS 3.2
- QRS API for all QS versions

Custom builds for other versions of the QS Engine can be generated using the included build scripts.

A Qlik Proxy Service API wrapper is planned for future releases.

## Installation
Install in node via npm:
```
$ npm install rxq
```

In the browser, load in a script tag:
```javascript
<script src="https://opensrc.axisgroup.com/rxq/rxq.js"></script>
```

The most recent version of RxQ builds, plus archived and minified builds, are hosted at https://opensrc.axisgroup.com/rxq/.

You can play with RxQ right away in [this JSFiddle!](https://jsfiddle.net/8kb7j7s1/)

An in-depth tutorial for RxQ is available at http://blog.axc.net/tutorial-build-an-interactive-chart-on-qix-with-rxqap/.

For a quick start, keep reading:

## Engine API Usage

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
// -> returns a hot GlobalObservable that will connect to server upon first subscription
```

### Get the product version
```javascript
// Create an Observable for the product version
var productVersion$ = engine$
    .qProductVersion();
// -> Returns a Cold Observable that will get the product version of the server

// Print the resulting product version to the console
productVersion$.subscribe(function(pv) {
    console.log("Product version is: " + pv.response.qReturn);
});
```

**RxQ produces Cold Observables for all API calls by default.**

### Configuring RxQ Engine Behavior
While RxQ is cold by default, it can be configured for different behaviors with an optional second parameter on `RxQ.connectEngine()`. This parameter can be one of the following:

* `"cold"` - (default) all Observables returned by the session are cold and execute for each subscriber
* `"warm"` - all Observables returned by the session wait until first subscriber until execution, but multicast the results to future subscribers. The latest value is replayed for late subscribers
* `"hot"` - all Observables returned by the session execute immediately, regardless of subscribers. All subscribers receive the same value, with the latest value being replayed for late subscribers

For example, to create a QIX session that behaves "warm", you would write:
```
var engine$ = RxQ.connectEngine(config, "warm");
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

### Engine API Methods
The Engine API methods can be found in the [Qlik Sense Developers Help documentation](http://help.qlik.com/en-US/sense-developer/3.1/Subsystems/EngineAPI/Content/Classes/classes.htm).

## QRS API Usage

### Connect to the QRS and make a call 
```
var config = {
    host: "my-server"
};

var qrs = RxQ.connectQRS(config);

var apiDefault$ = qrs.get("/about/api/default");
// -> Returns an Observable for the response to a GET request against this path
```

In real examples, you will need a more complicated `config` object to connect properly to a server.

### Configuring a QRS connection
The `config` object for the QRS can be defined with the following properties:
* `host` - (String) Hostname of server
* `port` - (Integer) Port of connection, defaults to 443/80
* `prefix` - (String) Virtual Proxy
* `headers` - (Object) HTTP headers
* `isSecure` - (Boolean) If true, uses https. Otherwise uses http. Default is true
* `key` - (String) Client certificate key
* `cert` - (String) Client certificate
* `ca` - (Array of String) CA root certificates
* `addParams` - (Object) Any additional parameters that you want included with each HTTP request

### Configuring RxQ QRS Behavior
Just like with the Engine, RxQAP's QRS connection can be configured for different behaviors with an optional second parameter on `RxQ.connectQRS()`. This parameter can be one of the following:

* `"cold"` - (default) all Observables returned are cold and execute for each subscriber
* `"warm"` - all Observables returned wait until first subscriber until execution, but multicast the results to future subscribers. The latest value is replayed for late subscribers
* `"hot"` - all Observables returned execute immediately, regardless of subscribers. All subscribers receive the same value, with the latest value being replayed for late subscribers

For example, to create a QRS that behaves "warm", you would write:
```
var qrs = RxQ.connectQRS(config, "warm");
```

## Builds
The latest build can be found in the releases [here](https://github.com/axisgroup/RxQ/releases/tag/v0.6.7). Builds are also hosted at https://opensrc.axisgroup.com/rxq/.

To create your own builds, you can use the following commands to create a build and a minimized build in a `/build` subdirectory:
```
$ npm run build
$ npm run build-min
```
