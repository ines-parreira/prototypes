import type { TicketCustomer } from '@gorgias/helpdesk-types'

import { InfobarTicketCustomerEditCustomerMenu } from './components/InfobarTicketCustomerEditCustomerMenu'
import { InfobarTicketCustomerHeaderContainer } from './components/InfobarTicketCustomerHeaderContainer'
import { InfobarTicketCustomerName } from './components/InfobarTicketCustomerName'

export interface NewTicketInfobarTicketCustomerHeaderProps {
    customer: TicketCustomer
    onEditCustomer: (customer: TicketCustomer) => void
    onSyncToShopify: (customer: TicketCustomer) => void
    hasShopifyIntegration?: boolean
}

export function NewTicketInfobarTicketCustomerHeader({
    customer,
    onEditCustomer,
    onSyncToShopify,
    hasShopifyIntegration = false,
}: NewTicketInfobarTicketCustomerHeaderProps) {
    return (
        <InfobarTicketCustomerHeaderContainer>
            <InfobarTicketCustomerName customer={customer} />
            <InfobarTicketCustomerEditCustomerMenu
                customer={customer}
                onEditCustomer={onEditCustomer}
                onSyncToShopify={onSyncToShopify}
                hasShopifyIntegration={hasShopifyIntegration}
            />
        </InfobarTicketCustomerHeaderContainer>
    )
}
