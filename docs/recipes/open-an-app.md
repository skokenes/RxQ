# Open an App
```javascript
// Imports
import connectEngine from "rxq/connect/connectEngine";
import { openDoc } from "rxq/Global";
import { shareReplay, switchMap } from "rxjs/operators";

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

// Open an app, get the handle, and multicast it
const app$ = eng$.pipe(
    switchMap(h => openDoc(h, "random-data.qvf")),
    shareReplay(1)
);

// Log the app handle
app$.subscribe(console.log);
```