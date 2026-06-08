import { Duration } from '@gorgias/toolkit'
// Migrated from: apps/helpdesk/src/custom-fields/hooks/queries/useCustomerFieldValues.ts
import { useListCustomerCustomFieldsValues } from '@gorgias/helpdesk-queries'

export const useCustomerCustomFieldValues = (
    ...args: Parameters<typeof useListCustomerCustomFieldsValues>
) => {
    return useListCustomerCustomFieldsValues(args[0], {
        ...args[1],
        query: {
            ...args[1]?.query,
            staleTime: Duration.hours(1),
            select: (data) => data.data,
            meta: {
                errorMessage: 'Failed to fetch custom field values',
            },
        },
    })
}
