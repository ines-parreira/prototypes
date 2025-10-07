import { AxiosResponse } from 'axios'

import { resolveMetricFlag } from 'core/flags/utils/newApiMetricFlags'
import { MetricName } from 'domains/reporting/hooks/metricNames'
import { reportError } from 'utils/errors'

import { getMigrationMode, MigrationMode } from './utils'

/**
 * Configuration for executing metrics during API migration phases.
 * Supports gradual migration from old to next APIs with comparison and normalization.
 *
 * @template OldResponseShape - Type of the legacy API response
 * @template NextResponseShape - Type of the next API response
 */
export interface ExecuteMetricConfig<OldResponseShape, NextResponseShape> {
    /** Unique identifier for the metric, used for feature flag resolution */
    name: MetricName
    /** Legacy API function - required in 'off', 'shadow', and 'live' modes */
    old?: () => Promise<AxiosResponse<OldResponseShape>>
    /** Next API function - required in 'complete', 'shadow', and 'live' modes */
    next?: () => Promise<AxiosResponse<NextResponseShape>>
    /** Transforms next API response to match old API format - required in 'complete' and 'live' modes */
    normalize?: (nextResponse: NextResponseShape) => OldResponseShape
    /** Validates old and next responses during migration - required in 'shadow' and 'live' modes */
    validate?: (
        oldResponse: OldResponseShape,
        nextResponse: NextResponseShape,
    ) => void
}

/**
 * Requirements lookup table for each migration mode
 */
const MODE_REQUIREMENTS: Record<
    MigrationMode,
    (keyof ExecuteMetricConfig<any, any>)[]
> = {
    off: ['old'],
    complete: ['next', 'normalize'],
    shadow: ['old', 'next', 'validate'],
    live: ['old', 'next', 'normalize', 'validate'],
} as const

/**
 * Validates metric configuration for a specific migration mode
 */
function validateMetricConfig<OldResponseShape, NextResponseShape>(
    config: ExecuteMetricConfig<OldResponseShape, NextResponseShape>,
    mode: MigrationMode,
): void {
    const requirements = MODE_REQUIREMENTS[mode]
    if (!requirements) {
        throw new Error(`Unknown migration mode: ${mode}`)
    }

    const missing = requirements.filter((req) => !config[req])

    if (missing.length > 0) {
        throw new Error(
            `Missing required functions for metric ${config.name} in ${mode} mode: ${missing.join(', ')}`,
        )
    }
}

/**
 * Type for execution functions
 */
type ExecutionFunction<OldResponseShape, NextResponseShape> = (
    config: Required<ExecuteMetricConfig<OldResponseShape, NextResponseShape>>,
) => Promise<AxiosResponse<OldResponseShape>>

/**
 * Executes only the legacy API (off mode)
 */
async function executeOffMode<OldResponseShape, NextResponseShape>(
    config: Required<ExecuteMetricConfig<OldResponseShape, NextResponseShape>>,
): Promise<AxiosResponse<OldResponseShape>> {
    return config.old()
}

/**
 * Executes only the next API with normalization (complete mode)
 */
async function executeCompleteMode<OldResponseShape, NextResponseShape>(
    config: Required<ExecuteMetricConfig<OldResponseShape, NextResponseShape>>,
): Promise<AxiosResponse<OldResponseShape>> {
    const nextResponse = await config.next()
    return {
        ...nextResponse,
        data: config.normalize(nextResponse.data),
    }
}

/**
 * Executes shadow mode testing where the legacy API serves production traffic
 * while the next API runs in parallel for validation without affecting users.
 */
async function executeShadowMode<OldResponseShape, NextResponseShape>(
    config: Required<ExecuteMetricConfig<OldResponseShape, NextResponseShape>>,
): Promise<AxiosResponse<OldResponseShape>> {
    const [oldResult, nextResult] = await Promise.allSettled([
        config.old(),
        config.next(),
    ])

    if (oldResult.status === 'rejected') {
        throw oldResult.reason
    }

    if (nextResult.status === 'fulfilled') {
        config.validate(oldResult.value.data, nextResult.value.data)
    } else {
        reportError(
            new Error(
                `Next function failed in shadow mode for ${config.name}: ${nextResult.reason.message}`,
            ),
        )
    }

    return oldResult.value
}

/**
 * Executes live migration mode where the next API serves production traffic
 * while the legacy API runs in parallel for validation and rollback safety.
 */
async function executeLiveMode<OldResponseShape, NextResponseShape>(
    config: Required<ExecuteMetricConfig<OldResponseShape, NextResponseShape>>,
): Promise<AxiosResponse<OldResponseShape>> {
    const [oldResult, nextResult] = await Promise.allSettled([
        config.old(),
        config.next(),
    ])

    if (nextResult.status === 'rejected') {
        throw nextResult.reason
    }

    const normalizedData = config.normalize(nextResult.value.data)

    if (oldResult.status === 'fulfilled') {
        config.validate(oldResult.value.data, nextResult.value.data)
    } else {
        reportError(
            new Error(
                `Old function failed in live mode for ${config.name}: ${oldResult.reason.message}`,
            ),
        )
    }

    return {
        ...nextResult.value,
        data: normalizedData,
    }
}

/**
 * Execution functions lookup table
 */
const EXECUTION_FUNCTIONS: Record<
    MigrationMode,
    ExecutionFunction<any, any>
> = {
    off: executeOffMode,
    complete: executeCompleteMode,
    shadow: executeShadowMode,
    live: executeLiveMode,
} as const

/**
 * Centralized metric execution router that handles API migration phases.
 *
 * Routes metric execution based on feature flag configuration:
 * - 'off': Uses only the legacy API
 * - 'complete': Uses only the next API with normalization
 * - 'shadow': Uses legacy API but tests next API in parallel
 * - 'live': Uses next API but validates against legacy API
 *
 * @param config - Configuration object containing API functions and migration logic
 * @returns Promise resolving to normalized response in old API format
 * @throws Error when required functions are missing for the current migration mode
 */
export async function executeMetric<OldResponseShape, NextResponseShape>(
    config: ExecuteMetricConfig<OldResponseShape, NextResponseShape>,
): Promise<AxiosResponse<OldResponseShape>> {
    const flagName = resolveMetricFlag(config.name)
    const migrationMode = await getMigrationMode(flagName)

    validateMetricConfig(config, migrationMode)

    const executionFunction = EXECUTION_FUNCTIONS[migrationMode]

    return executionFunction(
        config as Required<
            ExecuteMetricConfig<OldResponseShape, NextResponseShape>
        >,
    )
}
