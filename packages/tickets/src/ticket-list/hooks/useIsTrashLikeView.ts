import { useMemo } from 'react'

import { useGetView } from '@gorgias/helpdesk-queries'

type Options = {
    isDraftView?: boolean
}

export function useIsTrashLikeView(
    viewId: number,
    { isDraftView = false }: Options = {},
) {
    const { data: viewResponse } = useGetView(viewId, {
        query: {
            enabled: !isDraftView,
        },
    })

    return useMemo(() => {
        const filters = viewResponse?.data?.filters ?? ''
        return filters.includes('isNotEmpty(ticket.trashed_datetime)')
    }, [viewResponse])
}
