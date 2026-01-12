import type { ReactNode } from 'react'

import { useParams } from 'react-router-dom'

import { InfobarTicketDetailsTags } from './components/InfobarTicketDetailsTags/InfobarTicketDetailsTags'
import { InfobarTicketDetailsHeader } from './components/InforbarTicketDetailsHeader'
import { TicketInfobarTicketFields } from './components/TicketInfobarTicketFields'

import css from './InfobarTicketDetails.less'

type InfobarTicketDetailsProps = {
    ticketSummaryIcon: ReactNode
}

export function InfobarTicketDetails({
    ticketSummaryIcon,
}: InfobarTicketDetailsProps) {
    const { ticketId } = useParams<{ ticketId: string }>()

    if (!ticketId || ticketId === 'new') {
        return null
    }

    return (
        <div className={css.container}>
            <InfobarTicketDetailsHeader ticketSummaryIcon={ticketSummaryIcon} />
            <InfobarTicketDetailsTags ticketId={ticketId} />
            <TicketInfobarTicketFields ticketId={ticketId} />
        </div>
    )
}
