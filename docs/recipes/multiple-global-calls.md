# Multiple Global Calls
[Code Sandbox](https://codesandbox.io/embed/25joqo38p)
```javascript
import { connectSession } from "rxq/connect";
import { engineVersion, getDocList } from "rxq/Global";
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

// Get the engineVersion
const engVer$ = sesh$.pipe(
  switchMap(h => engineVersion(h))
);

// Get the Doc List
const doclist$ = sesh$.pipe(
  switchMap(h => getDocList(h))
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