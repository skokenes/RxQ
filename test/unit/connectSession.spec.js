const chai = require("chai");
chai.use(require("chai-generator"));
const expect = chai.expect;

var { Observable, Subject } = require("rxjs");
var { pluck, take } = require("rxjs/operators");
const mockEngine = require("../util/mock-qix-engine.js");
const isObservable = require("../util/isObservable");

// RxQ
var { connectSession } = require("../../dist");
var Handle = require("../../dist/_cjs/handle");
var Session = require("../../dist/_cjs/session");

describe("connectSession", function() {
  // Mock Engine for Testing
  var { server, ws } = mockEngine();
  var config = {
    ws
  };

  const session = connectSession(config);
  var eng$ = session.global$;

  it("should be a function", function() {
    expect(connectSession).to.be.a("function");
  });

  it("should return an object", function() {
    expect(session).to.be.an("object");
  });

  describe("notifications$", function() {
    const notifications$ = session.notifications$;

    it("should be an Observable", function() {
      expect(isObservable(notifications$)).to.equal(true);
    });
  });

  describe("close", function() {
    const close = session.close;

    it("should be a function", function() {
      expect(close).to.be.a("function");
    });
  });

  describe("suspend", function() {
    const suspend = session.suspend;

    it("should be a function", function() {
      expect(suspend).to.be.a("function");
    });
  });

  describe("unsuspend", function() {
    const unsuspend = session.unsuspend;

    it("should be a function", function() {
      expect(unsuspend).to.be.a("function");
    });
  });

  describe("global$", function() {
    it("should be an Observable", function() {
      expect(isObservable(eng$)).to.equal(true);
    });

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
