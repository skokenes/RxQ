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
  const schemaOutput = Object.keys(schema.services).reduce((acc, qClass) => {
    const classMethods = schema.services[qClass].methods;
    return {
      ...acc,
      [qClass]: Object.keys(classMethods).reduce((methodList, method) => {
        const methodResponses = classMethods[method].responses;
        return {
          ...methodList,
          [method]:
            typeof methodResponses === "undefined"
              ? []
              : methodResponses.map(response => response.name)
        };
      }, {})
    };
  }, {});

  // write schema to src folder
  const schemaFolder = path.join(__dirname, "../src/schema");
  fs.emptydirSync(schemaFolder);
  fs.writeFile(
    path.join(schemaFolder, "schema.js"),
    `export default ${JSON.stringify(schemaOutput, null, 2)}`
  );
  fs.writeFile(
    path.join(schemaFolder, "schema.json"),
    JSON.stringify(schema, null, 2)
  );

  var qClasses = Object.keys(schema.services);

  var classImports = [];
  var classExports = [];

  qClasses.forEach(qClass => {
    var methods = schema.services[qClass].methods;

    var classDir = `../src/${qClass}`;
    var absClassDir = path.join(__dirname, classDir);
    fs.emptydirSync(absClassDir);

    const eNumScript = Object.keys(methods)
      .reduce((acc, methodname) => {
        return [
          `const ${methodname} = "${methodname}"`,
          ...acc,
          `export { ${methodname} };`
        ];
      }, [])
      .join("\n");

    fs.writeFile(path.join(absClassDir, `index.js`), eNumScript);

    classImports.push(`import * as ${qClass} from "./${qClass}";`);
    classExports.push(`export { ${qClass} }`);
  });
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
  }).pipe(
    publishReplay(1),
    refCount()
  );

  return container$;
}
