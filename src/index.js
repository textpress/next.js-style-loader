/* eslint no-invalid-this:0 */

'use strict';

import path from 'path';
import { getHashDigest } from 'loader-utils';

function loader(content, sourceMap) {
    this.cacheable && this.cacheable();

    // Grab the relative path to the resource we are processing
    const relativePath = path.relative(this._compiler.context, this.resourcePath);

    return `module.exports = ${JSON.stringify({
        id: getHashDigest(relativePath, 'md5', 'hex'),
        content,
        sourceMap,
    })};`;
}

module.exports = loader;
