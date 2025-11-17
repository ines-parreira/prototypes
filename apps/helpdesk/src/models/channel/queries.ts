import type { UseQueryOptions } from '@tanstack/react-query'
import { useQuery } from '@tanstack/react-query'

import { listChannels } from './resources'

export const channelsQueryKeys = {
    all: () => ['channels'] as const,
    list: () => [...channelsQueryKeys.all(), 'list'] as const,
}

export const useListChannels = (
    overrides?: UseQueryOptions<Awaited<ReturnType<typeof listChannels>>>,
) => {
    return useQuery({
        queryFn: () => listChannels(),
        queryKey: channelsQueryKeys.list(),
        ...overrides,
    })
}
