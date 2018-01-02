# Search a Listbox
[Code Sandbox](https://codesandbox.io/embed/jo4w6mz3v)
```javascript
import { connectSession } from "rxq/connect";
import { openDoc } from "rxq/Global";
import { createSessionObject } from "rxq/Doc";
import { getLayout, searchListObjectFor, selectListObjectValues } from "rxq/GenericObject";
import { filter, map, publish, repeat, shareReplay, startWith, switchMap, withLatestFrom } from "rxjs/operators";
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

// Create a Generic Object with a metric
const obj$ = app$.pipe(
  switchMap(h => createSessionObject(h, {
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
  switchMap(h => getLayout(h))
);

// Print the selections to the DOM
metricLayouts$.subscribe(layout => {
  document.querySelector("#metric").innerHTML = `<br>The average petal length is ${layout.myValue}`;
});

// Create a Generic Object with a list object for the field "species"
const lb$ = app$.pipe(
  switchMap(h => createSessionObject(h, {
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
  switchMap(h => getLayout(h))
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
  switchMap(([qno, h]) => selectListObjectValues(h, "/qListObjectDef", [qno], true)),
  publish()
);

select$.connect();

// Search the listbox when text is entered to the input
const search$ = fromEvent(document.querySelector("input"), "keyup").pipe(
  map(evt => evt.target.value),
  withLatestFrom(lb$, (val, h) => [val, h]),
  switchMap(([val, h]) => searchListObjectFor(h, "/qListObjectDef", val)),
  publish()
);

search$.connect();
```