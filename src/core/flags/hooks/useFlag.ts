import {useEffect, useState} from 'react'

import {FeatureFlagKey} from 'config/featureFlags'
import {getLDClient} from 'utils/launchDarkly'

/**
 * @param flag - The feature flag to check from the FeatureFlagKey enum
 * @param defaultValue - The default value to return if the feature flag is not set, defaults to false
 * @returns The value of the feature flag
 */
export default function useFlag<T = boolean>(
    flag: FeatureFlagKey,
    defaultValue: T = false as T
): T {
    const client = getLDClient()
    const [value, setValue] = useState<T>(
        () => client.variation(flag, defaultValue) as T
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
