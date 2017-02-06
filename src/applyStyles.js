/* eslint react/no-multi-comp:0 */

import React, { Component } from 'react';
import addStyles from 'style-loader/addStyles';
import hoistStatics from 'hoist-non-react-statics';

const ssrStyleElId = 'next-style-ssr';
const isServer = typeof window === 'undefined';

let serverStyles = !isServer ? null : [];
let removedSsrStyleEl = isServer ? null : false;
const removeSsrStyleElDelay = isServer ? null : 1000;

export default function applyStyles(styles) {
    styles = Array.isArray(styles) ? styles : [styles];

    return (WrappedComponent) => {
        class ApplyStyles extends Component {
            componentWillMount() {
                if (isServer) {
                    this._willMountOnServer();
                } else {
                    this._willMountOnClient();
                }
            }

            componentDidMount() {
                // Remove the server-rendered style tag
                if (removedSsrStyleEl) {
                    return;
                }

                removedSsrStyleEl = true;

                setTimeout(() => {
                    const headEl = document.head || document.getElementsByTagName('head')[0];
                    const styleEl = document.getElementById(ssrStyleElId);

                    styleEl && headEl.removeChild(styleEl);
                }, removeSsrStyleElDelay);
            }

            componentWillUnmount() {
                // Remove component styles
                this._updateNextStyles([]);
            }

            render() {
                return <WrappedComponent { ...this.props } />;
            }

            _willMountOnServer() {
                // Concatenate server styles so that they are flushed afterwards
                styles.forEach((style) => serverStyles.push(...style._nextStyles));
            }

            _willMountOnClient() {
                // Insert component styles using style-loader's addStyles which does the hard work for us
                const styleLoaderStyles = styles.reduce((arr, style) => {
                    style._nextStyles.forEach((style) => arr.push([style.id, style.content, style.mediaType, style.sourceMap]));
                    return arr;
                }, []);

                this._updateNextStyles = addStyles(styleLoaderStyles, {
                    fixUrls: true,  // We are using a style-loader fork to fix urls, see: https://github.com/webpack-contrib/style-loader/pull/124
                });
            }
        }

        const displayName = WrappedComponent.displayName || WrappedComponent.name || 'Component';

        ApplyStyles.displayName = `ApplyStyles(${displayName})`;
        ApplyStyles.ComposedComponent = WrappedComponent;

        return hoistStatics(ApplyStyles, WrappedComponent);
    };
}

export function flush() {
    if (!isServer) {
        throw new Error('flush() should only be called on the server');
    }

    const flushedStyles = serverStyles;
    const flushedCss = serverStyles.reduce((concatenated, style) => concatenated + style.content, '');

    serverStyles = [];

    return {
        tag: <style id={ ssrStyleElId } dangerouslySetInnerHTML={ { __html: flushedCss } }/>,
        styles: flushedStyles,
    };
}
