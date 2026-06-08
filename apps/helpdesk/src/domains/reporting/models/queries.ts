import {
    appQueryClient,
    reportingRetryDelayHandler,
    reportingRetryHandler,
} from '@repo/api-resources'
import type { Query, UseQueryOptions } from '@tanstack/react-query'
import { useQuery } from '@tanstack/react-query'
import type { AxiosResponse } from 'axios'
import { Duration } from '@gorgias/toolkit'

import {
    postEnrichedReporting,
    postReportingV1,
    postReportingV2,
} from 'domains/reporting/models/resources'
import type {
    BuiltQuery,
    ScopeMeta,
} from 'domains/reporting/models/scopes/scope'
import type {
    Cube,
    EnrichmentFields,
    ReportingParams,
    ReportingQuery,
    ReportingResponse,
} from 'domains/reporting/models/types'
import { metricExecutionHandler } from 'domains/reporting/utils/metricExecutionHandler'

const stopOnError = (query: Pick<Query, 'state'>) =>
    query.state.status !== 'error'

export const defaultQueryOptions = {
    staleTime: Duration.minutes(5),
    cacheTime: Duration.minutes(10),
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
        payload: ReportingParams | undefined,
        newPayload: BuiltQuery<TMeta>,
    ) => ['reporting', 'post-reporting-v2', payload || 'only', newPayload],
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
        ...defaultQueryOptions,
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
    payload?: ReportingParams<TCube>,
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
            : reportingKeys.post(payload!),
        queryFn: () =>
            metricExecutionHandler<TData, TCube, TMeta>({
                metricName: newPayload?.metricName || payload![0].metricName,
                oldPayload: payload,
                newPayload: newPayload,
            }),
        ...defaultQueryOptions,
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
        ...defaultQueryOptions,
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
    payload?: ReportingParams<TCube>,
    newPayload?: BuiltQuery<TMeta>,
    overrides?: UseQueryOptions<
        UsePostReportingQueryData<TData>,
        unknown,
        SelectData
    >,
) => {
    return useQuery({
        queryKey: newPayload
            ? reportingKeys.postV2(payload, newPayload)
            : reportingKeys.post(payload!),

        queryFn: () =>
            metricExecutionHandler<TData, TCube, TMeta>({
                metricName: newPayload?.metricName || payload![0].metricName,
                oldPayload: payload,
                newPayload: newPayload,
            }),
        ...defaultQueryOptions,
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
        ...defaultQueryOptions,
        ...overrides,
    })
}

/**
 * Stats Time Series Helpers
 * ----------------------------
 * The following functions use the new stats API only
 **/

export const fetchPostStats = <
    TData extends unknown[],
    SelectData = UsePostReportingQueryData<TData>,
    TMeta extends ScopeMeta = ScopeMeta,
>(
    payload: BuiltQuery<TMeta>,
    overrides?: UseQueryOptions<
        UsePostReportingQueryData<TData>,
        unknown,
        SelectData
    >,
) => {
    return appQueryClient.fetchQuery({
        queryKey: reportingKeys.postV2(undefined, payload),
        queryFn: () => postReportingV2<TData, TMeta>(payload),
        ...defaultQueryOptions,
        ...overrides,
    })
}

export const usePostStats = <
    TData extends unknown[],
    SelectData = UsePostReportingQueryData<TData>,
    TMeta extends ScopeMeta = ScopeMeta,
>(
    payload: BuiltQuery<TMeta>,
    overrides?: UseQueryOptions<
        UsePostReportingQueryData<TData>,
        unknown,
        SelectData
    >,
) => {
    return useQuery({
        queryKey: reportingKeys.postV2(undefined, payload),
        queryFn: () => postReportingV2<TData, TMeta>(payload),
        ...defaultQueryOptions,
        ...overrides,
    })
}
