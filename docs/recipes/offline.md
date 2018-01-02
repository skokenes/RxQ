# Offline
[Code Sandbox](https://codesandbox.io/embed/0p32m17z4w)
```javascript
import { connectSession } from "rxq/connect";
import { getActiveDoc, openDoc } from "rxq/Global";
import { createSessionObject } from "rxq/Doc";
import { getLayout, selectListObjectValues } from "rxq/GenericObject";
import { fromEvent } from "rxjs/observable/fromEvent";
import { filter, map, mapTo, merge, publish, shareReplay, startWith, switchMap, take, tap, withLatestFrom } from "rxjs/operators";

const appname = "aae16724-dfd9-478b-b401-0d8038793adf";

// Event for when app goes on and offline
const online$ = fromEvent(window, "online").pipe(mapTo(true)).pipe(
  merge(fromEvent(window, "offline").pipe(mapTo(false))),
  startWith(true)
);

// When going on or offline, show/hide offline banner
online$.subscribe(status => {
  if (status) {
    document.querySelector("#offline").classList.add("hidden");
  }
  else {
    document.querySelector("#offline").classList.remove("hidden");
  }
});

// Define a session config
const config = {
  host: "sense.axisgroup.com",
  isSecure: true,
  appname
};

// When going online, connect a new session
const sesh$ = online$.pipe(
  filter(f => f),
  switchMap(() => connectSession(config)),
  shareReplay(1)
);

// Open an app
const app$ = sesh$.pipe(
  switchMap(h => openDoc(h, appname)),
  shareReplay(1)
);

// Calculate a value on invalidation
const layouts$ = app$.pipe(
  switchMap(h => createSessionObject(h, {
    "qInfo": {
      "qType": "custom"
    },
    "value": {
      "qValueExpression": "=avg(petal_length)"
    }
  })),
  switchMap(h => h.invalidated$.pipe(startWith(h))),
  switchMap(h => getLayout(h))
);

// Print the value to the DOM
layouts$.subscribe(layout => {
  document.querySelector("#metric").innerHTML = layout.value;
});

// Create a Generic Object with a list object for the field species
const listbox$ = app$.pipe(
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

// Get a stream of listbox layouts
const listboxLayout$ = listbox$.pipe(
  switchMap(h => h.invalidated$.pipe(startWith(h))),
  switchMap(h => getLayout(h))
);

// Render the list object to the page in an unordered list
listboxLayout$.subscribe(layout => {
  const data = layout.qListObject.qDataPages[0].qMatrix;
  document.querySelector("ul").innerHTML = data.map(item => `<li class="${item[0].qState}" data-qno=${item[0].qElemNumber}>
      ${item[0].qText}
  </li>`).join("");
});

// Select values when a user clicks on them
const select$ = fromEvent(document.querySelector("ul"), "click").pipe(
  filter(evt => evt.target.hasAttribute("data-qno")),
  map(evt => parseInt(evt.target.getAttribute("data-qno"))),
  withLatestFrom(listbox$),
  switchMap(([qno, h]) => selectListObjectValues(h, "/qListObjectDef", [qno], true)),
  publish()
);

select$.connect();
```