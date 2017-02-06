/* eslint no-invalid-this:0 */

'use strict';

import { getHashDigest } from 'loader-utils';
import path from 'path';

function loader(content) {
    this.cacheable && this.cacheable();

    // Grab the content from the css-loader
    if (content.indexOf('module.exports =') !== -1) {
        content = this.exec(content, this.resource);
    // Otherwise it's a css string
    } else {
        content = [[this.resourcePath, content, '']];
    }

    // Preserve CSS modules locals
    const out = content.locals ? content.locals : {};

    // Generate _nextStyles that will be used by applyStyles()
    out._nextStyles = content.map((entry) => {
        const relativePath = path.relative(this._compiler.context, entry[0]);

        return {
            id: getHashDigest(relativePath, 'md5', 'hex'),
            content: entry[1],
            sourceMap: entry[3],
            mediaType: entry[2],
        };
    });

    return `module.exports = ${JSON.stringify(out)};`;
}

module.exports = loader;
