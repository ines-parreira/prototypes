import {useQuery, UseQueryOptions} from '@tanstack/react-query'
import {AxiosResponse} from 'axios'

import {getAnalytics} from './resources'
import {GetAnalyticsParams, GetAnalyticsResponse} from './types'

export const getAnalyticsQueryKey = (params: GetAnalyticsParams) => [
    'analytics',
    'get-analytics',
    params,
]

export const useGetAnalytics = <TData extends unknown[]>(
    params: GetAnalyticsParams,
    overrides?: UseQueryOptions<AxiosResponse<GetAnalyticsResponse<TData>>>
) => {
    return useQuery({
        queryKey: getAnalyticsQueryKey(params),
        queryFn: () => getAnalytics<TData>(params),
        ...overrides,
    })
}
