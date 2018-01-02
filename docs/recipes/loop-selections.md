# Loop Through Selections in a Field
[Code Sandbox](https://codesandbox.io/embed/pjr254pnj7)
```javascript
import { connectSession } from "rxq/connect";
import { openDoc } from "rxq/Global";
import { createSessionObject, getField } from "rxq/Doc";
import { getLayout } from "rxq/GenericObject";
import { getCardinal, lowLevelSelect } from "rxq/Field";
import { map, merge, publish, repeat, shareReplay, startWith, switchMap, take, withLatestFrom } from "rxjs/operators";
import { interval } from "rxjs/observable/interval";

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

// Create a Generic Object with the current selections and a metric
const obj$ = app$.pipe(
  switchMap(h => createSessionObject(h, {
    "qInfo": {
      "qType": "my-object"
    },
    "qSelectionObjectDef": {},
    "myValue": {
      "qValueExpression": "=avg(petal_length)"
    }
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
  const content = document.querySelector("#content");
  content.innerHTML = layout.qSelectionObject.qSelections.map(sel => `<strong>${sel.qField}:</strong>   ${sel.qSelected}`).join("")
  content.innerHTML += `<br>The average petal length is ${layout.myValue}`;
});

// Get a field
const fld$ = app$.pipe(
  switchMap(h => getField(h, "species")),
  shareReplay(1)
);

// Create a loop of selections by gretting the cardinality of the field,
// then running a repeating interval for that cardinality and passing to
// a lowLevelSelect call on the field handle
const selectionLoop$ = fld$.pipe(
  switchMap(h => getCardinal(h), (h, cnt) => ([h, cnt])),
  switchMap(([h, cnt]) => interval(1500).pipe(
    take(cnt),
    map(i => [h, i]),
    repeat()
  )),
  switchMap(([h, i]) => lowLevelSelect(h, [i], false)),
  publish()
);

// Connect the selection loop
selectionLoop$.connect();
```