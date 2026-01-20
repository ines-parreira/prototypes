import { useCallback, useState } from 'react'

import { Box, SidePanel } from '@gorgias/axiom'
import type { Customer, TicketCustomer } from '@gorgias/helpdesk-types'

import { InfobarCustomerFields } from '../InfobarCustomerFields/InfobarCustomerFields'
import { InfobarTicketCustomerHeader } from '../InfobarTicketCustomerHeader/InfobarTicketCustomerHeader'
import { useGetTicketData } from '../InfobarTicketDetails/components/InfobarTicketTags/hooks/useGetTicketData'
import { DuplicateCustomer } from './components/DuplicateCustomer/DuplicateCustomer'
import { CustomerPreview } from './components/SearchAndPreviewCustomersPanel/components/CustomerPreview'
import { SearchAndPreviewCustomersPanel } from './components/SearchAndPreviewCustomersPanel/SearchAndPreviewCustomersPanel'
import { useGetSimilarCustomer } from './hooks/useGetSimilarCustomer'
import { useUpdateTicketCustomer } from './hooks/useUpdateTicketCustomer'

import css from './InfobarTicketCustomerDetails.less'

export type InfobarTicketCustomerDetailsProps = {
    onEditCustomer: (customer: TicketCustomer) => void
    onSyncToShopify: (customer: TicketCustomer) => void
    hasShopifyIntegration?: boolean
    ticketId: string
}

export function InfobarTicketCustomerDetails({
    onEditCustomer,
    onSyncToShopify,
    hasShopifyIntegration = false,
    ticketId,
}: InfobarTicketCustomerDetailsProps) {
    const { data: ticket } = useGetTicketData(ticketId!)
    const ticketCustomer = ticket?.data?.customer

    const { updateTicketCustomer } = useUpdateTicketCustomer(ticketId!)

    const [isSearchAndPreviewPanelOpen, setIsSearchAndPreviewPanelOpen] =
        useState(false)

    const [isViewingSimilarCustomer, setIsViewingSimilarCustomer] =
        useState(false)

    const { data: similarCustomer, isLoading: isLoadingSimilarCustomer } =
        useGetSimilarCustomer(ticketCustomer?.id)

    const handleViewSimilarCustomer = useCallback(() => {
        if (similarCustomer?.id) {
            setIsViewingSimilarCustomer(true)
        }
    }, [similarCustomer])

    const handleSetCustomer = useCallback(
        (customer: Customer) => {
            void updateTicketCustomer(customer as TicketCustomer)
            setIsViewingSimilarCustomer(false)
        },
        [updateTicketCustomer],
    )

    return (
        <Box
            className={css.container}
            flexDirection="column"
            gap="xs"
            padding="md"
            paddingBottom="sm"
        >
            <InfobarTicketCustomerHeader
                customer={ticketCustomer}
                onOpenMergePanel={() => {
                    setIsSearchAndPreviewPanelOpen(true)
                }}
                onEditCustomer={onEditCustomer}
                onSyncToShopify={onSyncToShopify}
                hasShopifyIntegration={hasShopifyIntegration}
            />
            {!!similarCustomer && !isLoadingSimilarCustomer && (
                <DuplicateCustomer onClick={handleViewSimilarCustomer} />
            )}
            <InfobarCustomerFields
                customer={ticketCustomer}
                ticketId={ticketId}
            />
            <SearchAndPreviewCustomersPanel
                isOpen={isSearchAndPreviewPanelOpen}
                onClose={() => {
                    setIsSearchAndPreviewPanelOpen(false)
                }}
                previewedCustomer={similarCustomer}
                onSetCustomer={handleSetCustomer}
            />
            <SidePanel
                isOpen={isViewingSimilarCustomer}
                onOpenChange={(isOpen) => {
                    if (!isOpen) {
                        setIsViewingSimilarCustomer(false)
                    }
                }}
            >
                <CustomerPreview
                    customer={similarCustomer}
                    onGoBack={() => setIsViewingSimilarCustomer(false)}
                    onClose={() => setIsViewingSimilarCustomer(false)}
                    onSwitchCustomer={handleSetCustomer}
                />
            </SidePanel>
        </Box>
    )
}
