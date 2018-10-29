import { switchMap } from "rxjs/operators";

const qAsk = (methodname, ...params) => handle$ =>
  handle$.pipe(switchMap(handle => handle.ask(methodname, ...params)));

export default qAsk;
