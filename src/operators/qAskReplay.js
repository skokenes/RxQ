import qAsk from "./qAsk";
import { publishReplay, refCount } from "rxjs/operators";

const qAskReplay = (methodname, ...params) => handle$ =>
  handle$.pipe(
    qAsk(methodname, ...params),
    publishReplay(1),
    refCount()
  );

export default qAskReplay;
