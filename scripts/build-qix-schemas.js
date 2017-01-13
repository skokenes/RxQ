var fs = require("fs");
var path = require("path");

// Folder to look for schemas
var schemaFolder = "node_modules/enigma.js/schemas/qix";

// Target Folder
var targetFolder = "src/schemas/qix";

// Get the list of subdirectories to get engine versions
const qixVersions = fs.readdirSync(schemaFolder)
    .filter(function(file) {
        return fs.statSync(path.join(schemaFolder, file)).isDirectory();
    });

// For each engine version
qixVersions.forEach(function(qV) {
    
    // Load the schema
    const contents = fs.readFileSync(path.join(schemaFolder, qV, "schema.json"));
    const spec = JSON.parse(contents);
    const structs = Object.keys(spec.structs);

    // Get/create the target folder
    const currentTargetFolder = path.join(targetFolder,qV);
    if(!fs.existsSync(currentTargetFolder)) fs.mkdirSync(currentTargetFolder);

    // For each structure, make a separate file and output it
    structs.forEach(function(k) {
        const struct = spec.structs[k];
        const methods = Object.keys(struct);
        const output = methods.map(key=>{
            var ret = {n: key};
            var outs = struct[key].Out;
            if(outs.length === 1) {
                ret.o = outs[0].Name;
            }
            else {
                ret.o = "";
            }
            return ret;
        });
        fs.writeFile(path.join(currentTargetFolder,k) + ".json",JSON.stringify(output),(err)=> {
            if(err) throw err;
            console.log("Outputted ", qV + ": " + k);
        });
    });
});