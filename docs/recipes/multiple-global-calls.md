# Multiple Global Calls
```javascript
// Import the connect engine function
var connectEngine = require("../../dist/connect/connectEngine");
var { engineVersion, getDocList } = require("../../dist/Global");
var { shareReplay, switchMap } = require("rxjs/operators");

// Define the configuration for your engine connection
const config = {
    host: "localhost",
    port: 9076,
    isSecure: false
};

// Call connectEngine with the config to produce an Observable for the Global handle
const eng$ = connectEngine(config).pipe(
    shareReplay(1)
);

const engVer$ = eng$.pipe(
    switchMap(h => engineVersion(h))
);

const doclist$ = eng$.pipe(
    switchMap(h => getDocList(h))
);

// Console out the engine version
engVer$.subscribe(console.info);
doclist$.subscribe(console.info);
```