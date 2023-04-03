import {useQuery, UseQueryOptions} from '@tanstack/react-query'
import {AxiosResponse} from 'axios'

import {getAnalytics} from './resources'
import {GetAnalyticsParams, GetAnalyticsResponse} from './types'

export const getAnalyticsQueryKey = (params: GetAnalyticsParams) => [
    'analytics',
    'get-analytics',
    params,
]

type UseGetAnalyticsQueryData<TData extends unknown[]> = AxiosResponse<
    GetAnalyticsResponse<TData>
>

export const useGetAnalytics = <
    TData extends unknown[],
    SelectData = UseGetAnalyticsQueryData<TData>
>(
    params: GetAnalyticsParams,
    overrides?: UseQueryOptions<
        UseGetAnalyticsQueryData<TData>,
        unknown,
        SelectData
    >
) => {
    return useQuery({
        queryKey: getAnalyticsQueryKey(params),
        queryFn: () => getAnalytics<TData>(params),
        ...overrides,
    })
}
