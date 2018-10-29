const chai = require("chai");
chai.use(require("chai-generator"));
const expect = chai.expect;

var { Observable, Subject } = require("rxjs");
var { pluck, take, shareReplay } = require("rxjs/operators");
const mockEngine = require("../util/mock-qix-engine.js");
const isObservable = require("../util/isObservable");

// RxQ
var { connectSession } = require("../../dist");
var Handle = require("../../dist/_cjs/handle");
var Session = require("../../dist/_cjs/session");

describe("Handle", function() {
  // Mock Engine for Testing
  var { server, ws } = mockEngine();
  var config = {
    ws
  };

  const session = connectSession(config);
  const notifications$ = session.notifications$;
  var eng$ = session.global$;

  it("should have a handle number property", function(done) {
    eng$.subscribe(h => {
      expect(h.handle).to.be.a("number");
      done();
    });
  });

  it("should have an invalidated Observable stream", function(done) {
    eng$.subscribe(h => {
      expect(isObservable(h.invalidated$)).to.equal(true);
      done();
    });
  });

  it("should have a qClass string property", function(done) {
    eng$.subscribe(h => {
      expect(h.qClass).to.be.a("string");
      done();
    });
  });

  it("should have a Session property", function(done) {
    eng$.subscribe(h => {
      expect(h.session).to.be.instanceof(Session);
      done();
    });
  });

  it("should have an ask method", function(done) {
    eng$.subscribe(h => {
      expect(h.ask).to.be.a("function");
      done();
    });
  });

  describe("ask method", function() {
    it("should return an Observable", function(done) {
      eng$.subscribe(h => {
        var req = h.ask("t");
        expect(isObservable(req)).to.equal(true);
        done();
      });
    });

    it("should dispatch a method to the request stream", function(done) {
      eng$.subscribe(handle => {
        var sesh = handle.session;

        var methodName = "myMethod";

        sesh.requests$.pipe(take(1)).subscribe(r => {
          var method = r.method;
          expect(method).to.equal(methodName);
          done();
        });

        var req = handle.ask("myMethod").subscribe();
      });
    });

    it("should dispatch method parameters to the request stream", function(done) {
      eng$.subscribe(handle => {
        var sesh = handle.session;

        var methodParams = ["hello", 42, true];

        sesh.requests$.pipe(take(1)).subscribe(r => {
          var params = r.params;
          expect(params).to.deep.equal(methodParams);
          done();
        });

        var req = handle
          .ask("methodParamsTest - " + sesh.sessionId, ...methodParams)
          .subscribe();
      });
    });

    it("should filter out undefined parameters", function(done) {
      eng$.subscribe(handle => {
        var sesh = handle.session;

        var methodParams = ["hello", 42, undefined];
        var expectedParams = ["hello", 42];

        sesh.requests$.pipe(take(1)).subscribe(r => {
          var params = r.params;
          expect(params).to.deep.equal(expectedParams);
          done();
        });

        var req = handle
          .ask("methodParamsTest - " + sesh.sessionId, ...methodParams)
          .subscribe();
      });
    });

    it("should give requests a numeric id", function(done) {
      eng$.subscribe(handle => {
        var sesh = handle.session;

        sesh.requests$.pipe(take(1)).subscribe(r => {
          var id = r.id;
          expect(id).to.be.a("number");
          done();
        });

        var req = handle.ask("numericId - " + sesh.sessionId).subscribe();
      });
    });

    it("should generate requests for its handle number", function(done) {
      eng$.subscribe(handle => {
        var sesh = handle.session;
        var no = handle.handle;

        sesh.requests$.pipe(take(1)).subscribe(r => {
          var h = r.handle;
          expect(h).to.equal(no);
          done();
        });

        var req = handle.ask("handleNumber - " + sesh.sessionId).subscribe();
      });
    });
  });

  after(function() {
    server.stop();
  });
});
