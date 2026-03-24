import { useMemo } from 'react'

import { useGetView } from '@gorgias/helpdesk-queries'

export function useIsTrashLikeView(viewId: number) {
    const { data: viewResponse } = useGetView(viewId)

    return useMemo(() => {
        const filters = viewResponse?.data?.filters ?? ''
        return filters.includes('isNotEmpty(ticket.trashed_datetime)')
    }, [viewResponse])
}
