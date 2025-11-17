import type { UseQueryOptions } from '@tanstack/react-query'
import { useQuery } from '@tanstack/react-query'

import { listApplications } from './resources'

export const applicationsQueryKeys = {
    all: () => ['applications'] as const,
    list: () => [...applicationsQueryKeys.all(), 'list'] as const,
}

export const useListApplications = (
    overrides?: UseQueryOptions<Awaited<ReturnType<typeof listApplications>>>,
) => {
    return useQuery({
        queryFn: () => listApplications(),
        queryKey: applicationsQueryKeys.list(),
        ...overrides,
    })
}
