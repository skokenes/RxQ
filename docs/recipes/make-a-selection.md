# Make a Selection
[Code Sandbox](https://codesandbox.io/embed/wkwqv77y4l)
```javascript
import { connectSession } from "rxq";
import { OpenDoc } from "rxq/Global";
import { CreateSessionObject, GetField } from "rxq/Doc";
import { GetLayout } from "rxq/GenericObject";
import { GetCardinal, Select } from "rxq/Field";
import { mapTo, publish, shareReplay, startWith, switchMap, withLatestFrom } from "rxjs/operators";
import { fromEvent, merge } from "rxjs";

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

// Open an app and share the app handle
const app$ = global$.pipe(
  switchMap(h => h.ask(OpenDoc, appname)),
  shareReplay(1)
);

// Create a Generic Object with the current selections
const obj$ = app$.pipe(
  switchMap(h => h.ask(CreateSessionObject, {
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
  switchMap(h => h.ask(GetLayout))
);

// Print the selections to the DOM
selections$.subscribe(layout => {
  document.querySelector("#content").innerHTML = layout.qSelectionObject.qSelections.map(sel => `<strong>${sel.qField}:</strong>   ${sel.qSelected}`).join("")
});

// Get a field
const fld$ = app$.pipe(
  switchMap(h => h.ask(GetField, "species")),
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
const selectValue$ = merge(selectSetosa$, clearSelect$).pipe(
  withLatestFrom(fld$),
  switchMap(([sel, h]) => h.ask(Select, sel)),
  publish()
);

// Connect the selection stream
selectValue$.connect();
```