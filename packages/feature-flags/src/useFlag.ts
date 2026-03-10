import { useEffect, useState } from 'react'

import type { FeatureFlagKey } from './featureFlagKey'
import { getLDClient } from './launchdarkly'

/**
 * @deprecated Use `useFlagWithLoading` instead, which also exposes `isLoading: true`
 * until the LaunchDarkly client has finished initializing. This avoids rendering
 * with stale default values before the real flag value is known.
 *
 * @param flag - The feature flag to check from the FeatureFlagKey enum
 * @param defaultValue - The default value to return if the feature flag is not set, defaults to false
 * @returns The value of the feature flag
 */
export function useFlag<T = boolean>(
    flag: FeatureFlagKey,
    defaultValue: T = false as T,
): T {
    const client = getLDClient()
    const [value, setValue] = useState<T>(
        () => client.variation(flag, defaultValue) as T,
    )

    useEffect(() => {
        void (async () => {
            try {
                await client.waitForInitialization(3)
                setValue(client.variation(flag, defaultValue))
            } catch (error) {
                console.error('Error fetching feature flag', error)
            }
        })()
    }, [client, defaultValue, flag])

    useEffect(() => {
        const event = `change:${flag}`
        client.on(event, setValue)

        return () => {
            client.off(event, setValue)
        }
    }, [client, flag])

    return value
}
