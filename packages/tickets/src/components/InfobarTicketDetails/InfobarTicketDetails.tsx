import type { ReactNode } from 'react'

import { useParams } from 'react-router-dom'

import type { TicketCustomer } from '@gorgias/helpdesk-types'

import { InfobarTicketCustomerDetails } from '../InfobarTicketCustomerDetails/InfobarTicketCustomerDetails'
import { InfobarTicketDetailsContainer } from './components/InfobarTicketDetailsContainer'
import { TicketInfobarTicketDetailsTags } from './components/InfobarTicketTags'
import { InfobarTicketDetailsHeader } from './components/InforbarTicketDetailsHeader'
import { TicketInfobarTicketFields } from './components/TicketInfobarTicketFields'

type InfobarTicketDetailsProps = {
    ticketSummaryIcon: ReactNode
    onEditCustomer: (customer: TicketCustomer) => void
    onSyncToShopify: (customer: TicketCustomer) => void
    hasShopifyIntegration?: boolean
}

export function InfobarTicketDetails({
    ticketSummaryIcon,
    onEditCustomer,
    onSyncToShopify,
    hasShopifyIntegration,
}: InfobarTicketDetailsProps) {
    const { ticketId } = useParams<{ ticketId: string }>()

    if (!ticketId || ticketId === 'new') {
        return null
    }

    return (
        <>
            <InfobarTicketDetailsContainer>
                <InfobarTicketDetailsHeader
                    ticketSummaryIcon={ticketSummaryIcon}
                />
                <TicketInfobarTicketDetailsTags ticketId={ticketId} />
                <TicketInfobarTicketFields ticketId={ticketId} />
            </InfobarTicketDetailsContainer>
            <InfobarTicketCustomerDetails
                onEditCustomer={onEditCustomer}
                onSyncToShopify={onSyncToShopify}
                hasShopifyIntegration={hasShopifyIntegration}
                ticketId={ticketId}
            />
        </>
    )
}
