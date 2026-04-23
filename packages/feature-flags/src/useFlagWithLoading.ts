import { useTreatmentWithConfig } from '@splitsoftware/splitio-react'

import { normalizeFlagId, parseTreatment } from './engines/harness'
import type { FeatureFlagKey } from './featureFlagKey'

/**
 * Like `useFlag` but also returns `isLoading: true` until the SDK client
 * has finished initializing and the flag value is known.
 *
 * Use this when you need to avoid rendering stale/default flag values (e.g. to
 * prevent a flash of the wrong UI variant).
 */
export function useFlagWithLoading<T = boolean>(
    flag: FeatureFlagKey,
    defaultValue: T = false as T,
): { value: T; isLoading: boolean } {
    const { treatment, isReady, isReadyFromCache, hasTimedout } =
        useTreatmentWithConfig({
            name: normalizeFlagId(flag),
        })

    const value = parseTreatment(
        treatment.treatment,
        treatment.config,
        defaultValue,
    )

    const isLoading = !isReady && !isReadyFromCache && !hasTimedout

    return { value, isLoading }
}
