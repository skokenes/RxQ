# Batch Invalidations
```html
<html>
    <head>
        <style>
        </style>
    </head>
    <body>
        <select>
            <button>Clear All and Make Selection</button>
        </select>
        <div id="metric"></div>
        <script src="bundle.js"></script>
    </body>
</html>
```

```javascript
// RxQ imports
import connectEngine from "rxq/connect/connectEngine";
import { openDoc } from "rxq/Global";
import { clearAll, createSessionObject, getField, getTablesAndKeys } from "rxq/Doc";
import { getLayout } from "rxq/GenericObject";
import { lowLevelSelect } from "rxq/Field";
import { suspendUntilCompleted } from "rxq/operators";

// RxJS imports
import { fromEvent } from "rxjs/Observable/fromEvent";
import { concat, publish, shareReplay, startWith, switchMap, take } from "rxjs/operators";

// Define the configuration for your engine connection
const config = {
    host: "localhost",
    port: 9076,
    isSecure: false
};

// Establish session
const eng$ = connectEngine(config).pipe(
    shareReplay(1)
);

// Open app in session
const app$ = eng$.pipe(
    switchMap(h => {
        const start = Date.now();
        return openDoc(h, "iris.qvf");
    }),
    shareReplay(1)
);

// Get a stream of layouts
const layout$ = app$.pipe(
    switchMap(h => createSessionObject(h, {
        "qInfo": {
            "qType": "custom"
        },
        "value": {
            "qValueExpression": "=avg(petal_width)"
        }
    })),
    switchMap(h => h.invalidated$.pipe(startWith(h))),
    switchMap(h => getLayout(h)),
    shareReplay(1)
);

// Log latest layout
layout$.subscribe(layout => {
    document.querySelector("#metric").innerHTML = layout.value;
});

// Clear operation
const clearAll$ = app$.pipe(
    switchMap(h => clearAll(h)),
    take(1)
);

// Filter a field operation
const filterFld$ = app$.pipe(
    switchMap(h => getField(h, "species")),
    switchMap(h => lowLevelSelect(h, [0], false)),
    take(1)
);

// Create batched operations sequence with suspension
const batchedOps$ = clearAll$.pipe(
    concat(filterFld$),
    suspendUntilCompleted(eng$)
);

// Click stream to trigger the batched operations
const runOps$ = fromEvent(document.querySelector("button"), "click").pipe(
    switchMap(() => batchedOps$),
    publish()
);

runOps$.connect();
```