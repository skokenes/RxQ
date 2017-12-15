# Open an App
```javascript
// Import the connect engine function
var connectEngine = require("../../dist/connect/connectEngine");
var { openDoc } = require("../../dist/Global");
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

const app$ = eng$.pipe(
    switchMap(h => openDoc(h, "random-data.qvf"))
);

app$.subscribe(console.info);
```