// Migrated from: apps/helpdesk/src/custom-fields/hooks/queries/useCustomFieldDefinitions.ts
import { useListCustomFields } from '@gorgias/helpdesk-queries'

export const STALE_TIME_MS = 60 * 60 * 1000 // 1 hour

export const useCustomFieldDefinitions = (
    ...args: Parameters<typeof useListCustomFields>
) => {
    return useListCustomFields(args[0], {
        ...args[1],
        query: {
            ...args[1]?.query,
            staleTime: STALE_TIME_MS,
            refetchOnWindowFocus: false,
            select: (data) => data.data,
            meta: {
                errorMessage: 'Failed to fetch custom fields',
            },
        },
    })
}
