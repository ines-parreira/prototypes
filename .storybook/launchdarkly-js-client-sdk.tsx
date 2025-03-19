/* eslint-disable */
import type { ComponentType, ReactNode } from 'react'

import { FeatureFlagKey } from '../src/config/featureFlags'

let _flags = Object.keys(FeatureFlagKey).reduce<Record<string, boolean>>(
    (acc, key) => {
        acc[key] = false
        return acc
    },
    {},
)

let _mockClient = {
    waitForInitialization: () => Promise.resolve(),
    on: () => {},
    off: () => {},
    variation: (flag: FeatureFlagKey, defaultValue: any) =>
        _flags[flag] || defaultValue,
}

export const useFlags = () => _flags
export const withLDConsumer =
    (_: unknown) =>
    (WrappedComponent: ComponentType<unknown>) =>
    (props: object) => {
        const allProps = { ...props }
        return <WrappedComponent {...allProps} />
    }

export function decorator(
    story: () => ReactNode,
    { parameters }: { parameters: { flags: Record<string, boolean> } },
) {
    if (parameters && parameters.flags) {
        _flags = parameters.flags
    }
    return story()
}

export function initialize() {
    return _mockClient
}
