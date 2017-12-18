# Multiple Global Calls
```javascript
// Imports
import connectEngine from "rxq/connect/connectEngine";
import { engineVersion, getDocList } from "rxq/Global";
import { shareReplay, switchMap } from "rxjs/operators";

// Define the configuration for your engine connection
const config = {
    host: "localhost",
    port: 9076,
    isSecure: false
};

// Call connectEngine with the config to produce an Observable for the Global handle. Share this connection with multiple subscribers
const eng$ = connectEngine(config).pipe(
    shareReplay(1)
);

// Once you receive the Global Handle, get the engineVersion from it
const engVer$ = eng$.pipe(
    switchMap(h => engineVersion(h))
);

// Once you receive the Global Handle, get the doc list from it
const doclist$ = eng$.pipe(
    switchMap(h => getDocList(h))
);

// Log the engine version and doc list
engVer$.subscribe(console.log);
doclist$.subscribe(console.log);
```