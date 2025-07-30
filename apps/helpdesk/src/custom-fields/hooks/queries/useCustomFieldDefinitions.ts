import { UseQueryOptions } from '@tanstack/react-query'

import {
    useGetCustomFieldDefinitions,
    UseGetCustomFieldDefinitions,
} from 'custom-fields/hooks/queries/queries'
import { ListParams } from 'custom-fields/types'

export const STALE_TIME_MS = 60 * 60 * 1000 // 1 hour

export const useCustomFieldDefinitions = (
    params: ListParams,
    overrides: UseQueryOptions<
        UseGetCustomFieldDefinitions,
        unknown,
        UseGetCustomFieldDefinitions['data']
    > = {},
) => {
    return useGetCustomFieldDefinitions(params, {
        staleTime: STALE_TIME_MS,
        select: (data) => data.data,
        meta: {
            errorMessage: 'Failed to fetch custom fields',
        },
        ...overrides,
    })
}
