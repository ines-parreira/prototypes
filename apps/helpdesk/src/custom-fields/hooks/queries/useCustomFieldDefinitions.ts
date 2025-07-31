import { useListCustomFields } from '@gorgias/helpdesk-queries'

export const STALE_TIME_MS = 60 * 60 * 1000 // 1 hour

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
