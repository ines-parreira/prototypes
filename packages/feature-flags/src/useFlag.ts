import { useTreatmentWithConfig } from '@splitsoftware/splitio-react'

import { normalizeFlagId, parseTreatment } from './engines/harness'
import type { FeatureFlagKey } from './featureFlagKey'

/**
 * @deprecated Use `useFlagWithLoading` instead, which also exposes `isLoading: true`
 * until the SDK has finished initializing. This avoids rendering with stale
 * default values before the real flag value is known.
 *
 * @param flag - The feature flag to check from the FeatureFlagKey enum
 * @param defaultValue - The default value to return if the feature flag is not set, defaults to false
 * @returns The value of the feature flag
 */
export function useFlag<T = boolean>(
    flag: FeatureFlagKey,
    defaultValue: T = false as T,
): T {
    const { treatment } = useTreatmentWithConfig({
        name: normalizeFlagId(flag),
    })
    return parseTreatment(treatment.treatment, treatment.config, defaultValue)
}
