import { useMutation, useQuery, UseQueryOptions } from '@tanstack/react-query'

import { CONVERT_DEFAULT_OPTIONS } from 'models/convert/constants'
import { useConvertApi } from 'pages/convert/common/hooks/useConvertApi'
import { MutationOverrides } from 'types/query'

import { createABTest, listABTests, updateABTest } from './resources'
import { ABTest, ABTestListOptions } from './types'

export const abTestKeys = {
    all: () => ['abTest'] as const,
    lists: () => [...abTestKeys.all(), 'list'] as const,
    list: (params: ABTestListOptions) =>
        [...abTestKeys.lists(), params] as const,
}

export const useListABTests = (
    params: ABTestListOptions,
    overrides?: UseQueryOptions<
        Awaited<ReturnType<typeof listABTests>>,
        unknown,
        ABTest[]
    >,
) => {
    const { client: convertClient } = useConvertApi()

    return useQuery({
        queryKey: abTestKeys.list(params),
        queryFn: () => listABTests(convertClient, params),
        select: (data) => (data?.data ?? []) as ABTest[],
        ...CONVERT_DEFAULT_OPTIONS,
        ...overrides,
        enabled: !!convertClient && (overrides?.enabled ?? true),
    })
}

export const useCreateABTest = (
    overrides?: MutationOverrides<typeof createABTest>,
) => {
    const { client: convertClient } = useConvertApi()

    return useMutation({
        mutationFn: ([client = convertClient, data]) =>
            createABTest(client, data),
        ...CONVERT_DEFAULT_OPTIONS,
        ...overrides,
    })
}

export const useUpdateABTest = (
    overrides?: MutationOverrides<typeof updateABTest>,
) => {
    const { client: convertClient } = useConvertApi()

    return useMutation({
        mutationFn: ([client = convertClient, pathParams, data]) =>
            updateABTest(client, pathParams, data),
        ...CONVERT_DEFAULT_OPTIONS,
        ...overrides,
    })
}
