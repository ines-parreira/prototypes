import { DurationInMs } from '@repo/utils'

import { useListCustomFields } from '@gorgias/helpdesk-queries'

export const useCustomFieldDefinitions = (
    ...args: Parameters<typeof useListCustomFields>
) => {
    return useListCustomFields(args[0], {
        ...args[1],
        query: {
            staleTime: DurationInMs.OneHour,
            refetchOnWindowFocus: false,
            ...args[1]?.query,
            select: (data) => data.data,
            meta: {
                errorMessage: 'Failed to fetch custom fields',
            },
        },
    })
}
