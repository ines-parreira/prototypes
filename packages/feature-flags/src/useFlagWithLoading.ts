import { useEffect, useRef, useState } from 'react'

import { useTreatmentWithConfig } from '@splitsoftware/splitio-react'

import {
    evaluateFlag,
    getPrimaryEngineId,
    subscribeToFlag,
} from './dualEvaluation'
import { normalizeFlagId, parseTreatment } from './engines/harness'
import { ensureInitialization } from './engines/launchdarkly'
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
    // Both engine-specific hooks are always called; only the primary
    // engine's result is returned.
    const harness = useHarnessFlagWithLoading(flag, defaultValue)
    const ld = useLDFlagWithLoading(flag, defaultValue)
    return getPrimaryEngineId() === 'harness' ? harness : ld
}

function useHarnessFlagWithLoading<T>(
    flag: FeatureFlagKey,
    defaultValue: T,
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

function useLDFlagWithLoading<T>(
    flag: FeatureFlagKey,
    defaultValue: T,
): { value: T; isLoading: boolean } {
    const defaultValueRef = useRef(defaultValue)
    defaultValueRef.current = defaultValue

    const [state, setState] = useState<{ value: T; isLoading: boolean }>({
        value: evaluateFlag(flag, defaultValue),
        isLoading: true,
    })

    useEffect(() => {
        void (async () => {
            try {
                await ensureInitialization()
                setState({
                    value: evaluateFlag(flag, defaultValueRef.current),
                    isLoading: false,
                })
            } catch (error) {
                console.error('Error fetching feature flag', error)
                setState((prev) => ({ ...prev, isLoading: false }))
            }
        })()
    }, [flag])

    useEffect(() => {
        return subscribeToFlag(flag, defaultValueRef.current, (newValue) =>
            setState((prev) => ({ ...prev, value: newValue as T })),
        )
    }, [flag])

    return state
}
