# Make Selections on App Open
[Code Sandbox](https://codesandbox.io/embed/n9rzl7zo0l)
```javascript
import { connectSession } from "rxq/connect";
import { openDoc } from "rxq/Global";
import { getField } from "rxq/Doc";
import { select } from "rxq/Field";
import { forkJoin } from "rxjs/observable/forkJoin";
import { mapTo, shareReplay, switchMap } from "rxjs/operators";

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

// Open an app, get the handle, make a few selections, and then multicast it
const app$ = sesh$.pipe(
  switchMap(h => openDoc(h, appname)),
  switchMap(h => {
    const defaultSelection1$ = getField(h, "species").pipe(
      switchMap(fldH => select(fldH, "setosa"))
    );

    const defaultSelection2$ = getField(h, "petal_length").pipe(
      switchMap(fldH => select(fldH, ">2"))
    );

    return forkJoin(defaultSelection1$, defaultSelection2$).pipe(
      mapTo(h)
    );

  }),
  shareReplay(1)
);

app$.subscribe(console.log);
```