import { Observable } from "rxjs";

export default class QRS {
    constructor(cfg, temp) {

        this.temp = ["cold", "warm", "hot"].indexOf(temp) > -1 ? temp : "cold";

        const config = {
            host: cfg.host,
            port: cfg.port || (cfg.isSecure ? 443 : 80),
            prefix: cfg.prefix || "",
            headers: cfg.headers || {},
            services: cfg.services || [],
            isSecure: cfg.isSecure || true,
            key: cfg.key,
            cert: cfg.cert,
            ca: cfg.ca,
            addParams: cfg.addParams || {}
        };

        this.http = getDefaultHTTPModule(config.unsecure);


        const baseRequest = Object.assign({
            host: config.host,
            port: config.port,
            scheme: (config.isSecure ? "http" : "https"),
            key: config.key,
            cert: config.cert,
            ca: config.ca,
            headers: config.headers
        },config.addParams);

        const basePath = "/" + (config.prefix ? config.prefix + "/" : "") + "qrs";

        const xrfkey = generateXrfkey();

        baseRequest.headers["x-qlik-xrfkey"] = xrfkey;

        this.baseRequest = baseRequest;
        this.basePath = basePath;
        this.xrfkey = xrfkey;


    }

    get(path) {
        return this.generateRequest("GET", path);
    }

    post(path) {
        return this.generateRequest("POST", path);
    }

    put(path) {
        return this.generateRequest("PUT", path);
    }

    delete(path) {
        return this.generateRequest("DELETE", path);
    }
};

function generateXrfkey() {
    return (Math.random() * 1e32).toString(36).slice(0, 16);
}

QRS.prototype.generateRequest = function(method, path) {
    const completePath = this.basePath + path + (path.indexOf("?") > -1 ? "&" : "?") + "Xrfkey=" + this.xrfkey;

    const options = Object.assign({
        method: method,
        path: completePath
    },this.baseRequest);

    const http = this.http;

    const observable = Observable.create(function(observer) {
        var req = http.request(options, function (res) {
            var chunks = [];

            res.on("data", function (chunk) {
                chunks.push(chunk);
            });

            res.on("error", function(err) {
                observer.error(err);
            });

            res.on("end", function () {
                var data = JSON.parse(chunks.join(""));
                observer.next(data);
                observer.complete();
            });
        });

        req.end();
    });

    if(this.temp === "cold") {
        return observable;
    }
    else if (this.temp === "warm") {
        return observable
            .publishReplay(1)
            .refCount();
    }
    else if (this.temp === "hot") {
        const hotObs = observable.publishReplay(1);
        hotObs.connect();
        return hotObs;
    }  
}

function getDefaultHTTPModule(unsecure) {
  const IS_NODE = typeof process !== "undefined" && Object.prototype.toString.call(global.process) === "[object process]";
  if (IS_NODE) {
    const lib = unsecure ? 'http' : 'https';
    // avoid webpack grabbing this dependency and cause havoc:
    return eval(`require('${lib}')`);
  }
  return require('http-browserify');
}