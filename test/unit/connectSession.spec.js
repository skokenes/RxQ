const chai = require("chai");
chai.use(require("chai-generator"));
const expect = chai.expect;

var { Observable, Subject } = require("rxjs");
var { pluck, take } = require("rxjs/operators");
const mockEngine = require("../util/mock-qix-engine.js");

// RxQ
var { connectSession } = require("../../dist");
var { connectSession: connectSessionLegacy } = require("../../dist/connect");
var Handle = require("../../dist/_cjs/handle");
var Session = require("../../dist/_cjs/session");

describe("connectSession", function() {
  // Mock Engine for Testing
  var { server, ws } = mockEngine();
  var config = {
    ws
  };
  var eng$ = connectSession(config);

  it("should be a function", function() {
    expect(connectSession).to.be.a("function");
  });

  it("should return an Observable", function() {
    expect(eng$).to.be.instanceof(Observable);
  });

  it("should be accessible from the legacy entry point", () => {
    expect(connectSession).to.equal(connectSessionLegacy);
  });

  describe("connectSession response", function() {
    it("should return a Handle", function(done) {
      eng$.subscribe(h => {
        expect(h).to.be.instanceof(Handle);
        done();
      });
    });

    it("the Handle should be -1", function(done) {
      eng$.subscribe(h => {
        expect(h.handle).to.equal(-1);
        done();
      });
    });
  });

  after(function() {
    server.stop();
  });
});
