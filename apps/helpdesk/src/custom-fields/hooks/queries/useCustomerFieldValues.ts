import { useListCustomerCustomFieldsValues } from '@gorgias/helpdesk-queries'
import { Duration } from '@gorgias/toolkit'

export const STALE_TIME_MS = Duration.hours(1)

export const useCustomerFieldValues = (
    ...args: Parameters<typeof useListCustomerCustomFieldsValues>
) => {
    return useListCustomerCustomFieldsValues(args[0], {
        ...args[1],
        query: {
            staleTime: STALE_TIME_MS,
            ...args[1]?.query,
            select: (data) => data.data,
            meta: {
                errorMessage: 'Failed to fetch custom field values',
            },
        },
    })
}
