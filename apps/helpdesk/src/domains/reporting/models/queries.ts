import { Query, useQuery, UseQueryOptions } from '@tanstack/react-query'
import { AxiosResponse } from 'axios'

import { appQueryClient } from 'api/queryClient'
import { doNotRetry40xAnd5xxErrors } from 'api/utils'
import {
    postEnrichedReporting,
    postReporting,
} from 'domains/reporting/models/resources'
import { BuiltQuery, ScopeMeta } from 'domains/reporting/models/scopes/scope'
import {
    Cube,
    EnrichmentFields,
    ReportingParams,
    ReportingQuery,
    ReportingResponse,
    ReportingV2Response,
} from 'domains/reporting/models/types'

const stopOnError = (query: Pick<Query, 'state'>) =>
    query.state.status !== 'error'

const defaultOptions = {
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
    retry: doNotRetry40xAnd5xxErrors,
    refetchOnWindowFocus: stopOnError,
    retryOnMount: false,
    refetchOnMount: stopOnError,
    refetchOnReconnect: stopOnError,
} as const

export type UsePostReportingQueryData<TData extends unknown[]> = AxiosResponse<
    ReportingResponse<TData> | ReportingV2Response<TData>
>

export type UseEnrichedPostReportingQueryData<TData> = AxiosResponse<TData>

export const reportingKeys = {
    post: (data: ReportingParams) => ['reporting', 'post-reporting', data],
    postV2: <TMeta extends ScopeMeta>(
        data: ReportingParams,
        dataV2: BuiltQuery<TMeta>,
    ) => ['reporting-v2', 'post-reporting-v2', data, dataV2],
    postEnriched: (data: {
        query: ReportingQuery
        enrichment_fields: EnrichmentFields[]
    }) => ['reporting', 'post-reporting-enriched', data],
}

export const fetchPostReporting = <
    TData extends unknown[],
    SelectData = UsePostReportingQueryData<TData>,
    TCube extends Cube = Cube,
>(
    data: ReportingParams<TCube>,
    overrides?: UseQueryOptions<
        UsePostReportingQueryData<TData>,
        unknown,
        SelectData
    >,
) => {
    return appQueryClient.fetchQuery({
        queryKey: reportingKeys.post(data),
        queryFn: () => postReporting<TData, TCube>(data),
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
    data: ReportingParams<TCube>,
    dataV2?: BuiltQuery<TMeta>,
    overrides?: UseQueryOptions<
        UsePostReportingQueryData<TData>,
        unknown,
        SelectData
    >,
) => {
    return useQuery({
        queryKey: dataV2
            ? reportingKeys.postV2<TMeta>(data, dataV2)
            : reportingKeys.post(data),
        queryFn: () => postReporting<TData, TCube, TMeta>(data, dataV2),
        ...defaultOptions,
        ...overrides,
    })
}

export const usePostReporting = <
    TData extends unknown[],
    SelectData = UsePostReportingQueryData<TData>,
    TCube extends Cube = Cube,
>(
    data: ReportingParams<TCube>,
    overrides?: UseQueryOptions<
        UsePostReportingQueryData<TData>,
        unknown,
        SelectData
    >,
) => {
    return useQuery({
        queryKey: reportingKeys.post(data),
        queryFn: () => postReporting<TData, TCube>(data),
        ...defaultOptions,
        ...overrides,
    })
}

export const useEnrichedPostReporting = <
    TData,
    SelectData,
    TCube extends Cube = Cube,
>(
    data: {
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
        queryKey: reportingKeys.postEnriched(data),
        queryFn: () =>
            postEnrichedReporting<TData, TCube>(
                data.query,
                data.enrichment_fields,
            ),
        ...defaultOptions,
        ...overrides,
    })
}
