# Set App Properties and Listen for Changes
```javascript
// RxQ imports
import connectEngine from "rxq/connect/connectEngine";
import { openDoc } from "rxq/Global";
import { getAppProperties, setAppProperties } from "rxq/Doc";

// RxJS imports
import { interval } from "rxjs/Observable/interval";
import { publish, shareReplay, startWith, 
    switchMap, take, withLatestFrom } from "rxjs/operators";

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

// Open an app, get the handle and multicast it
const app$ = eng$.pipe(
    switchMap(h => openDoc(h, "random-data.qvf")),
    shareReplay(1)
);

// Get the app properties any time the app invalidates
const appProps$ = app$.pipe(
    switchMap(h => h.invalidated$.pipe(startWith(h))),
    switchMap(h => getAppProperties(h))
);

// Log the app properties whenever they change
appProps$.subscribe(console.log);

// Every second for 5 seconds, update the app props with a random prop
const updateSeq$ = interval(1000).pipe(
    take(5),
    withLatestFrom(app$),
    switchMap(([i, h]) => setAppProperties(h, {
        "myProp": i
    })),
    publish()
);

// Initiate the update sequence by connecting it
updateSeq$.connect();
```