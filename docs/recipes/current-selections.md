# Current Selections
```javascript
// RxQ imports
import connectEngine from "rxq/connect/connectEngine";
import { openDoc } from "rxq/Global";
import { createSessionObject } from "rxq/Doc";
import { getLayout } from "rxq/GenericObject";

// RxJS imports
import { shareReplay, startWith, switchMap } from "rxjs/operators";

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

// Create a Generic Object with a selection def
const obj$ = app$.pipe(
    switchMap(h => createSessionObject(h, {
        "qInfo": {
            "qType": "my-selections"
        },
        "qSelectionDef": {}
    })),
    shareReplay(1)
);

// Get the selections every time they change, as well as on initialization
const selections$ = obj$.pipe(
    switchMap(h => h.invalidated$.pipe(startWith(h))),
    switchMap(h => getLayout(h))
);

// Log the selections
selections$.subscribe(console.log);
```