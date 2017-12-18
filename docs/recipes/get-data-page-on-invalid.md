# Get a page of data from a HyperCube on invalidation
```javascript
// RxQ imports
import connectEngine from "rxq/connect/connectEngine";
import { openDoc } from "rxq/Global";
import { createSessionObject } from "rxq/Doc";
import { getLayout, getHyperCubeData } from "rxq/GenericObject";

// RxJS imports
import {  shareReplay, startWith, switchMap } from "rxjs/operators";

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

// Create a Generic Object with a hypercube
const obj$ = app$.pipe(
    switchMap(h => createSessionObject(h, {
        "qInfo": {
            "qType": "my-listbox"
        },
        "qHyperCubeDef": {
            "qDimensions": [
                {
                    "qDef": {
                        "qFieldDefs": ["TransID"]
                    }
                }
            ],
            "qMeasures": [
                {
                    "qDef": {
                        "qDef": "=sum(Expression1)"
                    }
                }
            ]
        }
    })),
    shareReplay(1)
);

// On invalidation, get layout to validate, then request a data page
const data$ = obj$.pipe(
    switchMap(h => h.invalidated$.pipe(startWith(h))),
    switchMap(h => getLayout(h), (h, layout) => h),
    switchMap(h => getHyperCubeData(h, "/qHyperCubeDef", [
        {
            qTop: 0,
            qLeft: 0,
            qWidth: 2,
            qHeight: 100
        }
    ]))
);

data$.subscribe(console.info);
```