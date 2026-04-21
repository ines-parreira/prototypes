import { isEqual } from 'lodash'

import { evalStore } from './debug/evalStore'
import type { FlagContext } from './engines/context'
import * as harness from './engines/harness'
import * as ld from './engines/launchdarkly'
import type { FeatureFlagKey } from './featureFlagKey'

type EngineId = 'launchdarkly' | 'harness'

const engines = { launchdarkly: ld, harness } as const

export const CONTROL_FLAG = 'linear.RD-500.use-harness-platform'

export function initEngines(flagContext: FlagContext): void {
    ld.initialize(flagContext)
    harness.initialize(flagContext)

    void Promise.all([
        ld.ensureInitialization(),
        harness.ensureInitialization(),
    ])
        .then(() => seedEvalStore())
        .catch(() => {})
}

export function getPrimaryEngineId(): EngineId {
    return ld.evaluate<boolean>(CONTROL_FLAG, false)
        ? 'harness'
        : 'launchdarkly'
}

function getEngines() {
    const primaryId = getPrimaryEngineId()
    const secondaryId: EngineId =
        primaryId === 'launchdarkly' ? 'harness' : 'launchdarkly'
    return {
        primaryId,
        secondaryId,
        primary: engines[primaryId],
        secondary: engines[secondaryId],
    }
}

export function evaluateFlag<T>(flag: FeatureFlagKey, defaultValue: T): T {
    const { primary, secondary, primaryId } = getEngines()
    const value = primary.evaluate(flag, defaultValue)

    queueMicrotask(() => {
        try {
            const secondaryValue = secondary.evaluate(flag, defaultValue)
            const status = isEqual(secondaryValue, value) ? 'match' : 'mismatch'
            evalStore.getState().addEntry(flag, {
                flag,
                defaultValue,
                launchdarklyValue:
                    primaryId === 'launchdarkly' ? value : secondaryValue,
                harnessValue: primaryId === 'harness' ? value : secondaryValue,
                status,
                timestamp: Date.now(),
            })
        } catch {
            // Secondary engine errors never propagate
        }
    })

    return value
}

export async function evaluateFlagAsync<T>(
    flag: FeatureFlagKey,
    defaultValue: T,
): Promise<{ value: T; error: Error | null }> {
    const { primary, secondary, primaryId } = getEngines()

    try {
        const value = await primary.evaluateAsync(flag, defaultValue)

        try {
            const secondaryValue = await Promise.race([
                secondary.evaluateAsync(flag, defaultValue),
                new Promise<T>((_, reject) =>
                    setTimeout(
                        () => reject(new Error('Secondary engine timeout')),
                        2000,
                    ),
                ),
            ])
            const status = isEqual(secondaryValue, value) ? 'match' : 'mismatch'
            evalStore.getState().addEntry(flag, {
                flag,
                defaultValue,
                launchdarklyValue:
                    primaryId === 'launchdarkly' ? value : secondaryValue,
                harnessValue: primaryId === 'harness' ? value : secondaryValue,
                status,
                timestamp: Date.now(),
            })
        } catch {
            // Secondary engine errors never propagate
        }

        return { value, error: null }
    } catch (error) {
        console.error(`Error fetching feature flag: ${flag}`, error)
        return { value: defaultValue, error: error as Error }
    }
}

export function subscribeToFlag<T>(
    flag: string,
    defaultValue: T,
    callback: (value: T) => void,
): () => void {
    const { primary } = getEngines()
    return primary.subscribe(flag, defaultValue, callback)
}

export function seedEvalStore() {
    const allFlags = ld.getAllFlags()
    for (const [flag, ldValue] of Object.entries(allFlags)) {
        const harnessValue = harness.evaluate(flag, ldValue)
        const status = isEqual(ldValue, harnessValue) ? 'match' : 'mismatch'
        evalStore.getState().addEntry(flag, {
            flag,
            defaultValue: ldValue,
            launchdarklyValue: ldValue,
            harnessValue,
            status,
            timestamp: null,
        })
    }
}

export function getFlagDetails(flag: string) {
    return {
        launchdarkly: ld.getRawValue(flag),
        harness: harness.getRawValue(flag),
    }
}

export function getEngineContexts() {
    return {
        launchdarkly: ld.getContext(),
        harness: harness.getContext(),
    }
}
