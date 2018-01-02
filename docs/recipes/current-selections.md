# Current Selections
[Code Sandbox](https://codesandbox.io/embed/x33z8mlq0p)
```javascript
import { connectSession } from "rxq/connect";
import { openDoc } from "rxq/Global";
import { createSessionObject, getField } from "rxq/Doc";
import { getLayout } from "rxq/GenericObject";
import { shareReplay, startWith, switchMap } from "rxjs/operators";

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
```