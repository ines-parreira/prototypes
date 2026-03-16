import { Panel } from '@repo/layout'
import { TicketInfobarNavigation } from '@repo/tickets'
import { useParams } from 'react-router-dom'

import { useGetTicket } from '@gorgias/helpdesk-queries'

import useHasAIAgent from 'pages/tickets/detail/components/TicketFeedback/hooks/useHasAIAgent'
import useHasRecharge from 'pages/tickets/detail/hooks/useHasRecharge'

const panelConfig = {
    defaultSize: 49,
    minSize: 49,
    maxSize: 49,
}

export function InfobarNavigationPanel() {
    const hasAIAgent = useHasAIAgent()
    const { ticketId: activeTicketId } = useParams<{ ticketId?: string }>()
    const ticketId = activeTicketId ? Number(activeTicketId) : undefined

    const { data: currentTicketData } = useGetTicket(ticketId!, undefined, {
        query: {
            enabled: ticketId !== undefined,
        },
    })

    const shopperId = currentTicketData?.data?.customer?.id

    const hasRecharge = useHasRecharge()

    return (
        <Panel name="infobar-navigation" config={panelConfig}>
            <TicketInfobarNavigation
                hasAIFeedback={hasAIAgent}
                hasRecharge={hasRecharge}
                hasTimeline={!!shopperId}
            />
        </Panel>
    )
}
