import Handle from "../handle.js";
import { map } from "rxjs/operators";

export default returnParam => src$ =>
  src$.pipe(
    map(r => {
      var hasQReturn = r.hasOwnProperty("qReturn");
      var hasQType = hasQReturn ? r.qReturn.hasOwnProperty("qType") : false;

      if (hasQType) {
        var qClass = r.qReturn.qType;
        return new Handle(handle.session, r.qReturn.qHandle, qClass);
      } else if (returnParam) {
        return r[returnParam];
      } else if (hasQReturn) return r.qReturn;
      else return r;
    })
  );
