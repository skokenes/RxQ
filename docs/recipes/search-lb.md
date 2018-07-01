# Search a Listbox
[Code Sandbox](https://codesandbox.io/embed/843q0ny400)
```javascript
import { connectSession } from "rxq";
import { OpenDoc } from "rxq/Global";
import { CreateSessionObject } from "rxq/Doc";
import { GetLayout, SearchListObjectFor, SelectListObjectValues } from "rxq/GenericObject";
import { filter, map, publish, repeat, shareReplay, startWith, switchMap, withLatestFrom } from "rxjs/operators";
import { fromEvent } from "rxjs";

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

// Create a Generic Object with a metric
const obj$ = app$.pipe(
  switchMap(h => h.ask(CreateSessionObject, {
    "qInfo": {
      "qType": "my-object"
    },
    "myValue": {
      "qValueExpression": "=avg(petal_length)"
    }
  })),
  shareReplay(1)
);

// Get the latest selections whenever the model changes
const metricLayouts$ = obj$.pipe(
  switchMap(h => h.invalidated$.pipe(startWith(h))),
  switchMap(h => h.ask(GetLayout))
);

// Print the selections to the DOM
metricLayouts$.subscribe(layout => {
  document.querySelector("#metric").innerHTML = `<br>The average petal length is ${layout.myValue}`;
});

// Create a Generic Object with a list object for the field "species"
const lb$ = app$.pipe(
  switchMap(h => h.ask(CreateSessionObject, {
    "qInfo": {
      "qType": "my-listbox"
    },
    "qListObjectDef": {
      "qDef": {
        "qFieldDefs": ["species"]
      },
      "qInitialDataFetch": [
        {
          "qTop": 0,
          "qLeft": 0,
          "qWidth": 1,
          "qHeight": 100
        }
      ]
    }
  })),
  shareReplay(1)
);

// Get a stream of list object layouts
const lbLayouts$ = lb$.pipe(
  switchMap(h => h.invalidated$.pipe(startWith(h))),
  switchMap(h => h.ask(GetLayout))
);

// Render the list object to the page in an unordered list
lbLayouts$.subscribe(layout => {
  const data = layout.qListObject.qDataPages[0].qMatrix;
  document.querySelector("ul").innerHTML = data.map(item => `<li class="${item[0].qState}" data-qno=${item[0].qElemNumber}>
      ${item[0].qText}
  </li>`).join("");
});

// Select values when a user clicks on them
const select$ = fromEvent(document.querySelector("body"), "click").pipe(
  filter(evt => evt.target.hasAttribute("data-qno")),
  map(evt => parseInt(evt.target.getAttribute("data-qno"))),
  withLatestFrom(lb$),
  switchMap(([qno, h]) => h.ask(SelectListObjectValues, "/qListObjectDef", [qno], true)),
  publish()
);

select$.connect();

// Search the listbox when text is entered to the input
const search$ = fromEvent(document.querySelector("input"), "keyup").pipe(
  map(evt => evt.target.value),
  withLatestFrom(lb$, (val, h) => [val, h]),
  switchMap(([val, h]) => h.ask(SearchListObjectFor, "/qListObjectDef", val)),
  publish()
);

search$.connect();
```