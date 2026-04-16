import { useEffect, useState } from 'react'

import { evaluateFlag, subscribeToFlag } from './dualEvaluation'
import { ensureInitialization } from './engines/launchdarkly'
import type { FeatureFlagKey } from './featureFlagKey'

/**
 * Like `useFlag` but also returns `isLoading: true` until the LaunchDarkly client
 * has finished initializing and the flag value is known.
 *
 * Use this when you need to avoid rendering stale/default flag values (e.g. to
 * prevent a flash of the wrong UI variant).
 */
export function useFlagWithLoading<T = boolean>(
    flag: FeatureFlagKey,
    defaultValue: T = false as T,
): { value: T; isLoading: boolean } {
    const [state, setState] = useState<{ value: T; isLoading: boolean }>({
        value: evaluateFlag(flag, defaultValue),
        isLoading: true,
    })

    useEffect(() => {
        void (async () => {
            try {
                await ensureInitialization()
                setState({
                    value: evaluateFlag(flag, defaultValue),
                    isLoading: false,
                })
            } catch (error) {
                console.error('Error fetching feature flag', error)
                setState((prev) => ({ ...prev, isLoading: false }))
            }
        })()
    }, [defaultValue, flag])

    useEffect(() => {
        return subscribeToFlag(flag, defaultValue, (newValue) =>
            setState((prev) => ({ ...prev, value: newValue as T })),
        )
    }, [defaultValue, flag])

    return state
}
