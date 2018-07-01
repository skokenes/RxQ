# Make Selections on App Open
[Code Sandbox](https://codesandbox.io/embed/18nnwv6xol)
```javascript
import { connectSession } from "rxq";
import { OpenDoc } from "rxq/Global";
import { GetField } from "rxq/Doc";
import { Select } from "rxq/Field";
import { forkJoin } from "rxjs";
import { mapTo, shareReplay, switchMap } from "rxjs/operators";

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

// Open an app, get the handle, make a few selections, and then multicast it
const app$ = global$.pipe(
  switchMap(h => h.ask(OpenDoc, appname)),
  switchMap(h => {
    const defaultSelection1$ = h.ask(GetField, "species").pipe(
      switchMap(fldH => fldH.ask(Select, "setosa"))
    );

    const defaultSelection2$ = h.ask(GetField, "petal_length").pipe(
      switchMap(fldH => fldH.ask(Select, ">2"))
    );

    return forkJoin(defaultSelection1$, defaultSelection2$).pipe(
      mapTo(h)
    );

  }),
  shareReplay(1)
);

app$.subscribe(console.log);
```