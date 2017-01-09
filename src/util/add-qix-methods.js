import setObsTemp from "./set-obs-temp";

export default function(proto,type) {
    const engineMethods = require("raw!../schemas/qix/" + __qlikVersion__ + "/" + type + ".json");
    // List of method names
    const methods = JSON.parse(engineMethods);

    methods.forEach((method) => {
        var methodNameCamel = method.n[0].toLowerCase() + method.n.slice(1);
        proto.prototype[methodNameCamel] = function(...args) {
            const request = this.askCold(method,...args);

            return setObsTemp(request, this.session.temp);
            /*
            if(this.session.temp === "cold") {
                return request;
            }
            else if(this.session.temp === "warm") {
                return request
                    .publishReplay(1)
                    .refCount();
            }
            else if(this.session.temp === "hot") {
                const hotRequest = request.publishReplay(1);
                hotRequest.connect();
                return hotRequest;
            }
            */
        }
    });
}