import { Duration } from '@gorgias/toolkit'

import { useListTicketCustomFields } from '@gorgias/helpdesk-queries'

export const useTicketCustomFieldsValues = (
    ...args: Parameters<typeof useListTicketCustomFields>
) => {
    return useListTicketCustomFields(args[0], {
        ...args[1],
        query: {
            staleTime: Duration.hours(1),
            refetchOnWindowFocus: false,
            ...args[1]?.query,
            select: (data) => data.data,
            meta: {
                errorMessage: 'Failed to fetch ticket custom fields value',
            },
        },
    })
}
