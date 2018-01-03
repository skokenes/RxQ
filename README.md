# RxQ
**RxQ** is a JavaScript library that provides utilities to link [**RxJS**](https://github.com/ReactiveX/rxjs), a JavaScript implementation of Rx, with the Qlik Associative Engine (QAE). RxQ can be used to build complex, interactive solutions on top of QAE using the reactive programming paradigm. RxQ can be used in projects via npm like so:
```
$ npm install rxq
```

## Usage and Documentation
Documentation for RxQ is hosted on [http://opensrc.axisgroup.com/rxq/docs](http://opensrc.axisgroup.com/rxq/docs/). We highly recommend reviewing the list of Recipes for examples of usage.

## Quick Start
Want to play with it immediately? [Try forking this sandbox.](https://codesandbox.io/embed/o155xl98y)

## Qlik Support
As of v1.0.0, the following APIs are supported:
- Engine API for QS 12.34.11

Custom builds for other versions of the QS Engine can be generated using the included build scripts. See the build section.


## Building RxQ
RxQ has several auto-generated components that build the source code and compile it into the distributed package for NPM. The steps are:
1) Getting the correct QIX Engine schemas and generating operators for all API methods for the desired engine version
2) Converting all source code into distribution modules and move them to the distribution folder
3) Creating the package.json files for the distribution folder

Each of these steps can be triggered using npm scripts in the repository:

### Step 1: Getting Engine schemas and generating operators
`npm run build-qix-methods` will pull the QIX schema from the `enigma.js` node module and generate the appropriate operators for each class. The engine schema version to use is specified in `package.json` as the property `qix-version`.

### Step 2: Converting all source code into distribution modules
`npm run compile-cjs` compiles the CommonJS modules.

`npm run build` compiles the browser bundle.

`npm run build-min` compiles the minified browser bundle.

### Step 3: Creating the package.json files for distribution
`npm run make-packages` creates and stores the package.json files.

### Rebuilding the Distribution Folder
It is common to edit source code of RxQ and then execute steps 2 and 3 to rebuild the distribution folder. Those steps can be done in a single command with:
`npm run build-dist`.

The final package for distribution is stored in a sub-directory called `dist`. The NPM package should be published from this directory, NOT from the parent level repository which contains the source code.