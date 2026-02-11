import { useCallback, useState } from 'react'

import { Box, SidePanel } from '@gorgias/axiom'
import type { Customer, TicketCustomer } from '@gorgias/helpdesk-types'

import { InfobarCustomerFields } from '../InfobarCustomerFields/InfobarCustomerFields'
import { InfobarTicketCustomerHeader } from '../InfobarTicketCustomerHeader/InfobarTicketCustomerHeader'
import { useGetTicketData } from '../InfobarTicketDetails/components/InfobarTicketTags/hooks/useGetTicketData'
import { MergeCustomersModal } from '../MergeCustomersModal/MergeCustomersModal'
import { DuplicateCustomer } from './components/DuplicateCustomer/DuplicateCustomer'
import { CustomerPreview } from './components/SearchAndPreviewCustomersPanel/components/CustomerPreview'
import { SearchAndPreviewCustomersPanel } from './components/SearchAndPreviewCustomersPanel/SearchAndPreviewCustomersPanel'
import { SwitchCustomerConfirmationModal } from './components/SwitchCustomerConfirmationModal/SwitchCustomerConfirmationModal'
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

    const [isSwitchModalOpen, setIsSwitchModalOpen] = useState(false)
    const [customerToSwitch, setCustomerToSwitch] = useState<Customer | null>(
        null,
    )

    const [isMergeModalOpen, setIsMergeModalOpen] = useState(false)
    const [customerToMerge, setCustomerToMerge] = useState<Customer | null>(
        null,
    )

    const { data: similarCustomer, isLoading: isLoadingSimilarCustomer } =
        useGetSimilarCustomer(ticketCustomer?.id)

    const handleViewSimilarCustomer = useCallback(() => {
        if (similarCustomer?.id) {
            setIsViewingSimilarCustomer(true)
        }
    }, [similarCustomer])

    const handleOpenSwitchModal = useCallback((customer: Customer) => {
        setCustomerToSwitch(customer)
        setIsSwitchModalOpen(true)
    }, [])

    const closeAllPanels = () => {
        setIsViewingSimilarCustomer(false)
        setIsSearchAndPreviewPanelOpen(false)
    }

    const handleConfirmSwitch = useCallback(
        (customer: Customer) => {
            void updateTicketCustomer(customer as TicketCustomer)
            closeAllPanels()
        },
        [updateTicketCustomer],
    )

    const handleOpenMergeModal = useCallback((customer: Customer) => {
        setCustomerToMerge(customer)
        setIsMergeModalOpen(true)
    }, [])

    return (
        <Box
            className={css.container}
            flexDirection="column"
            gap="xs"
            paddingTop="md"
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
                <div className={css.duplicateCustomer}>
                    <DuplicateCustomer onClick={handleViewSimilarCustomer} />
                </div>
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
                onSetCustomer={handleOpenSwitchModal}
                onMergeCustomer={handleOpenMergeModal}
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
                    onSetCustomer={handleOpenSwitchModal}
                    onMergeCustomer={handleOpenMergeModal}
                />
            </SidePanel>
            <SwitchCustomerConfirmationModal
                isOpen={isSwitchModalOpen}
                onOpenChange={setIsSwitchModalOpen}
                customer={customerToSwitch}
                onConfirm={handleConfirmSwitch}
            />
            {ticketCustomer && (
                <MergeCustomersModal
                    isOpen={isMergeModalOpen}
                    onOpenChange={setIsMergeModalOpen}
                    destinationCustomer={ticketCustomer as Customer}
                    sourceCustomer={customerToMerge}
                    ticketId={Number(ticketId)}
                    onMerge={closeAllPanels}
                />
            )}
        </Box>
    )
}
