# RxQ
RxQ is a reactive JS wrapper for the Qlik Analytics Platform APIs. It provides custom RxJS operators that execute Qlik API calls.

##### Support
As of v0.7.0-beta.5, the following APIs are supported:
- Engine API for QS 12.20.0

Custom builds for other versions of the QS Engine can be generated using the included build scripts. See the build section.

## Installation
Install in node via npm:
```
$ npm install rxq@beta
```
## API Structure
RxQ has two types of functions: connectors and operators.


### Connectors
Connectors take in a configuration and return an Observable for a connection to a Qlik service. They are stored under the "rxq/connect" path. For example, to load the `connectEngine` function that will return an Observable for an Engine session, you can do one of the following:

*CommonJS*
```
var connectEngine = require("rxq/connect/connectEngine");
```

*ESM*
```
import connectEngine from "rxq/connect/connectEngine";
```

*Browser - note the browser API is slightly different at this time*
```
var connectEngine = RxQ.connectEngine;
```

### Operators
Operators are organized by QIX Engine class. They are stored in RxQ under the path "rxq/operators/<--qClass-->".

For example, to get the engineVersion operator from the Global class, you could do one of the following:

*CommonJS*
```
var engineVersion = require("rxq/operators/global/engineVersion");
```

*ESM*
```
import { engineVersion } from "rxq/operators/global";
```

*Browser*
```
var engineVersion = RxQ.operators.Global.engineVersion;
```

## Engine API Usage
The following example illustrates usage of RxQ with ESM. The same format applies for CommonJS and Browser usage; the only difference is how you import the library. See above for details.

### Connect to an engine and get the engine version
Define a server with a `config` object. This can then be used to produce an Observable that will connect to the engine and return the global class. Then, we can use the engineVersion operator to get the engineVersion.
```javascript
import connectEngine from "rxq/connect/connectEngine";
import { engineVersion } from "rxq/operators/global";

// Describe a server
var config = {
    host: "sense.axisgroup.com",
    isSecure: false
};

// Connect to engine
var engine$ = connectEngine(config);

// Get the engineVersion
var engineVersion$ = engine$.pipe(
    engineVersion()
);

// Print the engine version
engineVersion$.subscribe(version => {
    console.log("engine version: ", version);
});
```

**RxQ operators produce Hot Observables with replay and ref counting.**

Observables that are created from RxQ operators will replay their last value at all times. This means that late subscribers will always get the latest value from the Observable. These observables use ref counting, meaning that they do not connect until they go from 0 to 1 subscriber. Similarly, they disconnect when going from 1 to 0 subscribers. In summary, your observables from RxQ must have a subscriber to function by default. Alternatively, you can manually connect these Observables or defer them depending on your needs.

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

## Building RxQ
RxQ has several auto-generated components that build the source code and compile it into the distributed package for NPM. The steps are:
1) Getting the correct QIX Engine schemas and generating operators for all API methods for the desired engine version
2) Converting all source code into CommonJS, ESM, and browser modules and moving them to the distribution folder
3) Creating the package.json files for the distribution folder

Each of these steps can be triggered using npm scripts in the repository:

### Step 1: Getting Engine schemas and generating operators
`npm run build-qix-schemas` will pull and transform the QIX schemas from the `enigma.js` node module.

`npm run build-operators` will use the QIX Schemas to generate the operator source code for each API call. It only does this for the QIX version specified in the `qix-version` property of `package.json`. By default, we keep this updated to the latest available version of QIX and distribute the NPM package based on this version. If you need to generate a build for a different version, you can update the `qix-version` property and re-run the build process from here forward.

### Step 2: Converting all source code into distribution modules
`npm run compile-cjs` compiles the CommonJS modules.

`npm run compile-esm5` compiles the ESM modules.

`npm run build` compiles the browser bundle.

`npm run build-min` compiles the minified browser bundle.

### Step 3: Creating the package.json files for distribution
`npm run make-packages` creates and stores the package.json files.

### Rebuilding the Distribution Folder
It is common to edit source code of RxQ and then execute steps 2 and 3 to rebuild the distribution folder. Those steps can be done in a single command with:
`npm run build-dist-folder`.

The final package for distribution is stored in a sub-directory called `dist`. The NPM package should be published from this directory, NOT from the parent level repository which contains the source code.