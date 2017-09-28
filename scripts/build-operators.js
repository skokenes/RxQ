// with qix version, go through the schema and publish into operators
var fs = require("fs");
var path = require("path");
var pack =  JSON.parse(fs.readFileSync("package.json", "utf8"));

// qix version
var version = pack["qix-version"];

// Folder to look for schemas
var schemaFolder = `src/schemas/qix/${version}`;

// Target Folder
var targetFolder = "src/operators";

// read directory
fs.readdir(schemaFolder, function(err, filenames) {
    
    // For each class folder in the schema
    filenames.forEach(function(filename) {

        // read the schema for the class
        var qClass = filename.split(".json").shift();
        fs.readFile(path.join(schemaFolder,filename), "utf8", function(err, content) {
            var methods = JSON.parse(content);
            var classTargetFolder = path.join(targetFolder,qClass);
            
            if (!fs.existsSync(classTargetFolder)) {
                fs.mkdirSync(classTargetFolder);
            }

            methods.forEach(function(method) {
                var methodName = method.n;
                var methodOutput = method.o;
                var script = generateScript(methodName, methodOutput);

                fs.writeFile(path.join(classTargetFolder,lowerFirst(methodName) + ".js"), script, function(err) {
                });
            });

            var indexScript = methods.map(method=>`export {default as ${lowerFirst(method.n)}} from "./${lowerFirst(method.n)}.js"`)
                .join("\n");
            fs.writeFile(path.join(classTargetFolder, "index.js"),indexScript, function(err) {});
        });
    });

    var indexScript = filenames.map(fn=>{
        var qClass = fn.split(".json").shift();
        return `import * as ${qClass} from "./${qClass}";`
        .concat("\n")
        .concat(`export { ${qClass} }`);
    })
    .join("\n");
    fs.writeFile(path.join(targetFolder,"index.js"), indexScript, function(err) {console.log("err", err)});
});

function generateScript(methodName, methodOutput) {
    //console.log(methodName);
    var script = `import { map, publishReplay, withLatestFrom, refCount } from "rxjs/operators";
import Handle from "../../qix-handles/handle.js";
import ask from "../handle/ask.js";

export default function(...args) {
    return function(source$) {
        var methodResp$ = source$.pipe(
            ask("${methodName}",...args),
            withLatestFrom(source$),
            map(([resp, handle])=>{
                var hasQReturn = resp.hasOwnProperty("qReturn");
                var hasQType = hasQReturn ? (resp.qReturn.hasOwnProperty("qType")) : false; 
        
                if(hasQType) {
                    let qClass = resp.qReturn.qType;
                    return new Handle(handle.session,resp.qReturn.qHandle, qClass);
                }
                else if("${methodOutput}".length > 0) {
                    return resp["${methodOutput}"];
                }
                else if(hasQReturn) return resp.qReturn;
                else return resp;
            }),
            publishReplay(1),
            refCount()
        );
        
        return methodResp$;
    }
}`;

    return script;

}

function lowerFirst(str) {
    return str.slice(0,1)
        .toLowerCase()
        .concat(str.slice(1));
}