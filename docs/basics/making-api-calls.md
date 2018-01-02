# Making API Calls
As discussed in [Core Concepts](), RxQ provides functions that ingest a Qlik Handle and necessary parameters, and then return an Observable for the response.

These functions are organized in RxQ based on Qlik class. Let's use the `EngineVersion` method from Qlik's Global class as an example. We can import this from RxQ like so:
```javascript
import { engineVersion } from "rxq/Global";
```

To use it, we just call it against a Global Handle for a session. Then, we can subscribe to get the engine version back:
```javascript
const version$ = engineVersion(globalHandle);

version$.subscribe((version) => {
    console.log(version);
});
```

There's just one problem here: how do we get the Global Handle in order to make the call? Let's review.

## Getting Handles
Handles are provided to us by QAE. Therefore, we can only receive them asychronously through some sort of API call. The Engine has several API calls that will return Handles, such as:
* [OpenDoc](http://help.qlik.com/en-US/sense-developer/November2017/Subsystems/EngineAPI/Content/Classes/GlobalClass/Global-class-OpenDoc-method.htm), which will return a Doc Handle from a Global Handle
* [GetField](http://help.qlik.com/en-US/sense-developer/November2017/Subsystems/EngineAPI/Content/Classes/AppClass/App-class-GetField-method.htm), which will return a Field Handle from a Doc Handle

RxQ automatically parses the results of Engine API calls and produces Handles for you as needed. However, this still has to happen asynchronously, so we have to write asynchronous logic to connect a Handle with an API call. This is where higher order Observables come into play.

## Leveraging Higher Order Observables for API Calls
Higher Order Observables are essentially Observables of Observables. They allow us to create asynchronous data streams based on other asynchronous data streams. This concept is pertitent to us when making API calls, since we are trying to produce an async API call from an asynchronously provided Handle.

RxJS makes handling these higher order observables easy using operators like `mergeMap`, `concatMap`, and `switchMap` to flatten them into normal Observables. 

When using `connectSession`, the resulting Observable provides the Global Handle for the established session. By combining this Observable with the `switchMap` operator, we can get our engine version like so:

```javascript
import { connectSession } from "rxq/connect";
import { engineVersion } from "rxq/Global";
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
```

We commonly use `switchMap` when utilizing RxQ because we often only care about making an API call on the latest Handle provided. For more on higher order observables, [we recommend this course](https://egghead.io/courses/use-higher-order-observables-in-rxjs-effectively).