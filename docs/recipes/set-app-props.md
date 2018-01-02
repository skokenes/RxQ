# Set App Properties and Listen for Changes
[Code Sandbox](https://codesandbox.io/embed/54pv30m2vx)
```javascript
import { connectSession } from "rxq/connect";
import { openDoc } from "rxq/Global";
import { getAppProperties, setAppProperties } from "rxq/Doc";
import { publish, shareReplay, startWith, 
  switchMap, withLatestFrom } from "rxjs/operators";
import { fromEvent } from "rxjs/observable/fromEvent";

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

// Get the app properties any time the app invalidates
const appProps$ = app$.pipe(
  switchMap(h => h.invalidated$.pipe(startWith(h))),
  switchMap(h => getAppProperties(h))
);

// Write the app title and modified date to the DOM
appProps$.subscribe(props => {
  document.querySelector("#content").innerHTML = `The app's prop "random" is ${props.random}`;
});

// Whenever a user clicks the button, update the app props with a random prop
const updateAppProps$ = fromEvent(document.querySelector("#set-random"), "click").pipe(
  withLatestFrom(app$),
  switchMap(([evt, h]) => setAppProperties(h, {
    "random": Math.random()
  })),
  publish()
);

// Connect the app update mechanism
updateAppProps$.connect();
```