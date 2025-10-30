import { SentryTeam } from 'common/const/sentryTeamNames'
import { resolveMetricFlag } from 'core/flags/utils/newApiMetricFlags'
import { MetricName } from 'domains/reporting/hooks/metricNames'
import {
    postReportingV1,
    postReportingV2,
    postReportingV2Query,
} from 'domains/reporting/models/resources'
import { BuiltQuery, ScopeMeta } from 'domains/reporting/models/scopes/scope'
import { compareAndReportQueries } from 'domains/reporting/models/scopes/utils'
import { Cube, ReportingParams } from 'domains/reporting/models/types'
import { getMigrationMode, MigrationMode } from 'domains/reporting/utils/utils'
import { reportError } from 'utils/errors'

import { UsePostReportingQueryData } from '../models/queries'

export interface ExecuteMetricConfig<
    TCube extends Cube = Cube,
    TMeta extends ScopeMeta = ScopeMeta,
> {
    /** Unique identifier for the metric, used for feature flag resolution */
    metricName: MetricName
    oldPayload: ReportingParams<TCube>
    newPayload?: BuiltQuery<TMeta>
}

/**
 * Requirements lookup table for each migration mode
 */
const MODE_REQUIREMENTS: Record<
    MigrationMode,
    (keyof ExecuteMetricConfig<any>)[]
> = {
    off: ['oldPayload'],
    shadow: ['oldPayload', 'newPayload'],
    complete: ['newPayload'],
} as const

/**
 * Validates metric configuration for a specific migration mode
 */
function validateMetricConfig<
    TCube extends Cube = Cube,
    TMeta extends ScopeMeta = ScopeMeta,
>(config: ExecuteMetricConfig<TCube, TMeta>, mode: MigrationMode): void {
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
type ExecutionFunction<
    TCube extends Cube = Cube,
    TMeta extends ScopeMeta = ScopeMeta,
> = <TData extends unknown[]>(
    config: Required<ExecuteMetricConfig<TCube, TMeta>>,
) => Promise<UsePostReportingQueryData<TData>>

/**
 * Executes only the legacy API (off mode)
 */
async function executeOffMode<
    TData extends unknown[],
    TCube extends Cube = Cube,
    TMeta extends ScopeMeta = ScopeMeta,
>(
    config: Required<ExecuteMetricConfig<TCube, TMeta>>,
): Promise<UsePostReportingQueryData<TData>> {
    return postReportingV1(config.oldPayload)
}

/**
 * Executes shadow mode testing where the legacy API serves production traffic
 * while the next API runs in parallel for validation without affecting users.
 */
async function executeShadowMode<
    TData extends unknown[],
    TCube extends Cube = Cube,
    TMeta extends ScopeMeta = ScopeMeta,
>(
    config: Required<ExecuteMetricConfig<TCube, TMeta>>,
): Promise<UsePostReportingQueryData<TData>> {
    const [oldResult, nextResult] = await Promise.allSettled([
        postReportingV1<TData, TCube>(config.oldPayload),
        postReportingV2Query<TCube, TMeta>(config.newPayload),
    ])

    if (oldResult.status === 'rejected') {
        throw oldResult.reason
    }

    if (nextResult.status === 'fulfilled') {
        compareAndReportQueries(
            config.metricName,
            oldResult.value.data.query,
            nextResult.value.data,
        )
    } else {
        reportError(
            new Error(
                `Next function failed in shadow mode for ${config.metricName}: ${nextResult.reason.message}`,
            ),
            {
                tags: { team: SentryTeam.CRM_REPORTING },
                extra: {
                    metricName: config.metricName,
                    reason: JSON.stringify(nextResult.reason),
                },
            },
        )
    }

    return oldResult.value
}

/**
 * Executes complete migration mode where the next API serves production traffic
 * while the legacy API runs in parallel for validation and rollback safety.
 */
async function executeCompleteMode<
    TData extends unknown[],
    TCube extends Cube = Cube,
    TMeta extends ScopeMeta = ScopeMeta,
>(
    config: Required<ExecuteMetricConfig<TCube, TMeta>>,
): Promise<UsePostReportingQueryData<TData>> {
    const nextResponse = await postReportingV2<TData, TMeta>(config.newPayload)
    return nextResponse
}

const EXECUTION_FUNCTIONS: Record<MigrationMode, ExecutionFunction> = {
    off: executeOffMode,
    shadow: executeShadowMode,
    complete: executeCompleteMode,
} as const

/**
 * Centralized metric execution router that handles API migration phases.
 *
 * Routes metric execution based on feature flag configuration:
 * - 'off': Uses only the legacy API
 * - 'shadow': Uses legacy API but tests next API in parallel
 * - 'complete': Uses only the next API with normalization
 *
 * @param config - Configuration object containing API functions and migration logic
 * @returns Promise resolving to normalized response in old API format
 * @throws Error when required functions are missing for the current migration mode
 */
export async function metricExecutionHandler<
    TData extends unknown[],
    TCube extends Cube = Cube,
    TMeta extends ScopeMeta = ScopeMeta,
>(
    config: ExecuteMetricConfig<TCube, TMeta>,
): Promise<UsePostReportingQueryData<TData>> {
    const flagName = resolveMetricFlag(config.metricName)
    let migrationMode = await getMigrationMode(flagName)

    try {
        validateMetricConfig(config, migrationMode)
    } catch (error) {
        // report configuration errors but allow metric execution to continue in 'off' mode
        reportError(error as Error, {
            tags: { team: SentryTeam.CRM_REPORTING },
            extra: { metricName: config.metricName },
        })
        // Fallback to 'off' mode if configuration is invalid
        migrationMode = 'off'
        validateMetricConfig(config, migrationMode)
    }

    const executionFunction = EXECUTION_FUNCTIONS[migrationMode]

    return executionFunction(
        config as Required<ExecuteMetricConfig<Cube, ScopeMeta>>,
    )
}
