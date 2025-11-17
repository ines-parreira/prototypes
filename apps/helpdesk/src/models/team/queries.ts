import type { UseQueryOptions } from '@tanstack/react-query'
import { useQuery } from '@tanstack/react-query'

import { fetchTeams } from './resources'
import type { FetchTeamsOptions } from './types'

const teamQueryKeys = {
    all: () => ['teams'] as const,
    lists: () => [...teamQueryKeys.all(), 'list'] as const,
    list: (params?: FetchTeamsOptions) => [...teamQueryKeys.lists(), params],
}

export const useListTeams = (
    params?: FetchTeamsOptions,
    overrides?: UseQueryOptions<Awaited<ReturnType<typeof fetchTeams>>>,
) => {
    return useQuery({
        queryKey: teamQueryKeys.list(params),
        queryFn: () => fetchTeams(params),
        ...overrides,
    })
}
