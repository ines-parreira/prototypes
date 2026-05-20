// Migrated from: apps/helpdesk/src/custom-fields/hooks/queries/useCustomFieldDefinitions.ts
import { DurationInMs } from '@repo/utils'

import { useListCustomFields } from '@gorgias/helpdesk-queries'

export const STALE_TIME_MS = DurationInMs.OneDay

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
