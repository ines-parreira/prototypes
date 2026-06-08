import { Duration } from '@gorgias/toolkit'

import { useListCustomFields } from '@gorgias/helpdesk-queries'

export const useCustomFieldDefinitions = (
    ...args: Parameters<typeof useListCustomFields>
) => {
    return useListCustomFields(args[0], {
        ...args[1],
        query: {
            staleTime: Duration.days(1),
            refetchOnWindowFocus: false,
            ...args[1]?.query,
            select: (data) => data.data,
            meta: {
                errorMessage: 'Failed to fetch custom fields',
            },
        },
    })
}
