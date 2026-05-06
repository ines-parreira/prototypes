import {
    InfobarCustomerFields,
    InfobarTicketCustomerDetailsContainer,
    InfobarTicketDetailsContainer,
    InfobarTicketDetailsHeaderContainer,
    NewTicketInfobarTicketCustomerHeader,
    TagsMultiSelect,
    TicketInfobarTicketDetailsTagsContainer,
} from '@repo/tickets'

import { Box, Heading } from '@gorgias/axiom'
import type { TicketCustomer, TicketTag } from '@gorgias/helpdesk-queries'

import { TicketTimelineWidgetContainer } from 'pages/common/components/infobar/Infobar/TicketTimelineWidget/TicketTimelineWidgetContainer'
import { NewTicketPageInfobarFields } from 'tickets/pages/NewTicketPage/components/NewTicketPageInfobar/NewTicketPageInfobarFields'

import { NewTicketPageInfobarEmptyCustomerState } from './NewTicketPageInfobarEmptyCustomerState'

type NewTicketPageInfobarCustomerTabProps = {
    tags: TicketTag[]
    customer: TicketCustomer | null
    hasShopifyIntegration: boolean
    onTagsChange: (tags: TicketTag[]) => void
    onEditCustomer: (customer: TicketCustomer) => void
    onSyncToShopify: (customer: TicketCustomer) => void
    onSearchCustomers: () => void
    onOpenMergePanel: () => void
}

export function NewTicketPageInfobarCustomerTab({
    tags,
    customer,
    hasShopifyIntegration,
    onTagsChange,
    onEditCustomer,
    onSyncToShopify,
    onSearchCustomers,
    onOpenMergePanel,
}: NewTicketPageInfobarCustomerTabProps) {
    return (
        <Box flex={1} flexDirection="column" minWidth="340px">
            <InfobarTicketDetailsContainer>
                <InfobarTicketDetailsHeaderContainer>
                    <Heading size="sm">Ticket details</Heading>
                </InfobarTicketDetailsHeaderContainer>
                <TicketInfobarTicketDetailsTagsContainer>
                    <TagsMultiSelect
                        value={tags}
                        onChange={onTagsChange}
                        aria-label="Ticket tags selection"
                    />
                </TicketInfobarTicketDetailsTagsContainer>
                <NewTicketPageInfobarFields />
            </InfobarTicketDetailsContainer>
            {customer ? (
                <>
                    <InfobarTicketCustomerDetailsContainer>
                        <NewTicketInfobarTicketCustomerHeader
                            customer={customer}
                            onEditCustomer={onEditCustomer}
                            onSyncToShopify={onSyncToShopify}
                            onOpenMergePanel={onOpenMergePanel}
                            hasShopifyIntegration={hasShopifyIntegration}
                        />
                        <InfobarCustomerFields customer={customer} />
                    </InfobarTicketCustomerDetailsContainer>
                    <TicketTimelineWidgetContainer shopperId={customer.id} />
                </>
            ) : (
                <NewTicketPageInfobarEmptyCustomerState
                    onSearchCustomers={onSearchCustomers}
                />
            )}
        </Box>
    )
}
