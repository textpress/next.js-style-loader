/* eslint react/no-multi-comp:0 */

import React, { Component } from 'react';
import addStyles from 'style-loader/addStyles';
import hoistStatics from 'hoist-non-react-statics';

const ssrStyleElId = 'next-style-ssr';
const isServer = typeof window === 'undefined';

let serverStyles = !isServer ? null : [];

function applyStylesOnServer(styles) {
    styles = Array.isArray(styles) ? styles : [styles];

    return (WrappedComponent) => {
        class ApplyStyles extends Component {
            componentWillMount() {
                // Concatenate styles
                serverStyles.push(...styles);
            }

            render() {
                return <WrappedComponent { ...this.props } />;
            }
        }

        const displayName = WrappedComponent.displayName || WrappedComponent.name || 'Component';

        ApplyStyles.displayName = `ApplyStyles(${displayName})`;
        ApplyStyles.ComposedComponent = WrappedComponent;

        return hoistStatics(ApplyStyles, WrappedComponent);
    };
}

// ---------------------------------------------------

let removedSsrStyleEl = isServer ? null : false;
const removeSsrStyleElDelay = isServer ? null : 1000;

function applyStylesOnClient(styles) {
    styles = Array.isArray(styles) ? styles : [styles];

    return (WrappedComponent) => {
        class ApplyStyles extends Component {
            componentWillMount() {
                // Insert component styles
                this._updateNextStyles = addStyles(styles.map((style) => [style.id, style.content, '', style.sourceMap]));
            }

            componentDidMount() {
                // Remove the server-rendered style tag
                if (!removedSsrStyleEl) {
                    removedSsrStyleEl = true;

                    setTimeout(() => {
                        const headEl = document.head || document.getElementsByTagName('head')[0];
                        const styleEl = document.getElById(ssrStyleElId);

                        styleEl && headEl.removeChild(styleEl);
                    }, removeSsrStyleElDelay);
                }
            }

            componentWillUnmount() {
                // Remove component styles
                this._updateNextStyles([]);
            }

            render() {
                return <WrappedComponent { ...this.props } />;
            }
        }

        const displayName = WrappedComponent.displayName || WrappedComponent.name || 'Component';

        ApplyStyles.displayName = `ApplyStyles(${displayName})`;
        ApplyStyles.ComposedComponent = WrappedComponent;

        return hoistStatics(ApplyStyles, WrappedComponent);
    };
}

// ---------------------------------------------------

export default isServer ? applyStylesOnServer : applyStylesOnClient;

export function flush() {
    if (!isServer) {
        throw new Error('flush() should only be called on the server');
    }

    const flushedStyles = serverStyles;

    serverStyles = [];

    return {
        tag: <style id={ ssrStyleElId }>{ flushedStyles.reduce((concatenated, style) => concatenated + style.content, '') }</style>,
        styles: flushedStyles,
    };
}
