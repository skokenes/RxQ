// Polyfills
import "core-js/es6/symbol"; // polyfill symbol to enable iterators in IE
import "core-js/fn/function/name"; // polyfill function to enable function constructor.name in IE
import "regenerator-runtime/runtime";

// Operators
import * as handleOps from "./src/operators/handle/index.js";
import * as coreOps from "./src/operators/index.js";

// Observables
import { Observable } from "rxjs";

import Session from "./src/session";
import pack from "raw!./package.json";

import qrs from "./src/qrs";


const RxQ = {
    version: JSON.parse(pack).version,
    qixVersion: __qlikVersion__,
    operators: Object.assign({
        Handle: handleOps
    },coreOps),
    connectEngine: function(config, opts) {
        return Observable.of(new Session(config, opts).global());
    },
    connectQRS: function(config, temp) {
        return new qrs(config, temp);
    }
};

export default RxQ;