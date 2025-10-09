import type { ReactNode } from 'react'

import { useParams } from 'react-router-dom'

import { InfobarTicketDetailsTags } from './components/InfobarTicketDetailsTags/InfobarTicketDetailsTags'
import { InfobarTicketDetailsHeader } from './components/InforbarTicketDetailsHeader'

import css from './InfobarTicketDetails.less'

type Props = {
    ticketSummaryIcon: ReactNode
}

export function InfobarTicketDetails({ ticketSummaryIcon }: Props) {
    const { ticketId } = useParams<{ ticketId: string }>()

    if (!ticketId) {
        return null
    }

    return (
        <div className={css.container}>
            <InfobarTicketDetailsHeader ticketSummaryIcon={ticketSummaryIcon} />
            <InfobarTicketDetailsTags ticketId={ticketId} />
        </div>
    )
}
