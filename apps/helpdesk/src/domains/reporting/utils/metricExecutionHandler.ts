import { SentryTeam } from 'common/const/sentryTeamNames'
import { readMigration } from 'core/flags/utils/readMigration'
import { MetricName } from 'domains/reporting/hooks/metricNames'
import { UsePostReportingQueryData } from 'domains/reporting/models/queries'
import {
    postReportingV1,
    postReportingV2,
    postReportingV2Query,
} from 'domains/reporting/models/resources'
import { BuiltQuery, ScopeMeta } from 'domains/reporting/models/scopes/scope'
import { compareAndReportQueries } from 'domains/reporting/models/scopes/utils'
import {
    Cube,
    ReportingParams,
    ReportingQuery,
} from 'domains/reporting/models/types'
import { getNewStatsFeatureFlagMigration } from 'domains/reporting/utils/getNewStatsFeatureFlagMigration'
import { reportError } from 'utils/errors'

export interface ExecuteMetricConfig<
    TCube extends Cube = Cube,
    TMeta extends ScopeMeta = ScopeMeta,
> {
    /** Unique identifier for the metric, used for feature flag resolution */
    metricName: MetricName
    oldPayload: ReportingParams<TCube>
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
        const result = await postReportingV1<TData, TCube>(config.oldPayload)
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

        // Fallback to the V1implementation
        return (await v1()).data!
    }

    // Special implementation for the "v2" function as we do not actually compare data here but queries
    const v2 = async (): Promise<Result<TData>> => {
        try {
            // Only load actual data in "live" or "complete" stage since we need it as a return value (not loaded in "shadow" stage)
            let data
            if (stage === 'live' || stage === 'complete')
                data = await postReportingV2<TData, TMeta>(config.newPayload!)

            // Only load the query in "shadow" and "live" stage as we use it to compare with the v1 query (not loaded in "complete" stage)
            let query
            if (stage === 'shadow' || stage === 'live') {
                query = (
                    await postReportingV2Query<TCube, TMeta>(config.newPayload!)
                ).data
            }

            return { data, query }
        } catch (e) {
            reportError(
                new Error(
                    `Next function failed in ${stage} mode for ${config.metricName}: ${(e as Error).message}`,
                ),
                {
                    tags: { team: SentryTeam.CRM_REPORTING },
                    extra: {
                        metricName: config.metricName,
                        reason: JSON.stringify(e),
                    },
                },
            )
            throw e
        }
    }

    const comparison = (v1: Result<TData>, v2: Result<TData>): boolean =>
        compareAndReportQueries(config.metricName, v1.query!, v2.query!)

    const result = await readMigration(stage, v1, v2, comparison)
    return result.data!
}
