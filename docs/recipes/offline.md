# Offline
```html
<html>
    <head>
        <style>

            .s {
                background: green;
                color: white;
            }

            .x {
                background: grey;
                color: black;
            }

            #offline {
                position: absolute;
                top: 0px;
                bottom: 0px;
                left: 0px;
                right: 0px;
                background-color: grey;
                opacity: 0.75;
                padding-top: 100px;
                font-size: 72px;
                text-align: center;
                color: black;
            }

            .hidden {
                display: none;
            }

        </style>
    </head>
    <body>
        <ul></ul>
        <div id="metric"></div>
        <div id="offline" >
            OFFLINE
        </div>
        <script src="bundle.js"></script>
    </body>
</html>
```

```javascript
// RxQ imports
import connectEngine from "rxq/connect/connectEngine";
import { getActiveDoc, openDoc } from "rxq/Global";
import { clearAll, createSessionObject, getAllInfos, getField, getObject, getTablesAndKeys } from "rxq/Doc";
import { getLayout, selectListObjectValues } from "rxq/GenericObject";
import { lowLevelSelect } from "rxq/Field";
import { suspendUntilCompleted } from "rxq/operators";

// RxJS imports
import { fromEvent } from "rxjs/Observable/fromEvent";
import { forkJoin } from "rxjs/Observable/forkJoin";
import { combineLatest, filter, map, mapTo, merge, publish, shareReplay, startWith, switchMap, take, tap, withLatestFrom } from "rxjs/operators";


const online$ = fromEvent(window, "online").pipe(mapTo(true)).pipe(
    merge(fromEvent(window, "offline").pipe(mapTo(false))),
    startWith(true)
);

online$.subscribe(status => {
    if(status) {
        document.querySelector("#offline").classList.add("hidden");
    }
    else {
        document.querySelector("#offline").classList.remove("hidden");
    }
});

// Define multiple configurations
const config = {
    host: "localhost",
    port: 9076,
    isSecure: false
};

const eng$ = online$.pipe(
    filter(f => f),
    switchMap(() => connectEngine(config)),
    shareReplay(1)
);

const app$ = eng$.pipe(
    switchMap(h => openDoc(h, "iris.qvf")),
    shareReplay(1)
);

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

layouts$.subscribe(layout => {
    document.querySelector("#metric").innerHTML = layout.value;
});

// Create a Generic Object with a list object for the field Dim1
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

// Get a stream of layouts
const listboxLayout$ = listbox$.pipe(
    switchMap(h => h.invalidated$.pipe(startWith(h))),
    switchMap(h => getLayout(h))
);

// Render the list object to the page in an unordered list
listboxLayout$.subscribe(layout => {
    const data = layout.qListObject.qDataPages[0].qMatrix;
    document.querySelector("ul").innerHTML = `
        ${ data.map(item => `<li class="${item[0].qState}" data-qno=${item[0].qElemNumber}>
            ${item[0].qText}
        </li>`).join("") }`;
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