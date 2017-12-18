# Get the Engine Version
```javascript
// Import the connect engine function, the engine version function, and the switchMap operator
import connectEngine from "rxq/connect/connectEngine";
import { engineVersion } from "rxq/Global";
import { switchMap } from "rxjs/operators";

// Define the configuration for your engine connection
const config = {
    host: "localhost",
    port: 9076,
    isSecure: false
};

// Call connectEngine with the config to produce an Observable for the Global handle
const eng$ = connectEngine(config);

// Once you receive the Global Handle, get the engineVersion from it
const engVer$ = eng$.pipe(
    switchMap(h => engineVersion(h))
);

// Console out the engine version
engVer$.subscribe(console.log);
```