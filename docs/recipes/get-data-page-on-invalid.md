# Get a page of data from a HyperCube on invalidation
[Code Sandbox](https://codesandbox.io/embed/8ykpro59x8)
```javascript
import { connectSession } from "rxq/connect";
import { openDoc } from "rxq/Global";
import { createSessionObject } from "rxq/Doc";
import { getLayout, getHyperCubeData } from "rxq/GenericObject";
import { shareReplay, startWith, switchMap } from "rxjs/operators";

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
    "qHyperCubeDef": {
      "qDimensions": [
        {
          "qDef": {
            "qFieldDefs": ["petal_length"]
          }
        }
      ],
      "qMeasures": [
        {
          "qDef": {
            "qDef": "=avg(petal_width)"
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

data$.subscribe(pages => {
  const data = pages[0].qMatrix;
  document.querySelector("tbody").innerHTML = data.map(row => {
    return `<tr>
      <td>${row[0].qText}</td>
      <td>${row[1].qText}</td>
    </tr>`
  }).join("");
});

```