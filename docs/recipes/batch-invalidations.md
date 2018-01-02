# Batch Invalidations
[Code Sandbox](https://codesandbox.io/embed/rmzlkvv1op)
```javascript
import { connectSession } from "rxq/connect";
import { openDoc } from "rxq/Global";
import { clearAll, createSessionObject, getField, getTablesAndKeys } from "rxq/Doc";
import { getLayout } from "rxq/GenericObject";
import { lowLevelSelect } from "rxq/Field";
import { suspendUntilCompleted } from "rxq/operators";
import { fromEvent } from "rxjs/observable/fromEvent";
import { concat, publish, shareReplay, startWith, switchMap, take } from "rxjs/operators";

const appname = "aae16724-dfd9-478b-b401-0d8038793adf"

// Define the configuration for your session
const config = {
  host: "sense.axisgroup.com",
  isSecure: true,
  appname
};

// Connect the session and share the Global handle
const sesh$ = connectSession(config).pipe(
  shareReplay(1)
);

// Open app in session
const app$ = sesh$.pipe(
  switchMap(h => openDoc(h, appname)),
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
  suspendUntilCompleted(sesh$)
);

// Click stream to trigger the batched operations
const runOps$ = fromEvent(document.querySelector("button"), "click").pipe(
  switchMap(() => batchedOps$),
  publish()
);

runOps$.connect();
```