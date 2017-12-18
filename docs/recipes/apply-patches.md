# Apply Patches to an Object
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
        </style>
    </head>
    <body>
        <select>
            <option>Dim1</option>
            <option>Dim2</option>
        </select>
        <ul></ul>
        <script src="bundle.js"></script>       
    </body>
</html>
```

```javascript
// RxQ imports
import connectEngine from "rxq/connect/connectEngine";
import { openDoc } from "rxq/Global";
import { createSessionObject, getField } from "rxq/Doc";
import { applyPatches, getLayout, selectListObjectValues } from "rxq/GenericObject";

// RxJS imports
import { fromEvent } from "rxjs/Observable/fromEvent";
import { filter, map, publish, shareReplay, startWith, switchMap, withLatestFrom } from "rxjs/operators";

// Define the configuration for your engine connection
const config = {
    host: "localhost",
    port: 9076,
    isSecure: false
};

// Call connectEngine with the config to produce an Observable for the Global handle
const eng$ = connectEngine(config).pipe(
    shareReplay(1)
);

// Open an app, get the handle and multicast it
const app$ = eng$.pipe(
    switchMap(h => openDoc(h, "random-data.qvf")),
    shareReplay(1)
);

// Create a Generic Object with a list object for the field Dim1
const obj$ = app$.pipe(
    switchMap(h => createSessionObject(h, {
        "qInfo": {
            "qType": "my-listbox"
        },
        "qListObjectDef": {
            "qDef": {
                "qFieldDefs": ["Dim1"]
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
const layout$ = obj$.pipe(
    switchMap(h => h.invalidated$.pipe(startWith(h))),
    switchMap(h => getLayout(h))
);

// Render the list object to the page in an unordered list
layout$.subscribe(layout => {
    const data = layout.qListObject.qDataPages[0].qMatrix;
    document.querySelector("ul").innerHTML = `
        ${ data.map(item => `<li class="${item[0].qState}" data-qno=${item[0].qElemNumber}>
            ${item[0].qText}
        </li>`).join("") }
    `;
});

// Select values when a user clicks on them
const select$ = fromEvent(document.querySelector("body"), "click").pipe(
    filter(evt => evt.target.hasAttribute("data-qno")),
    map(evt => parseInt(evt.target.getAttribute("data-qno"))),  
    withLatestFrom(obj$),
    switchMap(([qno, h]) => selectListObjectValues(h, "/qListObjectDef", [qno], true)),
    publish()
);

select$.connect();

// Change the dimension with a dropdown
const patch$ = fromEvent(document.querySelector("select"), "change").pipe(
    map(evt => evt.target.value),
    withLatestFrom(obj$),
    switchMap(([dim, h]) => applyPatches(h, [
        {
            qPath: "/qListObjectDef/qDef/qFieldDefs/0",
            qOp: "replace",
            qValue: JSON.stringify(dim)
        }
    ])),
    publish()
);

patch$.connect();
```