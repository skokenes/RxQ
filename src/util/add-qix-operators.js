import { Observable } from "rxjs";
import outputTypes from "./qix-obs-types";
import QixObservable from "../qix-observables/qix-observable";
import setObsTemp from "./set-obs-temp";

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
            
            return setObsTemp(responseObservable, this.temp);
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

        // If the type to be cast to is the current type, use the current prototype. Otherwise, pull the imported prototype
        const obsClass = (e.obsType.split("-").map(m=>m[0].toUpperCase() + m.slice(1)).join("") === type) ? proto : qObs[e.obsType];
        
        proto.prototype[methodName] = function(...args) {
            const responseObservable = this
                .mergeMap(e=>e[methodNameOrig](...args))
                .let(o=>new obsClass(o, this.temp));
            
            return setObsTemp(responseObservable, this.temp);
        };
    });
}