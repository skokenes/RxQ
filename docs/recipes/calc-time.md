# Calculate the response time of the API
[Code Sandbox](https://codesandbox.io/embed/3kvj773np5)
```javascript
import { connectSession } from "rxq";
import { OpenDoc } from "rxq/Global";
import { map, switchMap } from "rxjs/operators";

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

// Calculate the time it takes to open an app
const appOpenTime$ = global$.pipe(
  switchMap(h => {
    const start = Date.now();
    return h.ask(OpenDoc, appname).pipe(
      map(() => Date.now() - start)
    );
  })
);

appOpenTime$.subscribe(time => {
  document.querySelector("#time").innerHTML = time;
});
```