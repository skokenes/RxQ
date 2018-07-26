import { switchMap } from "rxjs/operators";
import { throwError } from "rxjs";

const qAsk = (methodname, ...params) => handle$ =>
  handle$.pipe(switchMap(handle => handle.ask(methodname, ...params)));

export default qAsk;
