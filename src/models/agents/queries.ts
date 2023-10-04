import {UseQueryOptions, useQuery} from '@tanstack/react-query'

import {AxiosError} from 'axios'
import {FetchAgentsOptions} from './types'
import {fetchAgent, fetchAgents} from './resources'

export const agentsKeys = {
    all: () => ['agents'] as const,
    lists: () => [...agentsKeys.all(), 'list'] as const,
    list: (params?: FetchAgentsOptions) => [...agentsKeys.lists(), params],
    details: () => [...agentsKeys.all(), 'detail'] as const,
    detail: (id: number) => [...agentsKeys.details(), id] as const,
}

export const useListAgents = (
    params?: FetchAgentsOptions,
    overrides?: UseQueryOptions<Awaited<ReturnType<typeof fetchAgents>>>
) => {
    return useQuery({
        queryKey: agentsKeys.list(params),
        queryFn: () => fetchAgents(params),
        ...overrides,
    })
}

export const useGetAgent = <TData = Awaited<ReturnType<typeof fetchAgent>>>(
    id: number,
    overrides?: UseQueryOptions<
        Awaited<ReturnType<typeof fetchAgent>>,
        AxiosError,
        TData
    >
) => {
    return useQuery({
        queryKey: agentsKeys.detail(id),
        queryFn: () => fetchAgent(id),
        ...overrides,
    })
}
