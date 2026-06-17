import { useMemo } from 'react'

import { useGetView } from '@gorgias/helpdesk-queries'

type Options = {
    isDraftView?: boolean
}

export function useIsTrashLikeView(
    viewId: number,
    { isDraftView = false }: Options = {},
) {
    const shouldFetchView = !isDraftView && viewId > 0

    const { data: viewResponse } = useGetView(viewId, {
        query: {
            enabled: shouldFetchView,
        },
    })

    return useMemo(() => {
        if (!shouldFetchView) {
            return false
        }

        const filters = viewResponse?.data?.filters ?? ''
        return filters.includes('isNotEmpty(ticket.trashed_datetime)')
    }, [shouldFetchView, viewResponse])
}
