# Batch Invalidations
[Code Sandbox](https://codesandbox.io/embed/rmzlkvv1op)
```javascript
import { connectSession, suspendUntilCompleted } from "rxq";
import { OpenDoc } from "rxq/Global";
import { ClearAll, CreateSessionObject, GetField, GetTablesAndKeys } from "rxq/Doc";
import { GetLayout } from "rxq/GenericObject";
import { LowLevelSelect } from "rxq/Field";
import { fromEvent } from "rxjs";
import { concat, publish, shareReplay, startWith, switchMap, take } from "rxjs/operators";

const appname = "aae16724-dfd9-478b-b401-0d8038793adf"

// Define the configuration for your session
const config = {
  host: "sense.axisgroup.com",
  isSecure: true,
  appname
};

// Connect the session and share the Global handle
const session = connectSession(config);
const global$ = session.global$;

// Open app in session
const app$ = global$.pipe(
  switchMap(h => h.ask(OpenDoc, appname)),
  shareReplay(1)
);

// Get a stream of layouts
const layout$ = app$.pipe(
  switchMap(h => h.ask(CreateSessionObject, {
    "qInfo": {
      "qType": "custom"
    },
    "value": {
      "qValueExpression": "=avg(petal_width)"
    }
  })),
  switchMap(h => h.invalidated$.pipe(startWith(h))),
  switchMap(h => h.ask(GetLayout)),
  shareReplay(1)
);

// Log latest layout
layout$.subscribe(layout => {
  document.querySelector("#metric").innerHTML = layout.value;
});

// Clear operation
const clearAll$ = app$.pipe(
  switchMap(h => h.ask(ClearAll)),
  take(1)
);

// Filter a field operation
const filterFld$ = app$.pipe(
  switchMap(h => h.ask(GetField, "species")),
  switchMap(h => h.ask(LowLevelSelect, [0], false)),
  take(1)
);

// Create batched operations sequence with suspension
const batchedOps$ = clearAll$.pipe(
  concat(filterFld$),
  suspendUntilCompleted(session)
);

// Click stream to trigger the batched operations
const runOps$ = fromEvent(document.querySelector("button"), "click").pipe(
  switchMap(() => batchedOps$),
  publish()
);

runOps$.connect();
```