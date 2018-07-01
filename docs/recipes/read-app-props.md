# Read app properties
[Code Sandbox](https://codesandbox.io/embed/o4jjp82zwy)
```javascript
import { connectSession } from "rxq";
import { OpenDoc } from "rxq/Global";
import { GetAppProperties } from "rxq/Doc";
import { shareReplay, switchMap } from "rxjs/operators";

// Define the configuration for your session
const config = {
  host: "sense.axisgroup.com",
  isSecure: true
};

// Connect the session and share the Global handle
const session = connectSession(config);
const global$ = session.global$;

// Open an app and share the app handle
const app$ = global$.pipe(
  switchMap(h => h.ask(OpenDoc, "aae16724-dfd9-478b-b401-0d8038793adf")),
  shareReplay(1)
);

// Get the app properties
const appProps$ = app$.pipe(
  switchMap(h => h.ask(GetAppProperties))
);

// Write the app title and modified date to the DOM
appProps$.subscribe(props => {
  document.querySelector("#content").innerHTML = `The app ${props.qTitle} was last modified at ${props.modifiedDate}`;
});
```