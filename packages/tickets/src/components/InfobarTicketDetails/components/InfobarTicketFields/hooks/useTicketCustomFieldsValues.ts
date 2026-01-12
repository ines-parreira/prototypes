import { DurationInMs } from '@repo/utils'

import { useListTicketCustomFields } from '@gorgias/helpdesk-queries'

export const useTicketCustomFieldsValues = (
    ...args: Parameters<typeof useListTicketCustomFields>
) => {
    return useListTicketCustomFields(args[0], {
        ...args[1],
        query: {
            staleTime: DurationInMs.OneHour,
            refetchOnWindowFocus: false,
            ...args[1]?.query,
            select: (data) => data.data,
            meta: {
                errorMessage: 'Failed to fetch ticket custom fields value',
            },
        },
    })
}
