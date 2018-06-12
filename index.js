// Polyfills
import "core-js/es6/symbol"; // polyfill symbol to enable iterators in IE
// import "core-js/fn/function/name"; // may be able to remove this with refactor
import "regenerator-runtime/runtime";

// Observable Factories
import * as src from "./src/index";

import pack from "./package.json";

const baseObj = {
  version: pack.version,
  qixVersion: pack["qix-version"]
};

const RxQ = Object.assign(baseObj, src);

export default RxQ;
