import { readMigration } from '@repo/feature-flags'
import { reportError } from '@repo/logging'
import { AxiosError } from 'axios'

import { SentryTeam } from 'common/const/sentryTeamNames'
import type { MetricName } from 'domains/reporting/hooks/metricNames'
import { METRIC_NAMES } from 'domains/reporting/hooks/metricNames'
import type { UsePostReportingQueryData } from 'domains/reporting/models/queries'
import {
    isTransientErrorMessage,
    isTransientErrorStatus,
    postReportingV1,
    postReportingV2,
    postReportingV2Query,
} from 'domains/reporting/models/resources'
import type {
    BuiltQuery,
    ScopeMeta,
} from 'domains/reporting/models/scopes/scope'
import { compareAndReportQueries } from 'domains/reporting/models/scopes/utils'
import type {
    Cube,
    ReportingParams,
    ReportingQuery,
} from 'domains/reporting/models/types'
import { getNewStatsFeatureFlagMigration } from 'domains/reporting/utils/getNewStatsFeatureFlagMigration'

// Metrics that are expected to support cursor pagination
// Add metrics here when implementing pagination support for them
const CURSOR_PAGINATION_WHITELIST = new Set<MetricName>([
    METRIC_NAMES.VOICE_CALL_LIST,
])

export interface ExecuteMetricConfig<
    TCube extends Cube = Cube,
    TMeta extends ScopeMeta = ScopeMeta,
> {
    /** Unique identifier for the metric, used for feature flag resolution */
    metricName: MetricName
    oldPayload?: ReportingParams<TCube>
    newPayload?: BuiltQuery<TMeta>
}
type Result<TData extends unknown[], TCube extends Cube = Cube> = {
    data?: UsePostReportingQueryData<TData>
    query?: ReportingQuery<TCube>
}

/**
 * Centralized metric execution router that handles API migration phases.
 *
 * @param config - Configuration object containing API functions and migration logic
 * @returns Promise resolving to normalized response in old API format
 */
export async function metricExecutionHandler<
    TData extends unknown[],
    TCube extends Cube = Cube,
    TMeta extends ScopeMeta = ScopeMeta,
>(
    config: ExecuteMetricConfig<TCube, TMeta>,
): Promise<UsePostReportingQueryData<TData>> {
    const stage = await getNewStatsFeatureFlagMigration(config.metricName)

    const v1 = async (): Promise<Result<TData>> => {
        const result = await postReportingV1<TData, TCube>(config.oldPayload!)
        return { data: result, query: result.data.query }
    }

    // Unless the flag is in "off" stage, we need "newPayload" to be set
    if (stage !== 'off' && !config.newPayload) {
        reportError(
            new Error(
                `Missing required functions for metric ${config.metricName} in ${stage} mode: newPayload`,
            ),
            {
                tags: { team: SentryTeam.CRM_REPORTING },
                extra: { metricName: config.metricName },
            },
        )

        // Fallback to the V1 implementation
        return (await v1()).data!
    }

    // Special implementation for the "v2" function as we do not actually compare data here but queries
    const v2 = async (): Promise<Result<TData>> => {
        try {
            // Only load actual data in "live" or "complete" stage since we need it as a return value (not loaded in "shadow" stage)
            let data
            if (stage === 'live' || stage === 'complete')
                data = await postReportingV2<TData, TMeta>(config.newPayload!)

            // Validate cursor pagination for non-whitelisted metrics
            if (data && config.newPayload?.metricName) {
                const nextCursor = (data.data as any).meta?.next_cursor
                const metricName = config.newPayload.metricName

                if (
                    nextCursor != null &&
                    !CURSOR_PAGINATION_WHITELIST.has(metricName)
                ) {
                    console.error(
                        `Backend returned unexpected cursor pagination for metric ${metricName}`,
                        {
                            metricName,
                            cursor: nextCursor,
                            stage,
                        },
                    )

                    reportError(
                        new Error(
                            `Backend returned unexpected cursor pagination for metric ${metricName}`,
                        ),
                        {
                            tags: { team: SentryTeam.CRM_REPORTING },
                            extra: {
                                metricName,
                                cursor: nextCursor,
                                stage,
                                query: JSON.stringify(config.newPayload),
                            },
                        },
                        ['pagination', config.metricName],
                    )
                }
            }

            // Only load the query in "shadow" and "live" stage as we use it to compare with the v1 query (not loaded in "complete" stage)
            let query
            if (stage === 'shadow' || stage === 'live') {
                query = (
                    await postReportingV2Query<TCube, TMeta>(config.newPayload!)
                ).data
            }

            return { data, query }
        } catch (e) {
            const isAxiosError = e instanceof AxiosError
            const statusCode = isAxiosError ? e?.response?.status : undefined
            const reason = isAxiosError ? e?.response?.data : e
            const errorMessage = (e as Error).message

            // Skip Sentry reporting for transient errors to avoid noise
            // Transient errors: 202 (accepted but not ready), 429 (rate limit), 5xx (server errors), network errors
            // Skip errors caused by invalid CSRF tokens -> 'Something went wrong. Please reload this page.'
            const isTransientError =
                (isAxiosError && isTransientErrorStatus(statusCode)) ||
                isTransientErrorMessage(errorMessage) ||
                reason?.error?.msg ===
                    'Something went wrong. Please reload this page.'

            if (isTransientError) {
                throw e
            }
            // Report all other errors to Sentry
            reportError(
                new Error(
                    `Next function failed in ${stage} mode for ${config.metricName}: ${errorMessage}`,
                ),
                {
                    tags: { team: SentryTeam.CRM_REPORTING },
                    extra: {
                        metricName: config.metricName,
                        reason: JSON.stringify(reason),
                        payload: JSON.stringify(config.newPayload),
                    },
                },
                [
                    `next_failed_${stage}`,
                    config.metricName,
                    (e as Error).message,
                ],
            )
            throw e
        }
    }

    // Unless the flag is in "complete" stage, we need "oldPayload" to be set
    if (stage !== 'complete' && !config.oldPayload) {
        return await postReportingV2<TData, TMeta>(config.newPayload!)
    }

    const comparison = (v1: Result<TData>, v2: Result<TData>): boolean =>
        compareAndReportQueries(config.metricName, v1.query!, v2.query!)

    const result = await readMigration(stage, v1, v2, comparison)
    return result.data!
}
