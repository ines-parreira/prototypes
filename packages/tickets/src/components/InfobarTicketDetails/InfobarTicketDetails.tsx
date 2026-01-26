import type { ReactNode } from 'react'

import { useParams } from 'react-router-dom'

import { Box } from '@gorgias/axiom'
import type { TicketCustomer } from '@gorgias/helpdesk-types'

import { InfobarTicketCustomerDetails } from '../InfobarTicketCustomerDetails/InfobarTicketCustomerDetails'
import { TicketInfobarTicketDetailsTags } from './components/InfobarTicketTags'
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
            <Box
                className={css.container}
                flexDirection="column"
                gap="xs"
                padding="md"
                paddingBottom="sm"
            >
                <InfobarTicketDetailsHeader
                    ticketSummaryIcon={ticketSummaryIcon}
                />
                <TicketInfobarTicketDetailsTags ticketId={ticketId} />
                <TicketInfobarTicketFields ticketId={ticketId} />
            </Box>
            <InfobarTicketCustomerDetails
                onEditCustomer={onEditCustomer}
                onSyncToShopify={onSyncToShopify}
                hasShopifyIntegration={hasShopifyIntegration}
                ticketId={ticketId}
            />
        </>
    )
}
