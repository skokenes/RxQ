# Loop Through Selections in a Field
[Code Sandbox](https://codesandbox.io/embed/pjr254pnj7)
```javascript
import { connectSession } from "rxq";
import { OpenDoc } from "rxq/Global";
import { CreateSessionObject, GetField } from "rxq/Doc";
import { GetLayout } from "rxq/GenericObject";
import { GetCardinal, LowLevelSelect } from "rxq/Field";
import { map, publish, repeat, shareReplay, startWith, switchMap, take, withLatestFrom } from "rxjs/operators";
import { interval } from "rxjs";

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

// Create a Generic Object with the current selections and a metric
const obj$ = app$.pipe(
  switchMap(h => h.ask(CreateSessionObject, {
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
  switchMap(h => h.ask(GetLayout))
);

// Print the selections to the DOM
selections$.subscribe(layout => {
  const content = document.querySelector("#content");
  content.innerHTML = layout.qSelectionObject.qSelections.map(sel => `<strong>${sel.qField}:</strong>   ${sel.qSelected}`).join("")
  content.innerHTML += `<br>The average petal length is ${layout.myValue}`;
});

// Get a field
const fld$ = app$.pipe(
  switchMap(h => h.ask(GetField, "species")),
  shareReplay(1)
);

// Create a loop of selections by getting the cardinality of the field,
// then running a repeating interval for that cardinality and passing to
// a lowLevelSelect call on the field handle
const selectionLoop$ = fld$.pipe(
  switchMap(h => h.ask(GetCardinal), (h, cnt) => ([h, cnt])),
  switchMap(([h, cnt]) => interval(1500).pipe(
    take(cnt),
    map(i => [h, i]),
    repeat()
  )),
  switchMap(([h, i]) => h.ask(LowLevelSelect, [i], false)),
  publish()
);

// Connect the selection loop
selectionLoop$.connect();
```