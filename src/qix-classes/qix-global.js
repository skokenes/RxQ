import QixClass from "./qix-class";

export default class QixGlobal extends QixClass {
    constructor(session,handle,source,response) {
        super("Global",session,handle,source,response);
    }
}