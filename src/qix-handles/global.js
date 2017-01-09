import { Observable } from "rxjs";
import Handle from "./handle";
import addQixMethods from "../util/add-qix-methods";

export default class Global extends Handle {
    constructor(session) {
        super(session, -1);
    }
};

addQixMethods(Global,"Global");