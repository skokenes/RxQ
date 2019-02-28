import qAskRetry from "./qAskRetry";
import { publishReplay, refCount } from "rxjs/operators";

const qAskReplay = (methodname, retryAttempts, ...params) => handle$ =>
  handle$.pipe(
    qAskRetry(methodname, retryAttempts, ...params),
    publishReplay(1),
    refCount()
  );

export default qAskReplay;
