# Get a page of data from a HyperCube on invalidation
[Code Sandbox](https://codesandbox.io/embed/8ykpro59x8)
```javascript
import { connectSession } from "rxq";
import { OpenDoc } from "rxq/Global";
import { CreateSessionObject } from "rxq/Doc";
import { GetLayout, GetHyperCubeData } from "rxq/GenericObject";
import { shareReplay, startWith, switchMap } from "rxjs/operators";

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
  switchMap(h => h.ask(GetLayout), (h, layout) => h),
  switchMap(h => h.ask(GetHyperCubeData, "/qHyperCubeDef", [
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