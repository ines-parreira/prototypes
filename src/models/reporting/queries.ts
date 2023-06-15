import {useQuery, UseQueryOptions} from '@tanstack/react-query'
import {AxiosResponse} from 'axios'

import {postReporting} from './resources'
import {ReportingParams, ReportingResponse} from './types'

const defaultOptions = {
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
}

export type UsePostReportingQueryData<TData extends unknown[]> = AxiosResponse<
    ReportingResponse<TData>
>

export const reportingKeys = {
    post: (data: ReportingParams) =>
        ['reporting', 'post-reporting', data] as const,
}

export const usePostReporting = <
    TData extends unknown[],
    SelectData = UsePostReportingQueryData<TData>
>(
    data: ReportingParams,
    overrides?: UseQueryOptions<
        UsePostReportingQueryData<TData>,
        unknown,
        SelectData
    >
) => {
    return useQuery({
        queryKey: reportingKeys.post(data),
        queryFn: () => postReporting<TData>(data),
        ...defaultOptions,
        ...overrides,
    })
}
