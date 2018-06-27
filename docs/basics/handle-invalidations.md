# Handle Invalidations
In QAE, Handles can have properties or calculated values that change while the session is open. This usually happens as a result of API calls - maybe a filter is applied that changes the calculated data you have from a GenericObject, or maybe you update some metadata in your App properties. 

QAE categorizes Handles into two states: valid and invalid. A valid Handle is one in which you have the latest properties or data for it. An invalid Handle is one in which you don't have the latest properties for it – the Handle has changed on the server since you last used it, but you have not pulled the latest information to your app. There is a disconnect between server state and client state; hence, your Handle is invalid.

Whenever an operation occurs that causes a Handle to go from valid to invalid, the Engine notifies us via the WebSocket connection so that we can respond if needed. A really common use case for this is getting data from a GenericObject. Let's say we have the following stream that gives us data from QAE:

```javascript
import { CreateSessionObject } from "rxq/Doc";
import { GetLayout } from "rxq/GenericObject";
import { shareReplay, switchMap } from "rxjs/operators";

const app$; // assume we have a Doc Handle that we've opened

const obj$ = app$.pipe(
    switchMap(h => h.ask(CreateSessionObject, {
        qInfo: {
            qType: "session"
        },
        myValue: {
            qValueExpression: "=sum(Sales)"
        }
    })),
    shareReplay(1)
);

const layout$ = obj$.pipe(
    switchMap(h => h.ask(GetLayout))
);

layout$.subscribe(console.log);
```

The code above will calculate the layout of our GenericObject once and print it to the console. What if the data model state changes? Suppose we apply a selection that causes our `sum(Sales)` expression to change in value. The layout we received previously will be out of sync with the server. The GenericObject will be invalid.

To resolve this situation, we need to call `getLayout` again. This will get us the up to date data and validate the GenericObject. 

In RxQ, each Handle comes with an `invalidation$` stream on it. This stream will fire with the Handle any time that the Engine API tells us that the Handle has invalidated. Using this stream, we can rewrite our layout logic above to produce a stream of layouts that will be calculated on every invalidation. We will also add an initial layout call to the stream:
```javascript
const layouts$ = obj$.pipe(
    switchMap(h => h.invalidated$.pipe(
        startWith(h)
    )),
    switchMap(h => h.ask(GetLayout))
);
```

Now our `layouts$` stream will stay in sync with the server.