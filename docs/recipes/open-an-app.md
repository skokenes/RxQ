# Open an App
[Code Sandbox](https://codesandbox.io/embed/o155xl98y)
```javascript
import { connectSession } from "rxq/connect";
import { openDoc } from "rxq/Global";
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

// Log the app handle to the console
app$.subscribe(console.log);
```