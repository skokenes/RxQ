# Get HyperCube Pages in Sequence
[Code Sandbox](https://codesandbox.io/embed/0ylj0ok6xw)
```javascript
import { connectSession } from "rxq/connect";
import { openDoc } from "rxq/Global";
import { createSessionObject } from "rxq/Doc";
import { getLayout, getHyperCubeData } from "rxq/GenericObject";
import { reduce, shareReplay, startWith, switchMap } from "rxjs/operators";
import { concat } from "rxjs/observable/concat";

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

// Create a Generic Object with a hypercube
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

// On invalidation, get layout to validate, then request multiple pages in sequence
const data$ = obj$.pipe(
  switchMap(h => h.invalidated$.pipe(startWith(h))),
  switchMap(h => getLayout(h), (h, layout) => [h, layout]),
  switchMap(([h, layout]) => {
    const totalRows = layout.qHyperCube.qSize.qcy;
    const rowsPerPage = 10;
    const pageCt = Math.ceil(totalRows / rowsPerPage);

    const pageRequests = new Array(pageCt)
      .fill(undefined)
      .map((m, i) => getHyperCubeData(h, "/qHyperCubeDef", [
        {
          qTop: i * rowsPerPage,
          qLeft: 0,
          qWidth: 2,
          qHeight: rowsPerPage
        }
      ]));

    return concat(...pageRequests).pipe(
      reduce((acc, curr) => acc.concat(curr))
    );
  })
);

// Print the pages to the DOM in a table
data$.subscribe(pages => {
  const data = pages.reduce((acc, page) => acc.concat(page.qMatrix),[]);
  
  document.querySelector("tbody").innerHTML = data.map(row => {
    return `<tr>
      <td>${row[0].qText}</td>
      <td>${row[1].qText}</td>
    </tr>`
  }).join("");
});

```