# Reusing Handles
It is common to make multiple API calls on a single Handle. Hence, we usually save off Handles in their own variable that can be reused. [However, Observables in RxJS are cold by default – they create a new producer for each subscriber](https://medium.com/@benlesh/hot-vs-cold-observables-f8094ed53339). In RxQ land, that means that each subscriber to an API call will cause it to run. 

Let's illustrate with an example. Assume you want to use the Global Class to both get the engine version and a list of the available documents. You write the following:
```javascript
import { connectSession } from "rxq/connect";
import { engineVersion, getDocList } from "rxq/Global";
import { switchMap } from "rxjs/operators";

const sesh$ = connectSession({
    host: "localhost",
    port: 4848,
    isSecure: false
});

const version$ = sesh$.pipe(
    switchMap(h => engineVersion(h))
);

version$.subscribe(version => {
    console.log(version);
});

const doclist$ = sesh$.pipe(
    switchMap(h => doclist(h))
);

doclist$.subscribe(doclist => {
    console.log(doclist);
});
```

In the code above, we execute two API calls leveraging the `sesh$` Observable. This Observable is getting two subscribers via the `version$` and `doclist$` subscriptions. **Therefore, this will execute the `connectSession` Observable twice and create two sessions!** This is rarely what we want when working with QAE. Instead, we want to share the Handle across subscribers. This can be done by multicasting the Handle Observable.

[There are many ways to multicast Observables in RxJS.](https://blog.angularindepth.com/rxjs-understanding-the-publish-and-share-operators-16ea2f446635) For RxQ usage, we often find the operator `shareReplay(1)` does the trick for us. This operator:
* will create the Observable producer when going from 0 to 1 observers
* will share the latest seen value with any late subscribers

In most RxQ examples, you will see reused handles written like so:
```javascript
const sesh$ = connectSession({
    host: "localhost",
    port: 4848,
    isSecure: false
}).pipe(
    shareReplay(1)
);
```

Our example from before becomes:
```javascript
import { connectSession } from "rxq/connect";
import { engineVersion, getDocList } from "rxq/Global";
import { shareReplay, switchMap } from "rxjs/operators";

const sesh$ = connectSession({
    host: "localhost",
    port: 4848,
    isSecure: false
}).pipe(
    shareReplay(1)
);

const version$ = sesh$.pipe(
    switchMap(h => engineVersion(h))
);

version$.subscribe(version => {
    console.log(version);
});

const doclist$ = sesh$.pipe(
    switchMap(h => doclist(h))
);

doclist$.subscribe(doclist => {
    console.log(doclist);
});
```

Now, our `version$` and `doclist$` Observables will share the Global Handle produced by `sesh$`. We should multicast any responses from the API that will be used by multiple observers.