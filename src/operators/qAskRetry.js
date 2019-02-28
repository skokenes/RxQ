import { switchMap, retry } from "rxjs/operators";

const qAskRetry = (methodname, retryAttempts, ...params) => handle$ =>
  handle$.pipe(
    switchMap(handle =>
      handle.ask(methodname, ...params).pipe(retry(retryAttempts))
    )
  );

export default qAskRetry;
