var pkg = require("../package.json");
var fs = require("fs");
var path = require("path");

// Copy package to dist folder
fs.writeFile(path.join(__dirname,"../dist/package.json"), JSON.stringify(pkg, null, "\t"), function(err) {
    if(err) console.log(err);
});

var srcFolder = path.join(__dirname,"../src");
var distFolder = path.join(__dirname,"../dist");

// Package connects
var connectInputFolder = path.join(srcFolder,"connect");
var connectOutputFolder = path.join(distFolder,"connect");
mkDir(connectOutputFolder);

fs.readdir(connectInputFolder, (err, files) => {
    if(err) return console.log(err);
    files.forEach(file=>{
        fs.lstat(path.join(connectInputFolder, file), (err, stats) => {
            if(stats.isFile() && file.slice(-3) === ".js") {
                var folderPath = "connect";
                var outputFolder = path.join(connectOutputFolder, file.split(".js").shift());
                createPackage(file, folderPath, outputFolder,2);
            }
        });
    });
});

// Package operators
var operatorFolder = path.join(srcFolder, "operators");
var operatorOutputFolder = path.join(distFolder, "operators");
mkDir(operatorOutputFolder);

fs.readdir(operatorFolder, (err, files) => {
    if(err) return console.log(err);
    files.forEach(file=>{
        fs.lstat(path.join(operatorFolder, file), (err, stats) => {
            if(stats.isDirectory()) {
                var outputFolder = path.join(operatorOutputFolder, file);
                mkDir(outputFolder);
                packageJsInFolder(path.join(operatorFolder, file), outputFolder, `operators/${file}`,3);

                // Class index file
                createPackage("index.js", `operators/${file}`, path.join(operatorOutputFolder,file), 2);
            }
        });
    });
});

// Operator index file
createPackage("index.js","operators", operatorOutputFolder, 1);


function packageJsInFolder(srcFolder, tgtFolder, folderPath, depth) {
    fs.readdir(srcFolder, (err, files) => {
        if(err) return console.log(err);
        files.forEach(file=>{
            fs.lstat(path.join(srcFolder, file), (err, stats) => {
                if(stats.isFile() && file.slice(-3) === ".js") {
                    var outputFolder = path.join(tgtFolder, file.split(".js").shift());
                    createPackage(file, folderPath, outputFolder,depth);
                }
            });
        });
    });
}


function createPackage(filename, folderPath, outputFolder, depth) {

    var trail = "../".repeat(depth);

    var pkg = {
        main: `${trail}_cjs/${folderPath}/${filename}`,
        module: `${trail}_esm5/${folderPath}/${filename}`
    };

    mkDir(outputFolder);

    fs.writeFile(path.join(outputFolder,"package.json"), JSON.stringify(pkg, null, "\t"), function(err) {
        if(err) console.log(err);
    });

}

function mkDir(dir) {
    if (!fs.existsSync(dir)){
        fs.mkdirSync(dir);
    }
}