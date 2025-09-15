import { FeatureFlagKey } from '@repo/feature-flags'

import { useFlag } from 'core/flags'
import { getLDClient } from 'utils/launchDarkly'

const FLAG_KEY = FeatureFlagKey.ReportingHrtWithoutBots
const DEFAULT_VALUE = false

export async function fetchShouldIncludeBots() {
    const client = getLDClient()
    await client.waitForInitialization(3)
    const withoutBots = client.variation(FLAG_KEY, DEFAULT_VALUE)
    return !withoutBots
}

export function useShouldIncludeBots(): boolean {
    const withoutBots = useFlag(FLAG_KEY, DEFAULT_VALUE)
    return !withoutBots
}
