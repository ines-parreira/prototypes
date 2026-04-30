import type { ReactNode } from 'react'

import { Heading } from '@gorgias/axiom'

import { InfobarTicketDetailsHeaderContainer } from './InfobarTicketDetailsHeaderContainer'

type InfobarTicketDetailsHeaderProps = {
    ticketSummaryIcon: ReactNode
}

export function InfobarTicketDetailsHeader({
    ticketSummaryIcon,
}: InfobarTicketDetailsHeaderProps) {
    return (
        <InfobarTicketDetailsHeaderContainer>
            <Heading size="sm">Ticket details</Heading>
            {ticketSummaryIcon}
        </InfobarTicketDetailsHeaderContainer>
    )
}
