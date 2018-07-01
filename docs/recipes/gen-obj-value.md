# Calculate a value with a Generic Object
[Code Sandbox](https://codesandbox.io/embed/zx08zownrl)
```javascript
import { connectSession } from "rxq";
import { OpenDoc } from "rxq/Global";
import { CreateSessionObject } from "rxq/Doc";
import { GetLayout } from "rxq/GenericObject";
import { shareReplay, switchMap } from "rxjs/operators";

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

// Create a Generic Object with a formula
const obj$ = app$.pipe(
  switchMap(h => h.ask(CreateSessionObject, {
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
  switchMap(h => h.ask(GetLayout))
);

// Write the value to the DOM
value$.subscribe(layout => {
  document.querySelector("#val").innerHTML = layout.myValue;
});
```