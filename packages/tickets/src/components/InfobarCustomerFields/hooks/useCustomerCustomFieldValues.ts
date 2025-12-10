// Migrated from: apps/helpdesk/src/custom-fields/hooks/queries/useCustomerFieldValues.ts
import { useListCustomerCustomFieldsValues } from '@gorgias/helpdesk-queries'

const STALE_TIME_MS = 60 * 60 * 1000 // 1 hour

export const useCustomerCustomFieldValues = (
    ...args: Parameters<typeof useListCustomerCustomFieldsValues>
) => {
    return useListCustomerCustomFieldsValues(args[0], {
        ...args[1],
        query: {
            ...args[1]?.query,
            staleTime: STALE_TIME_MS,
            select: (data) => data.data,
            meta: {
                errorMessage: 'Failed to fetch custom field values',
            },
        },
    })
}
