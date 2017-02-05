/* eslint no-invalid-this:0 */

'use strict';

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _loaderUtils = require('loader-utils');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function loader(content, sourceMap) {
    this.cacheable && this.cacheable();

    // Grab the relative path to the resource we are processing
    var relativePath = _path2.default.relative(this._compiler.context, this.resourcePath);

    return 'module.exports = ' + JSON.stringify({
        id: (0, _loaderUtils.getHashDigest)(relativePath, 'md5', 'hex'),
        content: content,
        sourceMap: sourceMap
    }) + ';';
}

module.exports = loader;