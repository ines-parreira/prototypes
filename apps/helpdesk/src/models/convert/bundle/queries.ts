import type { UseQueryOptions } from '@tanstack/react-query'
import { useQuery } from '@tanstack/react-query'

import { useConvertApi } from 'pages/convert/common/hooks/useConvertApi'

import { CONVERT_DEFAULT_OPTIONS } from '../constants'
import { listBundles } from './resources'
import type { Bundle } from './types'

export const bundleKeys = {
    all: () => ['bundle'] as const,
    lists: () => [...bundleKeys.all(), 'list'] as const,
}

export const useListBundles = (
    overrides?: UseQueryOptions<
        Awaited<ReturnType<typeof listBundles>>,
        unknown,
        Bundle[]
    >,
) => {
    const { client: convertClient } = useConvertApi()

    return useQuery({
        queryKey: bundleKeys.lists(),
        queryFn: () => listBundles(convertClient),
        select: (data) => (data?.data ?? []) as Bundle[],
        ...CONVERT_DEFAULT_OPTIONS,
        ...overrides,
        enabled: !!convertClient && (overrides?.enabled ?? true),
    })
}
