var path = require("path");
var fs = require("fs");
var rimraf = require("rimraf");
var babel = require("babel-core");

// Set up dist
mkDir("dist");

// Iterate through source code and copy over
var srcFolder = "src";
var tgtFolder = "dist";

compileFromDir(srcFolder, tgtFolder);

function compileFromDir(srcFolder, tgtFolder) {
  fs.readdir(srcFolder, function(err, files) {
    files.forEach(function(file) {
      fs.lstat(path.join(srcFolder, file), function(err, stats) {
        if (stats.isFile() && file.match(/.js$/g) !== null) {
          babel.transformFile(
            path.join(srcFolder, file),
            {
              presets: ["es2015"],
              plugins: [
                "transform-object-rest-spread",
                "add-module-exports",
                "transform-es2015-modules-commonjs",
                "transform-runtime"
              ]
            },
            function(err, result) {
              if (err) return console.log(err);
              fs.writeFile(path.join(tgtFolder, file), result.code, function(
                err
              ) {
                if (err) return console.log(err);
              });
            }
          );
        } else if (stats.isDirectory()) {
          mkDir(path.join(tgtFolder, file));
          compileFromDir(
            path.join(srcFolder, file),
            path.join(tgtFolder, file)
          );
        }
      });
    });
  });
}

function mkDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
  }
}
