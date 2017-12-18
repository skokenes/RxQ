# Make Selections on App Open
```javascript
// RxQ imports
import connectEngine from "rxq/connect/connectEngine";
import { openDoc } from "rxq/Global";
import { getField } from "rxq/Doc";
import { select } from "rxq/Field";

// RxJS imports
import { forkJoin } from "rxjs/Observable/forkJoin";
import { mapTo, shareReplay, switchMap } from "rxjs/operators";

// Define the configuration for your engine connection
const config = {
    host: "localhost",
    port: 9076,
    isSecure: false
};

// Call connectEngine with the config to produce an Observable for the Global handle
const eng$ = connectEngine(config).pipe(
    shareReplay(1)
);

// Open an app, get the handle, make a few selections, and then multicast it
const app$ = eng$.pipe(
    switchMap(h => openDoc(h, "random-data.qvf")),
    switchMap(h => {
        const defaultSelection1$ = getField(h, "Dim1").pipe(
            switchMap(fldH => select(fldH, "A"))
        );

        const defaultSelection2$ = getField(h, "Dim2").pipe(
            switchMap(fldH => select(fldH, "b"))
        );

        return forkJoin(defaultSelection1$, defaultSelection2$).pipe(
            mapTo(h)
        );

    }),
    shareReplay(1)
);

app$.subscribe(console.log);
```