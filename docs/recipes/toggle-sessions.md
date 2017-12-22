# Toggle Sessions
```html
<html>
    <head>
        <style>
        </style>
    </head>
    <body>
        <select>
            <option value = "0" >Session 1</option>
            <option value = "1" >Session 2</option>
        </select>
        <div id="metric"></div>
        <script src="bundle.js"></script>
    </body>
</html>
```

```javascript
// RxQ imports
import connectEngine from "rxq/connect/connectEngine";
import { getActiveDoc, openDoc } from "rxq/Global";
import { clearAll, createSessionObject, getAllInfos, getField, getObject, getTablesAndKeys } from "rxq/Doc";
import { getLayout } from "rxq/GenericObject";
import { lowLevelSelect } from "rxq/Field";
import { suspendUntilCompleted } from "rxq/operators";

// RxJS imports
import { fromEvent } from "rxjs/Observable/fromEvent";
import { forkJoin } from "rxjs/Observable/forkJoin";
import { combineLatest, map, publish, shareReplay, startWith, switchMap, take } from "rxjs/operators";

// Define multiple configurations
const configs = [
    {
        host: "localhost",
        port: 9076,
        isSecure: false
    },
    {
        host: "localhost",
        port: 9077,
        isSecure: false
    }
];

// Create an array of sessions
const engines$ = forkJoin(configs.map(config => connectEngine(config).pipe(shareReplay(1))));

// Create a stream for the current session being viewed
const sessionNo$ = fromEvent(document.querySelector("select"), "change").pipe(
    map( evt => parseInt(evt.target.value)),
    startWith(0)
);

// The current session
const eng$ = engines$.pipe(
    combineLatest(sessionNo$, (engines, no) => engines[no]),
    shareReplay(1)
);

// When switching sessions, get the doc
const app$ = eng$.pipe(
    switchMap(h => openDoc(h, "iris.qvf")),
    shareReplay(1)
);

// When switching sessions, check if the object exists. if not, create it
const obj$ = app$.pipe(
    switchMap(h => getObject(h, "my-calc").pipe(
        switchMap(objH => objH.handle === null ? createSessionObject(h, {
            "qInfo": {
                "qType": "custom",
                "qId": "my-calc"
            },
            "metric": {
                "qValueExpression": "=avg(petal_length)"
            }
        }): [objH])
    )),
    shareReplay(1)
);

// Hook into the layout streams for the current app
const layout$ = obj$.pipe(
    switchMap(h => h.invalidated$.pipe(startWith(h))),
    switchMap(h => getLayout(h)),
    shareReplay(1)
);

layout$.subscribe(layout => {
    document.querySelector("#metric").innerHTML = layout.metric;
});
```