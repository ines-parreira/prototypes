import { FeatureFlagKey } from '@repo/feature-flags'

import { getLDClient } from 'utils/launchDarkly'

export async function fetchFlag<T>(
    flag: FeatureFlagKey,
    defaultValue: T = false as T,
) {
    try {
        const client = getLDClient()
        await client.waitForInitialization(3)
        return { flag: client.variation(flag, defaultValue) as T, error: null }
    } catch (error) {
        console.error(`Error fetching feature flag: ${flag}`, error)
        return { flag: defaultValue, error: error as Error }
    }
}
