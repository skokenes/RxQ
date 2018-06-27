# Reusing Handles
It is common to make multiple API calls on a single Handle. Hence, we usually save off Handles in their own variable that can be reused. [However, Observables in RxJS are cold by default – they create a new producer for each subscriber](https://medium.com/@benlesh/hot-vs-cold-observables-f8094ed53339). In RxQ land, that means that each subscriber to an API call will cause it to run. 

Let's illustrate with an example. Assume you want to open an app and use the Doc Class to get both the app properties and the app layout. You write the following:
```javascript
import { connectSession } from "rxq";
import { EngineVersion, OpenDoc } from "rxq/Global";
import { GetAppProperties, GetAppLayout } from "rxq/Doc";
import { switchMap } from "rxjs/operators";

const session = connectSession({
    host: "localhost",
    port: 4848,
    isSecure: false
});

const doc$ = session.global$.pipe(
    switchMap(handle => handle.ask(OpenDoc))
);

const appProps$ = doc$.pipe(
    switchMap(handle => handle.ask(GetAppProperties))
);

const appLayout$ = doc$.pipe(
    switchMap(handle = handle.ask(GetAppLayout))
);

appProps$.subscribe(version => {
    console.log(version);
});

appLayout$.subscribe(doclist => {
    console.log(doclist);
});
```

In the code above, we execute two API calls leveraging the `doc$` Observable. This Observable is getting two subscribers via the `appProps$` and `appLayout$` subscriptions. **Therefore, this will execute the `doc$` Observable twice, running the OpenDoc command twice!** This is rarely what we want when working with QAE, especially when creating new Generic Objects. Instead, we want to share the Handle across subscribers. This can be done by multicasting the Handle Observable.

[There are many ways to multicast Observables in RxJS.](https://blog.angularindepth.com/rxjs-understanding-the-publish-and-share-operators-16ea2f446635) For RxQ usage, we often find the operator `shareReplay(1)` does the trick for us. This operator:
* will create the Observable producer when going from 0 to 1 observers
* will share the latest seen value with any late subscribers

In most RxQ examples, you will see reused handles written like so:
```javascript
doc$.pipe(
    shareReplay(1)
);
```

Our example from before becomes:
```javascript
import { connectSession } from "rxq";
import { EngineVersion, OpenDoc } from "rxq/Global";
import { GetAppProperties, GetAppLayout } from "rxq/Doc";
import { switchMap, shareReplay } from "rxjs/operators";

const session = connectSession({
    host: "localhost",
    port: 4848,
    isSecure: false
});

const doc$ = session.global$.pipe(
    switchMap(handle => handle.ask(OpenDoc)),
    shareReplay(1)
);

const appProps$ = doc$.pipe(
    switchMap(handle => handle.ask(GetAppProperties))
);

const appLayout$ = doc$.pipe(
    switchMap(handle = handle.ask(GetAppLayout))
);

appProps$.subscribe(version => {
    console.log(version);
});

appLayout$.subscribe(doclist => {
    console.log(doclist);
});
```

Now, our `appProps$` and `appLayout$` Observables will share the Global Handle produced by `doc$`. We should multicast any responses from the API that will be used by multiple observers.