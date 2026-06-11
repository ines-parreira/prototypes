import { useEffect } from 'react'

import { FeatureFlagKey, useFlag } from '@repo/feature-flags'
import { useTicketMessageTranslationDisplay } from '@repo/tickets'
import { useParams } from 'react-router-dom'

import { DefaultExportTicketDetailContainer as TicketDetailContainer } from 'pages/tickets/detail/TicketDetailContainer'
import { OutboundTranslationProvider } from 'providers/OutboundTranslationProvider'
import type { OnToggleUnreadFn } from 'tickets/dtp'

import { useSplitTicketCloseNavigation } from './useSplitTicketCloseNavigation'

type Props = {
    isOnSplitTicketView?: boolean
    onToggleUnread?: OnToggleUnreadFn
}

export function TicketWrapper({ isOnSplitTicketView, onToggleUnread }: Props) {
    const { ticketId } = useParams<{ ticketId: string }>()
    const onGoToNextTicket = useSplitTicketCloseNavigation({
        isOnSplitTicketView,
    })
    const hasMessagesTranslation = useFlag(FeatureFlagKey.MessagesTranslations)
    const setAllTicketMessagesToTranslated = useTicketMessageTranslationDisplay(
        (state) => state.setAllTicketMessagesToTranslated,
    )

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
                onGoToNextTicket={onGoToNextTicket}
                onToggleUnread={onToggleUnread}
            />
        </OutboundTranslationProvider>
    )
}
