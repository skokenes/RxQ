## 2.0.4 (2019-03-07)

### Bug Fixes
* Fix for issue where delta mode would mutate data when applying patches Fixes [#51](https://github.com/axisgroup/RxQ/issues/51)

## 2.0.3 (2019-01-29)

### Bug Fixes
* Fix for issue where engine could not be connectly directed to if an appname wasn't supplied Fixes [#61](https://github.com/axisgroup/RxQ/issues/61)

## 2.0.2 (2018-10-29)

### Bug Fixes
* Replaced shareReplay with publishReplay, refCount in qAskReplay. Closes [#58](https://github.com/axisgroup/RxQ/issues/58)
* handle.ask() now filters out undefined arguments, rather than sending nulls to the Engine. Closes [#57](https://github.com/axisgroup/RxQ/issues/57)

### Features
* Added `url` parameter for config file that allows users to specify the WebSocket url to connect to. Closes [#56](https://github.com/axisgroup/RxQ/issues/56)
* Updated generated qix methods to Engine API 12.260.0

## 2.0.1 (2018-07-26)

### Bug Fixes
* Removed Handle instance checking for `qAsk`, `qInvalidations` operators as temporary fix; was causing issues in other projects and isn't really necessary. Closes [#55](https://github.com/axisgroup/RxQ/issues/55)
* Fixed issue where not defining an appname in the connect config would cause an invalid URL

### Code Refactoring
* Cleaned up some dead code
* Updated README with testing information