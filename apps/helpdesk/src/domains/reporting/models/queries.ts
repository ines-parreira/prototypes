import { Query, useQuery, UseQueryOptions } from '@tanstack/react-query'
import { AxiosResponse } from 'axios'

import { appQueryClient } from 'api/queryClient'
import { reportingRetryDelayHandler, reportingRetryHandler } from 'api/utils'
import {
    postEnrichedReporting,
    postReportingV1,
} from 'domains/reporting/models/resources'
import { BuiltQuery, ScopeMeta } from 'domains/reporting/models/scopes/scope'
import {
    Cube,
    EnrichmentFields,
    ReportingParams,
    ReportingQuery,
    ReportingResponse,
} from 'domains/reporting/models/types'
import { metricExecutionHandler } from 'domains/reporting/utils/metricExecutionHandler'
import { useGetNewStatsFeatureFlagMigration } from 'domains/reporting/utils/useGetNewStatsFeatureFlagMigration'

const stopOnError = (query: Pick<Query, 'state'>) =>
    query.state.status !== 'error'

const defaultOptions = {
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
    retry: reportingRetryHandler,
    retryDelay: reportingRetryDelayHandler,
    refetchOnWindowFocus: stopOnError,
    retryOnMount: false,
    refetchOnMount: stopOnError,
    refetchOnReconnect: stopOnError,
} as const

export type UsePostReportingQueryData<TData extends unknown[]> = AxiosResponse<
    ReportingResponse<TData>
>

export type UseEnrichedPostReportingQueryData<TData> = AxiosResponse<TData>

export const reportingKeys = {
    post: (payload: ReportingParams) => [
        'reporting',
        'post-reporting',
        payload,
    ],
    postV2: <TMeta extends ScopeMeta = ScopeMeta>(
        payload: ReportingParams,
        newPayload: BuiltQuery<TMeta>,
    ) => ['reporting', 'post-reporting-v2', payload, newPayload],
    postEnriched: (payload: {
        query: ReportingQuery
        enrichment_fields: EnrichmentFields[]
    }) => ['reporting', 'post-reporting-enriched', payload],
}

export const fetchPostReporting = <
    TData extends unknown[],
    SelectData = UsePostReportingQueryData<TData>,
    TCube extends Cube = Cube,
>(
    payload: ReportingParams<TCube>,
    overrides?: UseQueryOptions<
        UsePostReportingQueryData<TData>,
        unknown,
        SelectData
    >,
) => {
    return appQueryClient.fetchQuery({
        queryKey: reportingKeys.post(payload),
        queryFn: () => postReportingV1<TData, TCube>(payload),
        ...defaultOptions,
        ...overrides,
    })
}

/**
 * Similar to fetchPostReporting but with support for v2 queries.
 * This is a temporary solution, because some metrics use `fetchPostReporting` directly
 * and not one of the `fetchMetricX` functions and refactoring all of them would be too time-consuming for now.
 */
export const fetchPostReportingV2 = <
    TData extends unknown[],
    SelectData = UsePostReportingQueryData<TData>,
    TCube extends Cube = Cube,
    TMeta extends ScopeMeta = ScopeMeta,
>(
    payload: ReportingParams<TCube>,
    newPayload?: BuiltQuery<TMeta>,
    overrides?: UseQueryOptions<
        UsePostReportingQueryData<TData>,
        unknown,
        SelectData
    >,
) => {
    return appQueryClient.fetchQuery({
        queryKey: newPayload
            ? reportingKeys.postV2(payload, newPayload)
            : reportingKeys.post(payload),
        queryFn: () =>
            metricExecutionHandler<TData, TCube, TMeta>({
                metricName: payload[0].metricName,
                oldPayload: payload,
                newPayload: newPayload,
            }),
        ...defaultOptions,
        ...overrides,
    })
}

export const usePostReporting = <
    TData extends unknown[],
    SelectData = UsePostReportingQueryData<TData>,
    TCube extends Cube = Cube,
>(
    payload: ReportingParams<TCube>,
    overrides?: UseQueryOptions<
        UsePostReportingQueryData<TData>,
        unknown,
        SelectData
    >,
) => {
    return useQuery({
        queryKey: reportingKeys.post(payload),
        queryFn: () => postReportingV1<TData, TCube>(payload),
        ...defaultOptions,
        ...overrides,
    })
}

/**
 * Similar to usePostReporting but with support for v2 queries.
 * This is a temporary solution, because some metrics use `usePostReporting` directly
 * and not one of the `useMetricX` hooks and refactoring all of them would be too time-consuming for now.
 */
export const usePostReportingV2 = <
    TData extends unknown[],
    SelectData = UsePostReportingQueryData<TData>,
    TCube extends Cube = Cube,
    TMeta extends ScopeMeta = ScopeMeta,
>(
    payload: ReportingParams<TCube>,
    newPayload?: BuiltQuery<TMeta>,
    overrides?: UseQueryOptions<
        UsePostReportingQueryData<TData>,
        unknown,
        SelectData
    >,
) => {
    const migrationStage = useGetNewStatsFeatureFlagMigration(
        payload[0].metricName,
    )
    return useQuery({
        queryKey: newPayload
            ? reportingKeys.postV2(payload, newPayload)
            : reportingKeys.post(payload),

        queryFn: () =>
            metricExecutionHandler<TData, TCube, TMeta>(
                {
                    metricName: payload[0].metricName,
                    oldPayload: payload,
                    newPayload: newPayload,
                },
                migrationStage,
            ),
        ...defaultOptions,
        ...overrides,
    })
}

export const useEnrichedPostReporting = <
    TData,
    SelectData,
    TCube extends Cube = Cube,
>(
    payload: {
        query: ReportingQuery<TCube>
        enrichment_fields: EnrichmentFields[]
    },
    overrides?: UseQueryOptions<
        UseEnrichedPostReportingQueryData<TData>,
        unknown,
        SelectData
    >,
) => {
    return useQuery({
        queryKey: reportingKeys.postEnriched(payload),
        queryFn: () =>
            postEnrichedReporting<TData, TCube>(
                payload.query,
                payload.enrichment_fields,
            ),
        ...defaultOptions,
        ...overrides,
    })
}
