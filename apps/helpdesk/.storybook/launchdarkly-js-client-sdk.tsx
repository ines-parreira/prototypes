import type { ReactNode } from 'react'

import { FeatureFlagKey } from '@repo/feature-flags'

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
