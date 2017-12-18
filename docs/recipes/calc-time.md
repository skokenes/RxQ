# Calculate the response time of the API
```javascript
// RxQ imports
import connectEngine from "rxq/connect/connectEngine";
import { openDoc } from "rxq/Global";

// RxJS imports
import { map, shareReplay, switchMap } from "rxjs/operators";

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

// Calculate the time it takes for the Engine to return the app handle
const appOpenTime$ = eng$.pipe(
    switchMap(h => {
        const start = Date.now();
        return openDoc(h, "random-data.qvf").pipe(
            map(() => Date.now() - start)
        );
    })
);

appOpenTime$.subscribe(console.log);
```