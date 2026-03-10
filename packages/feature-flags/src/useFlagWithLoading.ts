import { useEffect, useState } from 'react'

import type { FeatureFlagKey } from './featureFlagKey'
import { getLDClient } from './launchdarkly'
import { ensureInitialization } from './launchDarklyInitialization'

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
    const client = getLDClient()
    const [state, setState] = useState<{ value: T; isLoading: boolean }>({
        value: client.variation(flag, defaultValue) as T,
        isLoading: true,
    })

    useEffect(() => {
        void (async () => {
            try {
                await ensureInitialization()
                setState({
                    value: client.variation(flag, defaultValue) as T,
                    isLoading: false,
                })
            } catch (error) {
                console.error('Error fetching feature flag', error)
                setState((prev) => ({ ...prev, isLoading: false }))
            }
        })()
    }, [client, defaultValue, flag])

    useEffect(() => {
        const event = `change:${flag}`
        const handler = (value: T) => setState((prev) => ({ ...prev, value }))
        client.on(event, handler)
        return () => {
            client.off(event, handler)
        }
    }, [client, flag])

    return state
}
