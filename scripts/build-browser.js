var webpack = require("webpack");
const path = require("path");
var StringReplacePlugin = require("string-replace-webpack-plugin");
var program = require("commander");

program
  .version("0.1.0")
  .option("--min", "minified")
  .parse(process.argv);

const plugins = [new StringReplacePlugin()];

const filename = program.min ? "rxq.bundle.min.js" : "rxq.bundle.js";

webpack(
  {
    mode: "production",
    entry: path.join(__dirname, "../index.js"),
    output: {
      path: path.resolve(__dirname, "../dist/bundle"),
      filename: filename,
      library: "RxQ",
      libraryTarget: "umd"
    },
    devtool: "source-map",
    optimization: {
      minimize: program.min || false
    },
    module: {
      rules: [
        // configure replacements for file patterns
        {
          enforce: "pre",
          test: /src\/|index.js$/,
          loader: StringReplacePlugin.replace({
            replacements: [
              {
                pattern: /import {([^;]*?)} from ([^;]*?)('|")rxjs([^;]*?)('|");/g,
                replacement: function(
                  match,
                  p1,
                  p2,
                  p3,
                  p4,
                  p5,
                  offset,
                  string
                ) {
                  // Check if loading an operator or not
                  var operatorsFlag = p4.split("/").indexOf("operators") > 0;

                  // The source to load from
                  var srcBase = ["Rx"]
                    .concat(p4.split("/").filter(f => f != ""))
                    .join(".");

                  // Get vars to map
                  var defs = p1
                    .replace(/({|})/g, "")
                    .split(",")
                    .map(d => {
                      var splits = d
                        .split(" as ")
                        .map(s => s.replace(/( |\n)/g, ""));

                      return {
                        name: splits[1] || splits[0],
                        source: splits[0]
                      };
                    });

                  // Turn the var definitions into statements
                  var globalImports = defs
                    .map(d => {
                      var dec = `var ${d.name} = ${srcBase}`;
                      if (operatorsFlag) dec += `.${d.source}`;
                      dec += ";";
                      return dec;
                    })
                    .join("\n")
                    .replace(/observable/g, "Observable");

                  return globalImports;
                }
              }
            ]
          })
        },
        // Babel
        {
          test: /\.js$/,
          exclude: /node_modules/,
          loader: "babel-loader",
          options: {
            presets: ["es2015"],
            plugins: [
              // "transform-runtime",
              "babel-plugin-add-module-exports"
            ]
          }
        }
      ]
    },
    plugins: plugins
  },
  (err, stats) => {
    if (err || stats.hasErrors()) {
      console.log(err);
      // Handle errors here
    }
    console.log(stats);
    // Done processing
  }
);
