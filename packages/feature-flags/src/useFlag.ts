import { useEffect, useState } from 'react'

import { evaluateFlag, subscribeToFlag } from './dualEvaluation'
import { ensureInitialization } from './engines/launchdarkly'
import type { FeatureFlagKey } from './featureFlagKey'

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
    const [value, setValue] = useState<T>(() =>
        evaluateFlag(flag, defaultValue),
    )

    useEffect(() => {
        void (async () => {
            try {
                await ensureInitialization()
                setValue(evaluateFlag(flag, defaultValue))
            } catch (error) {
                console.error('Error fetching feature flag', error)
            }
        })()
    }, [defaultValue, flag])

    useEffect(() => {
        return subscribeToFlag(flag, defaultValue, (newValue) =>
            setValue(newValue as T),
        )
    }, [defaultValue, flag])

    return value
}
