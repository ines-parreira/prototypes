import { useListCustomerCustomFieldsValues } from '@gorgias/helpdesk-queries'

export const STALE_TIME_MS = 60 * 60 * 1000 // 1 hour

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
