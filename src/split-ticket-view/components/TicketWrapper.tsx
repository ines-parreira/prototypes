import React, { useCallback, useMemo } from 'react'

import { useParams } from 'react-router-dom'

import history from 'pages/history'
import TicketDetailContainer from 'pages/tickets/detail/TicketDetailContainer'
import { useSplitTicketView } from 'split-ticket-view-toggle'
import type { OnToggleUnreadFn } from 'tickets/dtp'

type Props = {
    isOnSplitTicketView?: boolean
    onToggleUnread?: OnToggleUnreadFn
}

export default function TicketWrapper({
    isOnSplitTicketView,
    onToggleUnread,
}: Props) {
    const { viewId } = useParams<{ viewId: string }>()
    const { nextTicketId } = useSplitTicketView()

    const nextUrl = useMemo(
        () =>
            nextTicketId
                ? `/app/views/${viewId}/${nextTicketId}`
                : `/app/views/${viewId}`,
        [nextTicketId, viewId],
    )

    const handleGoToNextTicket = useCallback(() => {
        history.push(nextUrl)
    }, [nextUrl])

    return (
        <TicketDetailContainer
            onGoToNextTicket={
                isOnSplitTicketView ? handleGoToNextTicket : undefined
            }
            onToggleUnread={onToggleUnread}
        />
    )
}
