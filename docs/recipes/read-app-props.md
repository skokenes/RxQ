# Read app properties
[Code Sandbox](https://codesandbox.io/embed/ppm3x3r2qj)
```javascript
import { connectSession } from "rxq/connect";
import { openDoc } from "rxq/Global";
import { getAppProperties } from "rxq/Doc";
import { shareReplay, switchMap } from "rxjs/operators";

// Define the configuration for your session
const config = {
  host: "sense.axisgroup.com",
  isSecure: true
};

// Connect the session and share the Global handle
const sesh$ = connectSession(config).pipe(
  shareReplay(1)
);

// Open an app and share the app handle
const app$ = sesh$.pipe(
  switchMap(h => openDoc(h, "aae16724-dfd9-478b-b401-0d8038793adf")),
  shareReplay(1)
);

// Get the app properties
const appProps$ = app$.pipe(
  switchMap(h => getAppProperties(h))
);

// Write the app title and modified date to the DOM
appProps$.subscribe(props => {
  document.querySelector("#content").innerHTML = `The app ${props.qTitle} was last modified at ${props.modifiedDate}`;
});
```