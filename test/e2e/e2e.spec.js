var Docker = require("dockerode");
var { Observable } = require("rxjs/Observable");
var { publishReplay, refCount, switchMap, withLatestFrom } = require("rxjs/operators");
var path = require("path");

var connectEngine = require("../../dist/connect/connectEngine");
var engineVersion = require("../../dist/global/engineVersion");

var port = "9079";
var image = "qlikea/engine:12.90.0";

// launch a new container
var container$ = Observable.create((observer) => {
    var docker = new Docker();
    
    docker.createContainer({
        Image: image,
        Cmd: ['-S', 'DocumentDirectory=/.tmp'],
        ExposedPorts: {
            "9076/tcp": {}
        },
        HostConfig: {
            RestartPolicy: {
                Name: "always"
            },
            Binds: [`${path.join(process.cwd(),".tmp")}:/.tmp`],// ["./models:/models"],
            PortBindings: {
                "9076/tcp": [{
                    "HostPort": port
                }]
            }
        }
    }, (err, container) => {
        if(err) return observer.error(err);
        
        container.start((err, data) => {
            if(err) return observer.error(err);
            setTimeout(()=>{
                observer.next(container);
                observer.complete();
            }, 2000);    
        });
    });
    
}).pipe(
    publishReplay(1),
    refCount()
);

var eng$ = container$.pipe(
    switchMap(()=>{
        return connectEngine({
            host: "localhost",
            port: port,
            isSecure: false
        });
    }),
    publishReplay(1),
    refCount()
);

eng$.pipe(
    switchMap(handle => engineVersion(handle)),
    withLatestFrom(container$)
).subscribe(
    ([ev, container]) => {
        console.log("engine version is ", ev);
        container.kill((err,result) => {
            container.remove();
        });
    }
);