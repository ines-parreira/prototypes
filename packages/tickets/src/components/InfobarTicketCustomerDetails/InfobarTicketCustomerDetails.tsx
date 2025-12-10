import type { TicketCustomer } from '@gorgias/helpdesk-types'

import { InfobarCustomerFields } from '../InfobarCustomerFields/InfobarCustomerFields'
import { InfobarTicketCustomerHeader } from '../InfobarTicketCustomerHeader/InfobarTicketCustomerHeader'

import css from './InfobarTicketCustomerDetails.less'

export interface InfobarTicketCustomerDetailsProps {
    onEditCustomer: (customer: TicketCustomer) => void
    onSyncToShopify: (customer: TicketCustomer) => void
    hasShopifyIntegration?: boolean
    showMergeButton?: boolean
    onMergeClick?: () => void
}

export function InfobarTicketCustomerDetails({
    onEditCustomer,
    onSyncToShopify,
    hasShopifyIntegration = false,
    showMergeButton = false,
    onMergeClick,
}: InfobarTicketCustomerDetailsProps) {
    return (
        <div className={css.container}>
            <InfobarTicketCustomerHeader
                onEditCustomer={onEditCustomer}
                onSyncToShopify={onSyncToShopify}
                hasShopifyIntegration={hasShopifyIntegration}
                showMergeButton={showMergeButton}
                onMergeClick={onMergeClick}
            />
            <InfobarCustomerFields />
        </div>
    )
}
