## 2.0.1 (2018-07-26)

### Bug Fixes
* Removed Handle instance checking for `qAsk`, `qInvalidations` operators as temporary fix; was causing issues in other projects and isn't really necessary. Closes [#55](https://github.com/axisgroup/RxQ/issues/55)
* Fixed issue where not defining an appname in the connect config would cause an invalid URL

### Code Refactoring
* Cleaned up some dead code
* Updated README with testing information