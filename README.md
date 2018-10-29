# RxQ
**RxQ** is a JavaScript library that provides utilities to link [**RxJS**](https://github.com/ReactiveX/rxjs), a JavaScript implementation of Rx, with the Qlik Associative Engine (QAE). RxQ can be used to build complex, interactive solutions on top of QAE using the reactive programming paradigm. RxQ can be used in projects via npm like so:
```
$ npm install rxq
```

*Note that **RxJS ^6.2.0** is a peer dependency of **RxQ**; It will not be automatically installed when you install RxQ. If you do not already have **RxJS ^6.2.0** installed to your project, be sure to include it by running:*
```
$ npm install rxjs
```

## Usage and Documentation
Documentation for RxQ is hosted on [http://opensrc.axisgroup.com/rxq/docs](http://opensrc.axisgroup.com/rxq/docs/). We highly recommend reviewing the list of Recipes for examples of usage.

## Quick Start
Want to play with it immediately? [Try forking this sandbox.](https://codesandbox.io/embed/k3mvn2k815)

## Qlik Support
As of v2.0.2, the following APIs are supported:
- Engine 12.260.0

Custom builds for other versions of the Qlik Associative Engine can be generated using the included build scripts. See the build section.


## Building RxQ
RxQ has several auto-generated components that build the source code and compile it into the distributed package for NPM. It leverages Qlik Engine v12.181.0 to generate method names. The steps are:
1) Getting the correct QIX Engine schemas and generating operators for all API methods for the desired engine version
2) Converting all source code into distribution modules and move them to the distribution folder
3) Creating the package.json files for the distribution folder

Each of these steps can be triggered using npm scripts in the repository:

### Step 1: Getting Engine schemas and generating operators
`npm run build-qix-methods` uses Qlik Core to spin up an Engine and pull the API schema that will be used to generate enums for all of the API methods.

### Step 2: Converting all source code into distribution modules
`npm run compile-cjs` compiles the CommonJS modules.

`npm run compile-esm5` compiles the ESM5 modules.

`npm run compile-esm` compiles the ESM modules.

`npm run build` compiles the browser bundle.

`npm run build-min` compiles the minified browser bundle.

### Step 3: Creating the package.json files for distribution
`npm run make-packages` creates and stores the package.json files.

### Rebuilding the Distribution Folder
It is common to edit source code of RxQ and then execute steps 2 and 3 to rebuild the distribution folder. Those steps can be done in a single command with:
`npm run build-dist`.

The final package for distribution is stored in a sub-directory called `dist`. The NPM package should be published from this directory, NOT from the parent level repository which contains the source code.

## Testing RxQ
`npm run test-unit` will run the unit tests.

`npm run test-e2e` will run the end to end tests. These tests require Docker and the Qlik Core image associated with the engine version in package.json. For example, for version 12.207.0 of the Engine, the tests need the `qlikcore/engine:12.207.0` image. This image can be pulled from Docker like so: `docker pull qlikcore/engine:12.207.0`.
