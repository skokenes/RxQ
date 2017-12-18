# Calculate a value with a Generic Object
```javascript
// RxQ imports
import connectEngine from "rxq/connect/connectEngine";
import { openDoc } from "rxq/Global";
import { createSessionObject } from "rxq/Doc";
import { getLayout } from "rxq/GenericObject";

// RxJS imports
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

// Open an app, get the handle and multicast it
const app$ = eng$.pipe(
    switchMap(h => openDoc(h, "random-data.qvf")),
    shareReplay(1)
);

// Create a Generic Object with a formula
const obj$ = app$.pipe(
    switchMap(h => createSessionObject(h, {
        "qInfo": {
            "qType": "my-object"
        },
        "myValue": {
            "qValueExpression": "=sum(Expression1)"
        }
    })),
    shareReplay(1)
);

// Get the layout of the Generic Object to calculate the value
const value$ = obj$.pipe(
    switchMap(h => getLayout(h))
);

// Log the value from the calculated layout
value$.subscribe(layout => console.log(layout.myValue));
```