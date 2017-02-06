# next-style-loader

[![NPM version][npm-image]][npm-url] [![Downloads][downloads-image]][npm-url] [![Build Status][travis-image]][travis-url] [![Dependency status][david-dm-image]][david-dm-url] [![Dev Dependency status][david-dm-dev-image]][david-dm-dev-url]

[npm-url]:https://npmjs.org/package/next-style-loader
[downloads-image]:http://img.shields.io/npm/dm/next-style-loader.svg
[npm-image]:http://img.shields.io/npm/v/next-style-loader.svg
[travis-url]:https://travis-ci.org/moxystudio/next.js-style-loader
[travis-image]:http://img.shields.io/travis/moxystudio/next.js-style-loader/master.svg
[david-dm-url]:https://david-dm.org/moxystudio/next.js-style-loader
[david-dm-image]:https://img.shields.io/david/moxystudio/next.js-style-loader.svg
[david-dm-dev-url]:https://david-dm.org/moxystudio/next.js-style-loader#info=devDependencies
[david-dm-dev-image]:https://img.shields.io/david/dev/moxystudio/next.js-style-loader.svg

Makes loading of CSS files possibles in [next.js](https://github.com/zeit/next.js) projects through babel & webpack.

This project is similar to what webpack `style-loader` does but is compatible with `next.js`.


## Installation

`$ npm install --save-dev next-style-loader`


## Setup

First you will need to create a `next.config.js` file:

```js
module.exports = {
    webpack: (config, { dev }) => {
        config.module.rules.push(
            {
                test: /\.css$/,
                loader: 'emit-file-loader',
                options: {
                    name: 'dist/[path][name].[ext]',
                },
            },
            {
                test: /\.css$/,
                // Simplest way (non-minified)..
                loader: `babel-loader!next-style-loader`,
                // Use `css-loader` to minify and enable source maps
                // NOTE: The `url` option from the css loader must be disabled; images, fonts, etc should go into /static
                loader: `babel-loader!next-style-loader!css-loader?sourceMap&minimize=${!dev}&url=false`,
                // Same as above but with CSS modules
                loader: `babel-loader!next-style-loader!css-loader?sourceMap&minimize=${!dev}&url=false&modules`,
                // Example with `css-loader` and `postcss-loader' (you may also activate CSS modules just like above)
                // Enable `postcss-imports` plugin must be enabled in the `postcss.config.js` file to process @import declarations
                loader: `babel-loader!next-style-loader!css-loader?sourceMap&minimize=${!dev}&url=false!postcss-loader`,
                // Example with `css-loader` and `sass-loader'
                loader: 'babel-loader!next-style-loader!css-loader?sourceMap&minimize=${!dev}&url=false!sass-loader',
            }
        );

        return config;
    },
};
```

Finally, create a `pages/_document.js` file:

```js
import React from 'react';
import Document, { Head, Main, NextScript } from 'next/document';
import { flush } from 'next-style-loader/applyStyles';

export default class MyDocument extends Document {
    render() {
        const { nextStyle } = this.props;

        return (
            <html>
                <Head>
                    { nextStyle.tag }
                </Head>
                <body>
                    <Main />
                    <NextScript />
                </body>
            </html>
        );
    }
}

MyDocument.getInitialProps = function (ctx) {
    const props = Document.getInitialProps(ctx);

    props.nextStyle = flush();

    return props;
};
```


## Usage

After setting the project, you may import CSS files like so:

```js
import styles from './MyComponent.css';

const MyComponent extends Component {
    render() {
        return <div>Hello</div>;
    }
}

export default applyStyles(styles)(MyComponent);
```

Enjoy!


## License

[MIT License](http://opensource.org/licenses/MIT)
