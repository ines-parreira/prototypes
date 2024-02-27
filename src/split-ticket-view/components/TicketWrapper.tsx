import React, {useCallback, useMemo} from 'react'
import {useParams} from 'react-router-dom'

import history from 'pages/history'
import TicketDetailContainer from 'pages/tickets/detail/TicketDetailContainer'
import {useSplitTicketView} from 'split-ticket-view-toggle'

export default function TicketWrapper() {
    const {viewId} = useParams<{viewId: string}>()
    const {nextTicketId} = useSplitTicketView()

    const nextUrl = useMemo(
        () =>
            nextTicketId
                ? `/app/views/${viewId}/${nextTicketId}`
                : `/app/views/${viewId}`,
        [nextTicketId, viewId]
    )

    const handleCloseCallback = useCallback(() => {
        history.push(nextUrl)
    }, [nextUrl])

    return <TicketDetailContainer onCloseCallback={handleCloseCallback} />
}
