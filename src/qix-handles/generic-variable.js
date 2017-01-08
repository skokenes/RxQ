import { Observable } from "rxjs";
import Handle from "./handle";
import addQixMethods from "../util/add-qix-methods";
import setObsTemp from "../util/set-obs-temp";

export default class GenericVariable extends Handle {
    constructor(session, handle) {
        super(session, handle);

        this.layout$ = (() => {
            const response = this.invalidated$
                .mergeMap(gb=>gb.getLayout());
            
            return setObsTemp(response, this.session.temp);
            
            /*
            
            if(this.session.temp === "cold") {
                return response;
            }
            else if(this.session.temp === "warm") {
                return response
                    .publishReplay(1)
                    .refCount();
            }
            else if(this.session.temp === "hot") {
                const hotRequest = response.publishReplay(1);
                hotRequest.connect();
                return hotRequest;
            }  
            */
        })();
    }
};

addQixMethods(GenericVariable,"GenericVariable");