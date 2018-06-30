import Handle from "../handle";
import { switchMap } from "rxjs/operators";
import { throwError } from "rxjs";

const qAsk = (methodname, ...params) => handle$ =>
  handle$.pipe(
    switchMap(
      handle =>
        handle instanceof Handle
          ? handle.ask(methodname, ...params)
          : throwError(
              new Error(
                "You called 'qAsk' on an Observable that did not return a handle."
              )
            )
    )
  );

export default qAsk;
