import { evaluateAsync } from './engines/harness'
import type { FeatureFlagKey } from './featureFlagKey'

export async function fetchFlag<T>(
    flag: FeatureFlagKey,
    defaultValue: T = false as T,
) {
    try {
        const value = await evaluateAsync(flag, defaultValue)
        return { flag: value, error: null }
    } catch (error) {
        console.error(`Error fetching feature flag: ${flag}`, error)
        return { flag: defaultValue, error: error as Error }
    }
}
