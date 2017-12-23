// Polyfills
import "core-js/es6/symbol"; // polyfill symbol to enable iterators in IE
// import "core-js/fn/function/name"; // may be able to remove this with refactor
import "regenerator-runtime/runtime";

// Observable Factories
import * as src from "./src/index";

import pack from "raw-loader!./package.json";

const baseObj = {
    version: JSON.parse(pack).version,
    qixVersion: JSON.parse(pack)["qix-version"],
};

const RxQ = Object.assign(baseObj, src);

export default RxQ;