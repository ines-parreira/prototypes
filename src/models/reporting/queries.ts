import {useQuery, UseQueryOptions} from '@tanstack/react-query'
import axios, {AxiosResponse} from 'axios'

import {
    Cube,
    EnrichmentFields,
    ReportingParams,
    ReportingQuery,
    ReportingResponse,
} from 'models/reporting/types'
import {postEnrichedReporting, postReporting} from 'models/reporting/resources'

export const doNotRetry40XErrorsHandler = (
    failureCount: number,
    error: unknown
) => {
    if (axios.isAxiosError(error)) {
        const statusCode = error?.response?.status
        if (statusCode && statusCode >= 400 && statusCode < 500) {
            return false
        }
    }

    return failureCount < 3
}

const defaultOptions = {
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
    retry: doNotRetry40XErrorsHandler,
}

export type UsePostReportingQueryData<TData extends unknown[]> = AxiosResponse<
    ReportingResponse<TData>
>

export type UseEnrichedPostReportingQueryData<TData> = AxiosResponse<
    ReportingResponse<TData>
>

export const reportingKeys = {
    post: (data: ReportingParams) => ['reporting', 'post-reporting', data],
    postEnriched: (data: {
        query: ReportingQuery
        enrichment: EnrichmentFields[]
    }) => ['reporting', 'post-reporting-enriched', data],
}

export const usePostReporting = <
    TData extends unknown[],
    SelectData = UsePostReportingQueryData<TData>,
    TCube extends Cube = Cube
>(
    data: ReportingParams<TCube>,
    overrides?: UseQueryOptions<
        UsePostReportingQueryData<TData>,
        unknown,
        SelectData
    >
) => {
    return useQuery({
        queryKey: reportingKeys.post(data),
        queryFn: () => postReporting<TData, TCube>(data),
        ...defaultOptions,
        ...overrides,
    })
}

export const useEnrichedPostReporting = <
    TData extends unknown[],
    SelectData = UseEnrichedPostReportingQueryData<TData>,
    TCube extends Cube = Cube
>(
    data: {
        query: ReportingQuery<TCube>
        enrichment: EnrichmentFields[]
    },
    overrides?: UseQueryOptions<
        UseEnrichedPostReportingQueryData<TData>,
        unknown,
        SelectData
    >
) => {
    return useQuery({
        queryKey: reportingKeys.postEnriched(data),
        queryFn: () => postEnrichedReporting<TData>(data),
        ...defaultOptions,
        ...overrides,
    })
}
