var Docker = require("dockerode");
var { Observable } = require("rxjs/Observable");
var { publishReplay, refCount } = require("rxjs/operators");
var path = require("path");


function createContainer(image, port) {
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

    return container$;
}


module.exports = createContainer;