# Calculate a value with a Generic Object
[Code Sandbox](https://codesandbox.io/embed/zx08zownrl)
```javascript
import { connectSession } from "rxq/connect";
import { openDoc } from "rxq/Global";
import { createSessionObject } from "rxq/Doc";
import { getLayout } from "rxq/GenericObject";
import { shareReplay, switchMap } from "rxjs/operators";

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

// Create a Generic Object with a formula
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

// Get the layout of the Generic Object to calculate the value
const value$ = obj$.pipe(
  switchMap(h => getLayout(h))
);

// Write the value to the DOM
value$.subscribe(layout => {
  document.querySelector("#val").innerHTML = layout.myValue;
});
```