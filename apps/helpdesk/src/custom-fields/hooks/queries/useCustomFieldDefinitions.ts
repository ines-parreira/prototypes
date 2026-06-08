import { useListCustomFields } from '@gorgias/helpdesk-queries'
import { Duration } from '@gorgias/toolkit'

export const STALE_TIME_MS = Duration.hours(1)

export const useCustomFieldDefinitions = (
    ...args: Parameters<typeof useListCustomFields>
) => {
    return useListCustomFields(args[0], {
        ...args[1],
        query: {
            staleTime: STALE_TIME_MS,
            refetchOnWindowFocus: false,
            ...args[1]?.query,
            select: (data) => data.data,
            meta: {
                errorMessage: 'Failed to fetch custom fields',
            },
        },
    })
}
