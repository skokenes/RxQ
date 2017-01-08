import { Observable } from "rxjs";
import Handle from "./handle";
import addQixMethods from "../util/add-qix-methods";

export default class GenericBookmark extends Handle {
    constructor(session, handle) {
        super(session, handle);

        this.layout$ = (() => {
            const response = this.invalidated$
                .mergeMap(gb=>gb.getLayout());
            
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
        })();
    }
};

addQixMethods(GenericBookmark,"GenericBookmark");