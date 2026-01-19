import type { ReactNode } from 'react'

import { useParams } from 'react-router-dom'

import type { TicketCustomer } from '@gorgias/helpdesk-types'

import { InfobarTicketCustomerDetails } from '../InfobarTicketCustomerDetails/InfobarTicketCustomerDetails'
import { InfobarTicketDetailsTags } from './components/InfobarTicketDetailsTags/InfobarTicketDetailsTags'
import { InfobarTicketDetailsHeader } from './components/InforbarTicketDetailsHeader'
import { TicketInfobarTicketFields } from './components/TicketInfobarTicketFields'

import css from './InfobarTicketDetails.less'

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
            <div className={css.container}>
                <InfobarTicketDetailsHeader
                    ticketSummaryIcon={ticketSummaryIcon}
                />
                <InfobarTicketDetailsTags ticketId={ticketId} />
                <TicketInfobarTicketFields ticketId={ticketId} />
            </div>
            <InfobarTicketCustomerDetails
                onEditCustomer={onEditCustomer}
                onSyncToShopify={onSyncToShopify}
                hasShopifyIntegration={hasShopifyIntegration}
                ticketId={ticketId}
            />
        </>
    )
}
