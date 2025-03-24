import { useGetCustomFieldDefinition } from 'custom-fields/hooks/queries/queries'
import { CustomField } from 'custom-fields/types'

export const STALE_TIME_MS = 60 * 60 * 1000 // 1 hour

export const useCustomFieldDefinition = (
    id: number,
    overrides?: Parameters<typeof useGetCustomFieldDefinition>[1],
) => {
    return useGetCustomFieldDefinition<CustomField>(id, {
        ...overrides,
        staleTime: STALE_TIME_MS,
        select: (data) => data.data,
        refetchOnWindowFocus: false,
        meta: {
            errorMessage: 'Failed to fetch custom field',
        },
    })
}
