const chai = require("chai");
chai.use(require("chai-generator"));
const expect = chai.expect;

var testConnect = require("./connectSession.test.js");
var testGlobal = require("./global.test.js");
const testDoc = require("./doc.test.js");
const testGenericObject = require("./genericObject.test.js");
const testField = require("./field.test.js");
const testGenericBookmark = require("./genericBookmark.test.js");
const testSuspend = require("./suspend.test.js");

describe("Engine E2E test", function() {
  testConnect();
  testGlobal();
  testDoc();
  testGenericObject();
  testField();
  testGenericBookmark();
  testSuspend();
});
