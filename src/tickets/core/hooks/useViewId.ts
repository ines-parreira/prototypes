import { useMemo } from 'react'

import { useParams } from 'react-router-dom'

import useAppSelector from 'hooks/useAppSelector'
import { ViewType } from 'models/view/types'
import { getViewIdToDisplay } from 'state/views/selectors'

export default function useViewId() {
    const { viewId } = useParams<{ viewId?: string }>()
    const defaultViewId = useAppSelector((state) =>
        getViewIdToDisplay(state)(ViewType.TicketList),
    )

    return useMemo(
        () => (viewId ? parseInt(viewId, 10) : defaultViewId!),
        [defaultViewId, viewId],
    )
}
