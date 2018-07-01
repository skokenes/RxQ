# Open an App
[Code Sandbox](https://codesandbox.io/embed/54mj0myvlx)
```javascript
import { connectSession } from "rxq";
import { OpenDoc } from "rxq/Global";
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

// Log the app handle to the console
app$.subscribe(console.log);
```