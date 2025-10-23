import { useCallback, useMemo } from 'react'

import { history } from '@repo/routing'
import { useParams } from 'react-router-dom'

import TicketDetailContainer from 'pages/tickets/detail/TicketDetailContainer'
import { OutboundTranslationProvider } from 'providers/OutboundTranslationProvider'
import { useSplitTicketView } from 'split-ticket-view-toggle'
import type { OnToggleUnreadFn } from 'tickets/dtp'
import { TicketMessageTranslationDisplayProvider } from 'tickets/ticket-detail/components/TicketMessagesTranslationDisplay/TicketMessageTranslationDisplayProvider'

type Props = {
    isOnSplitTicketView?: boolean
    onToggleUnread?: OnToggleUnreadFn
}

export default function TicketWrapper({
    isOnSplitTicketView,
    onToggleUnread,
}: Props) {
    const { viewId } = useParams<{ viewId: string }>()
    const { ticketId } = useParams<{ ticketId: string }>()
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
        <TicketMessageTranslationDisplayProvider>
            <OutboundTranslationProvider ticketId={ticketId}>
                <TicketDetailContainer
                    onGoToNextTicket={
                        isOnSplitTicketView ? handleGoToNextTicket : undefined
                    }
                    onToggleUnread={onToggleUnread}
                />
            </OutboundTranslationProvider>
        </TicketMessageTranslationDisplayProvider>
    )
}
