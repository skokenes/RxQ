// Polyfills
import "core-js/es6/symbol"; // polyfill symbol to enable iterators in IE
import "core-js/fn/function/name"; // polyfill function to enable function constructor.name in IE
import "regenerator-runtime/runtime";

// Observables
import { Observable } from "rxjs";
import GlobalObservable from "./src/qix-observables/global-observable.js";
import AppObservable from "./src/qix-observables/app-observable.js";
import FieldObservable from "./src/qix-observables/field-observable.js";
import GenericBookmarkObservable from "./src/qix-observables/generic-bookmark-observable.js";
import GenericDimensionObservable from "./src/qix-observables/generic-dimension-observable.js";
import GenericMeasureObservable from "./src/qix-observables/generic-measure-observable.js";
import GenericObjectObservable from "./src/qix-observables/generic-object-observable.js";
import GenericVariableObservable from "./src/qix-observables/generic-variable-observable.js";
import VariableObservable from "./src/qix-observables/variable-observable.js";

import Session from "./src/session";
import pack from "raw!./package.json";

import qrs from "./src/qrs";


const RxQ = {
    version: JSON.parse(pack).version,
    qixVersion: __qlikVersion__,
    qixObservables: {
        GlobalObservable,
        AppObservable,
        FieldObservable,
        GenericBookmarkObservable,
        GenericDimensionObservable,
        GenericMeasureObservable,
        GenericObjectObservable,
        GenericVariableObservable,
        VariableObservable
    },
    connectEngine: function(config, opts) {
        return Observable.defer(()=> Observable.of(new Session(config, opts).global()))
            .let(o=>new GlobalObservable(o, opts.temp))
            .publishReplay(1)
            .refCount();
    },
    connectQRS: function(config, temp) {
        return new qrs(config, temp);
    }
};

export default RxQ;