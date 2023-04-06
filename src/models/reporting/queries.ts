import {useQuery, UseQueryOptions} from '@tanstack/react-query'
import {AxiosResponse} from 'axios'

import {getReporting} from './resources'
import {GetReportingParams, GetReportingResponse} from './types'

export const getReportingQueryKey = (params: GetReportingParams) => [
    'reporting',
    'get-reporting',
    params,
]

type UseGetReportingQueryData<TData extends unknown[]> = AxiosResponse<
    GetReportingResponse<TData>
>

export const useGetReporting = <
    TData extends unknown[],
    SelectData = UseGetReportingQueryData<TData>
>(
    params: GetReportingParams,
    overrides?: UseQueryOptions<
        UseGetReportingQueryData<TData>,
        unknown,
        SelectData
    >
) => {
    return useQuery({
        queryKey: getReportingQueryKey(params),
        queryFn: () => getReporting<TData>(params),
        ...overrides,
    })
}
