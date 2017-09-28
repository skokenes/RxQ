// Polyfills
import "core-js/es6/symbol"; // polyfill symbol to enable iterators in IE
// import "core-js/fn/function/name"; // may be able to remove this with refactor
import "regenerator-runtime/runtime";

// Operators
import * as handleOps from "./src/operators/handle/index.js";
import * as coreOps from "./src/operators/index.js";

import connectEngine from "./src/connect/connectEngine";
import connectQRS from "./src/connect/connectQRS";
import pack from "raw-loader!./package.json";

const RxQ = {
    version: JSON.parse(pack).version,
    qixVersion: JSON.parse(pack)["qix-version"],
    operators: Object.assign({
        Handle: handleOps
    },coreOps),
    connectEngine: connectEngine,
    connectQRS: connectQRS
};

export default RxQ;