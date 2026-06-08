import { useGetCustomField } from '@gorgias/helpdesk-queries'
import { Duration } from '@gorgias/toolkit'

export const STALE_TIME_MS = Duration.hours(1)

export const useCustomFieldDefinition = (
    ...args: Parameters<typeof useGetCustomField>
) => {
    return useGetCustomField(args[0], {
        ...args[1],
        query: {
            staleTime: STALE_TIME_MS,
            refetchOnWindowFocus: false,
            ...args[1]?.query,
            meta: {
                errorMessage: 'Failed to fetch custom field',
            },
            select: (data) => data.data,
        },
    })
}
