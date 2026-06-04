import { Box } from '@gorgias/axiom'
import type { TicketCustomer } from '@gorgias/helpdesk-types'

import { InfobarTicketCustomerEditCustomerMenu } from './components/InfobarTicketCustomerEditCustomerMenu'
import { InfobarTicketCustomerHeaderContainer } from './components/InfobarTicketCustomerHeaderContainer'
import { InfobarTicketCustomerName } from './components/InfobarTicketCustomerName'
import { InfobarTicketCustomerSearchButton } from './components/InfobarTicketCustomerSearchButton'

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
            <Box flexDirection="row" alignItems="center">
                <InfobarTicketCustomerSearchButton
                    onOpenMergePanel={onOpenMergePanel}
                />
                <InfobarTicketCustomerEditCustomerMenu
                    customer={customer}
                    onEditCustomer={onEditCustomer}
                    onSyncToShopify={onSyncToShopify}
                    hasShopifyIntegration={hasShopifyIntegration}
                />
            </Box>
        </InfobarTicketCustomerHeaderContainer>
    )
}
