import type { TicketCustomer } from '@gorgias/helpdesk-types'

import { InfobarTicketCustomerEditCustomerMenu } from './components/InfobarTicketCustomerEditCustomerMenu'
import { InfobarTicketCustomerHeaderContainer } from './components/InfobarTicketCustomerHeaderContainer'
import { InfobarTicketCustomerName } from './components/InfobarTicketCustomerName'

export interface NewTicketInfobarTicketCustomerHeaderProps {
    customer: TicketCustomer
    onEditCustomer: (customer: TicketCustomer) => void
    onSyncToShopify: (customer: TicketCustomer) => void
    onOpenMergePanel?: () => void
    hasShopifyIntegration?: boolean
}

export function NewTicketInfobarTicketCustomerHeader({
    customer,
    onEditCustomer,
    onSyncToShopify,
    onOpenMergePanel,
    hasShopifyIntegration = false,
}: NewTicketInfobarTicketCustomerHeaderProps) {
    return (
        <InfobarTicketCustomerHeaderContainer>
            <InfobarTicketCustomerName customer={customer} />
            <InfobarTicketCustomerEditCustomerMenu
                customer={customer}
                onEditCustomer={onEditCustomer}
                onSyncToShopify={onSyncToShopify}
                onOpenMergePanel={onOpenMergePanel}
                hasShopifyIntegration={hasShopifyIntegration}
                mergeMenuItemLabel="Switch customer"
            />
        </InfobarTicketCustomerHeaderContainer>
    )
}
