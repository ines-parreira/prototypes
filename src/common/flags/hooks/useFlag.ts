import {useEffect, useState} from 'react'

import {FeatureFlagKey} from 'config/featureFlags'
import {getLDClient} from 'utils/launchDarkly'

export default function useFlag<T>(flag: FeatureFlagKey, defaultValue: T): T {
    const client = getLDClient()
    const [value, setValue] = useState<T>(
        () => client.variation(flag, defaultValue) as T
    )

    useEffect(() => {
        void (async () => {
            await client.waitForInitialization(3)
            setValue(client.variation(flag, defaultValue))
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
