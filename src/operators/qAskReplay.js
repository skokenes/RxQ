import qAsk from "./qAsk";
import { shareReplay } from "rxjs/operators";

const qAskReplay = (methodname, ...params) => handle$ =>
  handle$.pipe(
    qAsk(methodname, ...params),
    shareReplay(1)
  );

export default qAskReplay;
