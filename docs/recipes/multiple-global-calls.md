# Multiple Global Calls
[Code Sandbox](https://codesandbox.io/embed/lpzn20399q)
```javascript
import { connectSession } from "rxq";
import { EngineVersion, GetDocList } from "rxq/Global";
import { shareReplay, switchMap } from "rxjs/operators";

// Define the configuration for your session
const config = {
  host: "sense.axisgroup.com",
  isSecure: true
};

// Connect the session and share the Global handle
const session = connectSession(config);
const global$ = session.global$;

// Get the engineVersion
const engVer$ = global$.pipe(
  switchMap(h => h.ask(EngineVersion))
);

// Get the Doc List
const doclist$ = global$.pipe(
  switchMap(h => h.ask(GetDocList))
);

// Write the engine version to the DOM
engVer$.subscribe(response => {
  document.querySelector("#ver").innerHTML = response.qComponentVersion;
});

// Write the doc list to the DOM
doclist$.subscribe(dl => {
  document.querySelector("#content").innerHTML += dl.map(doc => `<li>${doc.qDocName}</li>`).join("");
});
```