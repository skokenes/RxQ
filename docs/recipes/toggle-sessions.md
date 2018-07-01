# Toggle Sessions
[Code Sandbox](https://codesandbox.io/embed/6121o1l23)
```javascript
import { connectSession } from "rxq";
import { GetActiveDoc, OpenDoc } from "rxq/Global";
import { GetAppProperties, GetTablesAndKeys } from "rxq/Doc";
import { fromEvent, forkJoin, combineLatest } from "rxjs";
import { map, pluck, shareReplay, startWith, switchMap, withLatestFrom } from "rxjs/operators";

// Define the configuration for your session
const configs = [
  {
    host: "sense.axisgroup.com",
    isSecure: true,
    appname: "aae16724-dfd9-478b-b401-0d8038793adf"
  },
  {
    host: "sense.axisgroup.com",
    isSecure: true,
    appname: "3a64c6ff-94b4-43e3-b993-4040cf889c64"
  },
];

// Create a stream for the current session being viewed
const sessionNo$ = fromEvent(document.querySelector("select"), "change").pipe(
  map(evt => parseInt(evt.target.value)),
  startWith(0)
);

// Create an array of sessions
const sessions$ = forkJoin(
  configs
    .map(config => connectSession(config).global$
      .pipe(shareReplay(1))
    )
);

// The current session
const sesh$ = sessions$.pipe(
  combineLatest(sessionNo$, (engines, no) => engines[no]),
  shareReplay(1)
);

// When switching sessions, get the doc
const app$ = sesh$.pipe(
  withLatestFrom(sessionNo$),
  switchMap(([h, no]) => h.ask(OpenDoc, configs[no].appname)),
  shareReplay(1)
);

// Get the current app title
const appTitle$ = app$.pipe(
  switchMap(h => h.ask(GetAppProperties)),
  pluck("qTitle")
);

// Print the app title to the DOM
appTitle$.subscribe(title => {
  document.querySelector("#app-title").innerHTML = title;
});

// Get the fields in the current app
const fieldList$ = app$.pipe(
  switchMap(h => h.ask(GetTablesAndKeys, { "qcx": 1000, "qcy": 1000 }, { "qcx": 0, "qcy": 0 }, 30, true, false))
);

// List the fields in the DOM
fieldList$.subscribe(response => {
  const tables = response.qtr;
  const flds = tables.map(table => {
    const tableflds = table.qFields;
    return tableflds.map(fld => ({
      table: table.qName,
      field: fld.qName
    }));
  })
    .reduce((acc, curr) => {
      return acc.concat(curr);
    }, []);

  document.querySelector("tbody").innerHTML = flds.map(fld => `<tr><td>${fld.table}</td><td>${fld.field}</td></tr>`).join("");
});
```