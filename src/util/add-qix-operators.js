import { Observable } from "rxjs";
import outputTypes from "./qix-obs-types";
import QixObservable from "../qix-observables/qix-observable";

export default function(proto,type) {
    const rawMethods = require("raw!../schemas/qix/" + __qlikVersion__ + "/" + type + ".json");
    const methods = JSON.parse(rawMethods);

    methods.forEach(method=>{
        const methodName = method.n;
        const methodNameCamel = methodName[0].toLowerCase() + methodName.slice(1);
        const operatorName = "q" + methodName;

        proto.prototype[operatorName] = function(...args) {
            const responseObservable = this
                .mergeMap(e=>e[methodNameCamel](...args));
            
            if(this.temp === "cold") {
                return responseObservable;
            }
            else if(this.temp === "warm") {
                return responseObservable
                    .publishReplay(1)
                    .refCount();
            }
            else if(this.temp === "hot") {
                const hotRequest = responseObservable.publishReplay(1);
                hotRequest.connect();
                return hotRequest;
            }
            
            /* Not sure why I ever needed this? Keep until validated that it didnt break anything...
            const observable = new Observable();
            observable.source = responseObservable;
           return observable;
            */
        }
    });

    // Override certain operators to return QixObservables
    const outputs = outputTypes[type];
    const qObs = outputs
        .reduce((acc,curr) => {
            const keys = Object.keys(acc);
            if(keys.indexOf(curr.obsType) === -1) {
                acc[curr.obsType] = require("../qix-observables/" + curr.obsType + "-observable");
            }
            return acc;
        },{});

    outputs.forEach(e=>{
        const methodName = "q" + e.method;
        const methodNameOrig = e.method[0].toLowerCase() + e.method.slice(1);
        const obsClass = qObs[e.obsType];
        proto.prototype[methodName] = function(...args) {
            const responseObservable = this
                .mergeMap(e=>e[methodNameOrig](...args))
                .let(o=>new obsClass(o, this.temp));
            if(this.temp === "cold") {
                return responseObservable;
            }
            else if(this.temp === "warm") {
                return responseObservable
                    .publishReplay(1)
                    .refCount();
            }
            else if(this.temp === "hot") {
                const hotRequest = responseObservable.publishReplay(1);
                hotRequest.connect();
                return hotRequest;
            }
        };
    });
}