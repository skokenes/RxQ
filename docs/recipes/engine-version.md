# Get the Engine Version
[Code Sandbox](https://codesandbox.io/embed/24vyyow0jn)
```javascript
// Import the connectSession function, engineVersion function, and switchMap operator
import { connectSession } from "rxq";
import { EngineVersion } from "rxq/Global";
import { switchMap } from "rxjs/operators";

// Define the configuration for your session
const config = {
  host: "sense.axisgroup.com",
  isSecure: true
};

// Connect the session
const session = connectSession(config);
const global$ = session.global$;

// Get the engineVersion
const engVer$ = global$.pipe(
  switchMap(h => h.ask(EngineVersion))
);

// Write the engine version to the DOM
engVer$.subscribe(response => {
  document.querySelector("#ver").innerHTML = response.qComponentVersion;
});
```