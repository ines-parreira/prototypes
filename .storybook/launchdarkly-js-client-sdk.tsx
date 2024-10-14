/* eslint-disable */
import React from 'react'
import {FeatureFlagKey} from '../src/config/featureFlags'

let _flags =  (Object.keys(FeatureFlagKey).reduce((acc, key) => {
    acc[key] = false
    return acc
}, {}))

let _mockClient = {
    waitForInitialization: () => Promise.resolve(),
    on: () => {},
    off: () => {},
    variation: (flag: FeatureFlagKey, defaultValue: any) => _flags[flag] || defaultValue,
}

export const useFlags = () => _flags
export const withLDConsumer = (options) => (WrappedComponent) => (props) => {
    const allProps = { ...props}
    return (<WrappedComponent { ...allProps } />) }

export function decorator(story, {parameters}) {
    if (parameters && parameters.flags) {
        _flags = parameters.flags
    }
    return story()
}

export function initialize() {
    return _mockClient;
}
