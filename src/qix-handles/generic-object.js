import { Observable } from "rxjs";
import Handle from "./handle";
import addQixMethods from "../util/add-qix-methods";
import setObsTemp from "../util/set-obs-temp";

export default class GenericObject extends Handle {
    constructor(session, handle) {
        super(session, handle);

        this.layout$ = (() => {
            const response = this.invalidated$
                .mergeMap(gb=>gb.getLayout());
            
            return setObsTemp(response, this.session.temp);
        })();
    }
};

addQixMethods(GenericObject,"GenericObject");