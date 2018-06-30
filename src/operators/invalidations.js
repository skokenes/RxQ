import Handle from "../handle";
import { switchMap, startWith } from "rxjs/operators";
import { throwError } from "rxjs";

const invalidations = (startWithInvalidation = false) => handle$ =>
  handle$.pipe(
    switchMap(
      handle =>
        handle instanceof Handle
          ? startWithInvalidation
            ? startWith(handle)(handle.invalidated$)
            : handle.invalidated$
          : throwError(
              new Error(
                "You called 'qInvalidations' on an Observable that did not return a handle."
              )
            )
    )
  );

export default invalidations;
