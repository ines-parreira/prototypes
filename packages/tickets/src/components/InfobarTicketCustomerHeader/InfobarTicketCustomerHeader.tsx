import { Box } from '@gorgias/axiom'
import type { TicketCustomer } from '@gorgias/helpdesk-types'

import { SectionToggleButton } from '../SectionToggleButton'
import { InfobarTicketCustomerEditCustomerMenu } from './components/InfobarTicketCustomerEditCustomerMenu'
import { InfobarTicketCustomerHeaderContainer } from './components/InfobarTicketCustomerHeaderContainer'
import { InfobarTicketCustomerName } from './components/InfobarTicketCustomerName'
import { InfobarTicketCustomerSearchButton } from './components/InfobarTicketCustomerSearchButton'

export interface InfobarTicketCustomerHeaderProps {
    customer?: TicketCustomer
    onOpenMergePanel?: () => void
    onEditCustomer: (customer: TicketCustomer) => void
    onSyncToShopify: (customer: TicketCustomer) => void
    hasShopifyIntegration?: boolean
    isExpanded?: boolean
    onToggle?: () => void
}

export function InfobarTicketCustomerHeader({
    customer,
    onOpenMergePanel,
    onEditCustomer,
    onSyncToShopify,
    hasShopifyIntegration = false,
    isExpanded,
    onToggle,
}: InfobarTicketCustomerHeaderProps) {
    const showToggle = onToggle !== undefined && isExpanded !== undefined

    if (!customer) {
        return null
    }

    return (
        <InfobarTicketCustomerHeaderContainer
            onClick={showToggle ? onToggle : undefined}
        >
            <InfobarTicketCustomerName customer={customer} />
            <Box flexDirection="row" alignItems="center">
                <Box
                    flexDirection="row"
                    alignItems="center"
                    onClick={(e) => e.stopPropagation()}
                    role="presentation"
                >
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
                {showToggle && (
                    <SectionToggleButton
                        isExpanded={isExpanded}
                        onToggle={onToggle}
                        sectionLabel="Customer details"
                    />
                )}
            </Box>
        </InfobarTicketCustomerHeaderContainer>
    )
}
