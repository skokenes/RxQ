# Make a Selection
[Code Sandbox](https://codesandbox.io/embed/wkwqv77y4l)
```javascript
import { connectSession } from "rxq/connect";
import { openDoc } from "rxq/Global";
import { createSessionObject, getField } from "rxq/Doc";
import { getLayout } from "rxq/GenericObject";
import { getCardinal, select } from "rxq/Field";
import { mapTo, merge, publish, shareReplay, startWith, switchMap, withLatestFrom } from "rxjs/operators";
import { fromEvent } from "rxjs/observable/fromEvent";

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

// Open an app and share the app handle
const app$ = sesh$.pipe(
  switchMap(h => openDoc(h, appname)),
  shareReplay(1)
);

// Create a Generic Object with the current selections
const obj$ = app$.pipe(
  switchMap(h => createSessionObject(h, {
    "qInfo": {
      "qType": "my-object"
    },
    "qSelectionObjectDef": {}
  })),
  shareReplay(1)
);

// Get the latest selections whenever the model changes
const selections$ = obj$.pipe(
  switchMap(h => h.invalidated$.pipe(startWith(h))),
  switchMap(h => getLayout(h))
);

// Print the selections to the DOM
selections$.subscribe(layout => {
  document.querySelector("#content").innerHTML = layout.qSelectionObject.qSelections.map(sel => `<strong>${sel.qField}:</strong>   ${sel.qSelected}`).join("")
});

// Get a field
const fld$ = app$.pipe(
  switchMap(h => getField(h, "species")),
  shareReplay(1)
);

// On click, emit the value "setosa"
const selectSetosa$ = fromEvent(document.querySelector("#filter"), "click").pipe(
  mapTo("setosa")
);

// On click, emit an empty string
const clearSelect$ = fromEvent(document.querySelector("#unfilter"), "click").pipe(
  mapTo("")
);

// Create a stream of select actions to the field from the button clicks
const selectValue$ = selectSetosa$.pipe(
  merge(clearSelect$),
  withLatestFrom(fld$),
  switchMap(([sel, h]) => select(h, sel)),
  publish()
);

// Connect the selection stream
selectValue$.connect();
```