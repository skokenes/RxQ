import Handle from "../handle.js";
import { map } from "rxjs/operators";

export default (handle, returnParam) => src$ =>
  src$.pipe(
    map(r => {
      var hasQType =
        r.hasOwnProperty("qReturn") && r.qReturn.hasOwnProperty("qType");

      if (hasQType) {
        var qClass = r.qReturn.qType;
        return new Handle(handle.session, r.qReturn.qHandle, qClass);
      } else if (returnParam) {
        return r[returnParam];
      } else {
        return r;
      }
    })
  );
