import { useParams } from 'react-router-dom'

import { useGetTicket } from '@gorgias/helpdesk-queries'

import { TicketTimelineWidgetContainer } from 'pages/common/components/infobar/Infobar/TicketTimelineWidget/TicketTimelineWidgetContainer'

export function CurrentTicketTimelineWidgetContainer() {
    const { ticketId: activeTicketId } = useParams<{ ticketId?: string }>()
    const ticketId = activeTicketId ? Number(activeTicketId) : undefined

    const { data: currentTicketData } = useGetTicket(ticketId ?? 0, undefined, {
        query: {
            enabled: ticketId !== undefined,
        },
    })
    const shopperId = currentTicketData?.data?.customer?.id
    return (
        <TicketTimelineWidgetContainer
            shopperId={shopperId}
            activeTicketId={activeTicketId}
        />
    )
}
