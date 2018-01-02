# Calculate the response time of the API
[Code Sandbox](https://codesandbox.io/s/7z1r64r510)
```javascript
import { connectSession } from "rxq/connect";
import { openDoc } from "rxq/Global";
import { map, shareReplay, switchMap } from "rxjs/operators";

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

// Calculate the time it takes to open an app
const appOpenTime$ = sesh$.pipe(
  switchMap(h => {
    const start = Date.now();
    return openDoc(h, appname).pipe(
      map(() => Date.now() - start)
    );
  })
);

appOpenTime$.subscribe(time => {
  document.querySelector("#time").innerHTML = time;
});
```