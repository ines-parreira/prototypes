import { useCallback, useEffect, useMemo } from 'react'

import { FeatureFlagKey, useFlag } from '@repo/feature-flags'
import { history } from '@repo/routing'
import { useTicketMessageTranslationDisplay } from '@repo/tickets'
import { useParams } from 'react-router-dom'

import TicketDetailContainer from 'pages/tickets/detail/TicketDetailContainer'
import { OutboundTranslationProvider } from 'providers/OutboundTranslationProvider'
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
    const { ticketId } = useParams<{ ticketId: string }>()
    const { nextTicketId } = useSplitTicketView()
    const hasMessagesTranslation = useFlag(FeatureFlagKey.MessagesTranslations)
    const setAllTicketMessagesToTranslated = useTicketMessageTranslationDisplay(
        (state) => state.setAllTicketMessagesToTranslated,
    )

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

    /**
     * Default the ticket messages display state to translated when the ticketId changes
     * to ensure that users always see the translated content when they navigate to a new ticket.
     */
    useEffect(() => {
        if (!hasMessagesTranslation) return
        setAllTicketMessagesToTranslated()
    }, [ticketId, hasMessagesTranslation, setAllTicketMessagesToTranslated])

    return (
        <OutboundTranslationProvider ticketId={ticketId}>
            <TicketDetailContainer
                onGoToNextTicket={
                    isOnSplitTicketView ? handleGoToNextTicket : undefined
                }
                onToggleUnread={onToggleUnread}
            />
        </OutboundTranslationProvider>
    )
}
