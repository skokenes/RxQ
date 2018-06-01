// with qix version, go through the schema and publish into operators
var fs = require("fs-extra");
var path = require("path");
var pack = JSON.parse(fs.readFileSync("package.json", "utf8"));
var Docker = require("dockerode");
var { Observable } = require("rxjs");
var { publishReplay, refCount, switchMap } = require("rxjs/operators");
const http = require("http");

// qix version
var version = pack["qix-version"];

// var srcSchema = require(`../node_modules/enigma.js/schemas/${version}.json`);

const image = `qlikcore/engine:${version}`;
const port = "9079";

const container$ = createContainer(image, port);

const schema$ = container$.pipe(
  switchMap(container =>
    Observable.create(observer => {
      http
        .get(`http://localhost:${port}/jsonrpc-api`, resp => {
          let data = "";

          resp.on("data", chunk => {
            data += chunk;
          });

          resp.on("end", () => {
            container.kill((err, result) => {
              container.remove();
              observer.complete();
            });

            observer.next(JSON.parse(data));
          });
        })
        .on("error", err => {
          observer.error(err);
        });
    })
  )
);

schema$.subscribe(schema => {
  var qClasses = Object.keys(schema.services);

  var classImports = [];
  var classExports = [];

  qClasses.forEach(qClass => {
    var methods = schema.services[qClass].methods;

    var classDir = `../src/${qClass}`;
    var absClassDir = path.join(__dirname, classDir);
    fs.emptydirSync(absClassDir);

    var importCode = [];
    var exportCode = [];

    Object.keys(methods).forEach(method => {
      var methodFileName = method
        .slice(0, 1)
        .toLowerCase()
        .concat(method.slice(1));

      var output = methods[method].responses || [];
      var script = generateScript(method, output);

      fs.writeFile(path.join(absClassDir, `${methodFileName}.js`), script);

      importCode.push(
        `import ${methodFileName} from "./${methodFileName}.js";`
      );
      exportCode.push(`export { ${methodFileName} };`);
    });

    var indexCode = importCode
      .join("\n")
      .concat("\n")
      .concat(exportCode.join("\n"));
    fs.writeFile(path.join(absClassDir, `index.js`), indexCode);

    classImports.push(`import * as ${qClass} from "./${qClass}";`);
    classExports.push(`export { ${qClass} }`);
  });

  function generateScript(methodName, output) {
    const returnParam = output.length === 1 ? `"${output[0].name}"` : "";
    return `import mapQixReturn from "../util/map-qix-return.js";

  export default function(handle, ...args) {
      return handle.ask("${methodName}", ...args).pipe(
          mapQixReturn(handle, ${returnParam})
      );
  }`;
  }
});

function createContainer(image, port) {
  // launch a new container
  var container$ = Observable.create(observer => {
    var docker = new Docker();

    docker.createContainer(
      {
        Image: image,
        Cmd: ["-S", "AcceptEULA=yes"],
        ExposedPorts: {
          "9076/tcp": {}
        },
        HostConfig: {
          RestartPolicy: {
            Name: "always"
          },
          PortBindings: {
            "9076/tcp": [
              {
                HostPort: port
              }
            ]
          }
        }
      },
      (err, container) => {
        if (err) return observer.error(err);

        container.start((err, data) => {
          if (err) return observer.error(err);
          setTimeout(() => {
            observer.next(container);
            observer.complete();
          }, 2000);
        });
      }
    );
  }).pipe(publishReplay(1), refCount());

  return container$;
}
