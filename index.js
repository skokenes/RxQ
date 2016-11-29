import "core-js/es6/symbol"; // polyfill symbol to enable iterators in IE
import "core-js/fn/function/name"; // polyfill function to enable function constructor.name in IE
import "regenerator-runtime/runtime";

import EngineSession from "./src/engine-session";
import engineWrapper from "./src/engine-wrapper";
import { Observable } from "rxjs";
import GlobalObservable from "./src/qObservables/GlobalObservable.js";
import AppObservable from "./src/qObservables/AppObservable.js";
import FieldObservable from "./src/qObservables/FieldObservable.js";
import GenericBookmarkObservable from "./src/qObservables/GenericBookmarkObservable.js";
import GenericDimensionObservable from "./src/qObservables/GenericDimensionObservable.js";
import GenericMeasureObservable from "./src/qObservables/GenericMeasureObservable.js";
import GenericObjectObservable from "./src/qObservables/GenericObjectObservable.js";
import GenericVariableObservable from "./src/qObservables/GenericVariableObservable.js";
import VariableObservable from "./src/qObservables/VariableObservable.js";
import pack from "raw!./package.json";

const RxQ = {
    version: JSON.parse(pack).version,
    qObservables: {
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
    connectEngine: function(config) {
        // Establish a session, then return a Qix Class type Global from it
        return new EngineSession(config)
            .map(m=>m.getGlobal())
            .let(o=>new GlobalObservable(o));
    },
    $$: {
        engine: engineWrapper
    }
};

export default RxQ;