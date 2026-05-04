import { Box } from '@gorgias/axiom'
import type { TicketCustomer } from '@gorgias/helpdesk-types'

import { InfobarTicketCustomerEditCustomerMenu } from './components/InfobarTicketCustomerEditCustomerMenu'
import { InfobarTicketCustomerHeaderContainer } from './components/InfobarTicketCustomerHeaderContainer'
import { InfobarTicketCustomerMergeButton } from './components/InfobarTicketCustomerMergeButton'
import { InfobarTicketCustomerName } from './components/InfobarTicketCustomerName'

export interface InfobarTicketCustomerHeaderProps {
    customer?: TicketCustomer
    onOpenMergePanel?: () => void
    onEditCustomer: (customer: TicketCustomer) => void
    onSyncToShopify: (customer: TicketCustomer) => void
    hasShopifyIntegration?: boolean
}

export function InfobarTicketCustomerHeader({
    customer,
    onOpenMergePanel,
    onEditCustomer,
    onSyncToShopify,
    hasShopifyIntegration = false,
}: InfobarTicketCustomerHeaderProps) {
    if (!customer) {
        return null
    }

    return (
        <InfobarTicketCustomerHeaderContainer>
            <InfobarTicketCustomerName customer={customer} />
            <Box>
                <InfobarTicketCustomerMergeButton
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
