import type { PropsWithChildren, ReactNode } from 'react'

import { FeatureFlagKey } from '@repo/feature-flags'

let _flags = Object.keys(FeatureFlagKey).reduce<Record<string, boolean>>(
    (acc, key) => {
        acc[key] = false
        return acc
    },
    {},
)

function getFlagValue(flag: FeatureFlagKey, defaultValue: any) {
    return Object.prototype.hasOwnProperty.call(_flags, flag)
        ? _flags[flag]
        : defaultValue
}

let _mockClient = {
    waitForInitialization: () => Promise.resolve(),
    waitUntilGoalsReady: () => Promise.resolve(),
    waitUntilReady: () => Promise.resolve(),
    on: () => {},
    off: () => {},
    allFlags: () => _flags,
    variation: (flag: FeatureFlagKey, defaultValue: any) =>
        getFlagValue(flag, defaultValue),
    variationDetail: (flag: FeatureFlagKey, defaultValue: any) => ({
        value: getFlagValue(flag, defaultValue),
    }),
}

export const useFlags = () => _flags

type LDProviderProps = PropsWithChildren<{
    clientSideID?: string
    context?: unknown
    ldClient?: typeof _mockClient
    reactOptions?: unknown
}>

export function LDProvider({ children, ldClient }: LDProviderProps) {
    if (ldClient) {
        _mockClient = ldClient
    }

    return children
}

export function useLDClient() {
    return _mockClient
}

export function withLDProvider() {
    return function withMockLDProvider<TProps>(
        Component: (props: TProps) => ReactNode,
    ) {
        return function WrappedComponent(props: TProps) {
            return (
                <LDProvider>
                    <Component {...props} />
                </LDProvider>
            )
        }
    }
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
