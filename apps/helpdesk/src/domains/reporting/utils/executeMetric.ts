import { AxiosResponse } from 'axios'

import { resolveMetricFlag } from 'core/flags/utils/newApiMetricFlags'
import { MetricName } from 'domains/reporting/hooks/metricNames'
import {
    ReportingQuery,
    ReportingResponse,
    ReportingV2Response,
} from 'domains/reporting/models/types'
import { getMigrationMode, MigrationMode } from 'domains/reporting/utils/utils'
import { reportError } from 'utils/errors'

/**
 * Configuration for executing metrics during API migration phases.
 * Supports gradual migration from old to next APIs with comparison and normalization.
 *
 * @template OldResponseShape - Type of the legacy API response
 * @template NextResponseShape - Type of the next API response
 */

type OldApiResponseShape<TData> = Promise<
    AxiosResponse<ReportingResponse<TData>>
>
type NewApiResponseShape<TData> = Promise<
    AxiosResponse<ReportingV2Response<TData>>
>
type QueryResponseShape = Promise<AxiosResponse<ReportingQuery>>

export interface ExecuteMetricConfig<TData = any> {
    /** Unique identifier for the metric, used for feature flag resolution */
    metricName: MetricName
    oldApi?: (/*payload: ReportingParams<TCube>*/) => OldApiResponseShape<TData>
    newApi?: (/*payload: BuiltQuery<ScopeMeta, MetricName>*/) => NewApiResponseShape<TData>
    newQueryApi?: (/*payload: BuiltQuery<ScopeMeta, MetricName>*/) => QueryResponseShape
    /* normalizes new response to return the old response shape */
    normalize?: (
        nextResponse: ReportingV2Response<TData>,
    ) => ReportingResponse<TData>
    /** Validates old and next responses during migration - required in 'live' mode */
    validate?: (
        oldResponse: ReportingResponse<TData>,
        nextResponse: ReportingV2Response<TData>,
    ) => void
    /** Validates old and next responses during migration - required in 'shadow' mode */
    validateQuery?: (
        metricName: MetricName,
        oldResponseQuery: ReportingQuery,
        newResponseQuery: ReportingQuery,
    ) => void
}

/**
 * Requirements lookup table for each migration mode
 */
const MODE_REQUIREMENTS: Record<
    MigrationMode,
    (keyof ExecuteMetricConfig<any>)[]
> = {
    off: ['oldApi'],
    shadow: ['oldApi', 'newQueryApi', 'validateQuery'],
    live: ['oldApi', 'newApi', 'normalize', 'validate'],
    complete: ['newApi', 'normalize'],
} as const

/**
 * Validates metric configuration for a specific migration mode
 */
function validateMetricConfig<TData>(
    config: ExecuteMetricConfig<TData>,
    mode: MigrationMode,
): void {
    const requirements = MODE_REQUIREMENTS[mode]
    if (!requirements) {
        throw new Error(`Unknown migration mode: ${mode}`)
    }

    const missing = requirements.filter((req) => !config[req])

    if (missing.length > 0) {
        throw new Error(
            `Missing required functions for metric ${config.metricName} in ${mode} mode: ${missing.join(', ')}`,
        )
    }
}

/**
 * Type for execution functions
 */
type ExecutionFunction = <TData>(
    config: Required<ExecuteMetricConfig<TData>>,
) => Promise<
    AxiosResponse<ReportingResponse<TData> | ReportingV2Response<TData>>
>

/**
 * Executes only the legacy API (off mode)
 */
async function executeOffMode<TData>(
    config: Required<ExecuteMetricConfig<TData>>,
): OldApiResponseShape<TData> {
    return config.oldApi()
}

/**
 * Executes only the new API and returns the normalized response -> V1 response
 */
async function executeCompleteMode<TData>(
    config: Required<ExecuteMetricConfig<TData>>,
): NewApiResponseShape<TData> {
    const nextResponse = await config.newApi()
    return {
        ...nextResponse,
        data: config.normalize(nextResponse.data),
    }
}

/**
 * Executes shadow mode testing where the legacy API serves production traffic
 * while the next API runs in parallel for validation without affecting users.
 */
async function executeShadowMode<TData>(
    config: Required<ExecuteMetricConfig<TData>>,
): OldApiResponseShape<TData> {
    const [oldResult, nextResult] = await Promise.allSettled([
        config.oldApi(),
        config.newQueryApi(),
    ])

    if (oldResult.status === 'rejected') {
        throw oldResult.reason
    }

    if (nextResult.status === 'fulfilled') {
        config.validateQuery(
            config.metricName,
            oldResult.value.data.query,
            nextResult.value.data,
        )
    } else {
        reportError(
            new Error(
                `Next function failed in shadow mode for ${config.metricName}: ${nextResult.reason.message}`,
            ),
        )
    }

    return oldResult.value
}

/**
 * Executes live migration mode where the next API serves production traffic
 * while the legacy API runs in parallel for validation and rollback safety.
 */
async function executeLiveMode<TData>(
    config: Required<ExecuteMetricConfig<TData>>,
): OldApiResponseShape<TData> {
    const [oldResult, nextResult] = await Promise.allSettled([
        config.oldApi(),
        config.newApi(),
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
                `Old function failed in live mode for ${config.metricName}: ${oldResult.reason.message}`,
            ),
        )
    }

    return {
        ...nextResult.value,
        data: normalizedData,
    }
}

const EXECUTION_FUNCTIONS: Record<MigrationMode, ExecutionFunction> = {
    off: executeOffMode,
    shadow: executeShadowMode,
    live: executeLiveMode,
    complete: executeCompleteMode,
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
export async function executeMetric<TData>(
    config: ExecuteMetricConfig<TData>,
): Promise<
    | AxiosResponse<ReportingResponse<TData>, any>
    | AxiosResponse<ReportingV2Response<TData>, any>
> {
    const flagName = resolveMetricFlag(config.metricName)
    let migrationMode = await getMigrationMode(flagName)

    try {
        validateMetricConfig(config, migrationMode)
    } catch (error) {
        // report configuration errors but allow metric execution to continue in 'off' mode
        reportError(error as Error, {
            extra: { metricName: config.metricName },
        })
        // Fallback to 'off' mode if configuration is invalid
        migrationMode = 'off'
        validateMetricConfig(config, migrationMode)
    }

    const executionFunction = EXECUTION_FUNCTIONS[migrationMode]

    return executionFunction(config as Required<ExecuteMetricConfig<TData>>)
}
