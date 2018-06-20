const chai = require("chai");
const expect = chai.expect;

var { Observable } = require("rxjs");
var { shareReplay } = require("rxjs/operators");
const mockEngine = require("../util/mock-qix-engine.js");

// RxQ
var { connectSession } = require("../../dist");
var global = require("../../dist/global");

describe("Observable from Qix Calls", function() {
  // Mock Engine for Testing
  var { server, ws } = mockEngine();
  var config = {
    ws
  };

  const session = connectSession(config);
  var eng$ = session.global$.pipe(shareReplay(1));

  describe("Global", function() {
    it("should have an EngineVersion enum", function() {
      expect(global).to.have.property("EngineVersion");
    });

    describe("EngineVersion", function() {
      it("should be a string", function() {
        expect(global.EngineVersion).to.be.a("string");
      });
    });
  });

  after(function() {
    server.stop();
  });
});
