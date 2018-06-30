# Shortcut Operators for Common Patterns

## Common Patterns
In the [Making API Calls](making-api-calls.html) section, we discuss using methods like `mergeMap`, `switchMap`, and `concatMap` along with a Handle's `ask` method to turn an Observable of a Handle into an Observable of an API call. For example, to get the engine version from a global handle, you would do the following:
```javascript
// Assuming an Observable of a Global Handle
const global$;

const engineVersion$ = global$.pipe(
  switchMap(handle => handle.ask(EngineVersion))
);
```

When working with Handle Observables, you often want to reuse them to make API calls. In this scenario, it is common to [share the handle observable via multicasting](reusing-handles.html):
```javascript
const app$ = global$.pipe(
  switchMap(handle => handle.ask(OpenDoc, "my-app.qvf")),
  shareReplay(1)
);
```

Similarly, you can get a stream of [handle invalidations](handle-invalidations.html) using the following pattern:
```javascript
// Assume an Observable of a Doc Handle
const app$;

const appInvalidations$ = app$.pipe(
  switchMap(handle => handle.invalidated$)
);
```

## Simplifying these Patterns
Manually using operators like `switchMap`, `mergeMap`, and `concatMap` can be useful when writing more complex async logic with the Qlik Engine. However, in our experience the vast majority of API calls with RxQ follow the patterns above. It can get tedious rewriting these patterns over and over, so we have encapsulated the logic into 3 helper operators:

### qAsk
`qAsk` is an alias for `switchMap(handle => handle.ask())`. For example, the following patterns are equivalent:

*EngineVersion using original pattern*
```javascript
const engineVersion$ = global$.pipe(
  switchMap(handle => handle.ask(EngineVersion))
);
```

*EngineVersion using qAsk*
```javascript
import { qAsk } from "rxq";

const engineVersion$ = global$.pipe(
  qAsk(EngineVersion)
);
```

### qAskReplay
`qAskReplay` is an alias for `switchMap(handle => handle.ask()), shareReplay(1)`. For example, the following patterns are equivalent:

*App Handle using original pattern*
```javascript
const doc$ = global$.pipe(
  switchMap(handle => handle.ask(OpenDoc, "my-app.qvf")),
  shareReplay(1)
);
```

*App Handle using qAskReplay*
```javascript
import { qAskReplay } from "rxq";

const doc$$ = global$.pipe(
  qAskReplay(OpenDoc, "my-app.qvf")
);
```

### qInvalidations
`qInvalidations` is an alias for `switchMap(handle => handle.invalidated$)`. For example, the following patterns are equivalent:

*App Handle invalidations using original pattern*
```javascript
const docInvalidations$ = doc$.pipe(
  switchMap(handle => handle.invalidated$)
);
```

*App Handle invalidations using qInvalidations*
```javascript
import { qInvalidations } from "rxq";

const docInvalidations$ = doc$.pipe(
  qInvalidations()
);
```

In many cases, it's useful to assume an initial invalidation for a Qlik Handle when working with it. Automatically starting with an invalidation can be accomplished by calling `qInvalidations(true)`:

*App Handle invalidations with initial handle emit*
```javascript
import { qInvalidations } from "rxq";

const docInvalidations$ = doc$.pipe(
  qInvalidations(true)
);
```

Putting these together, you can greatly simplify some common scenarios. For example, consider getting a stream of layouts for a generic object:

*GenericObject layouts via original pattern*
```javascript
const layouts$ = object$.pipe(
  switchMap(handle => handle.invalidated$.pipe(
      startWith(handle)
    )
  ),
  switchMap(handle => handle.ask(GetLayout))
);
```

*GenericObject layouts using shortcut operators*
```javascript
const layouts$ = object$.pipe(
  qInvalidations(true),
  qAsk(GetLayout)
);
```