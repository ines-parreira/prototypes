import { evaluateFlagAsync } from './dualEvaluation'
import type { FeatureFlagKey } from './featureFlagKey'

export async function fetchFlag<T>(
    flag: FeatureFlagKey,
    defaultValue: T = false as T,
) {
    const { value, error } = await evaluateFlagAsync(flag, defaultValue)
    return { flag: value, error }
}
