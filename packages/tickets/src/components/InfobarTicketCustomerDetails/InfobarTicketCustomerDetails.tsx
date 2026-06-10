import { useCallback, useState } from 'react'

import { useGetCustomer } from '@repo/customer/hooks'
import { FeatureFlagKey, useFlag } from '@repo/feature-flags'

import { SidePanel } from '@gorgias/axiom'
import type { Customer, TicketCustomer } from '@gorgias/helpdesk-types'

import { InfobarCustomerFields } from '../InfobarCustomerFields/InfobarCustomerFields'
import { InfobarTicketCustomerHeader } from '../InfobarTicketCustomerHeader/InfobarTicketCustomerHeader'
import { useGetTicketData } from '../InfobarTicketDetails/components/InfobarTicketTags/hooks/useGetTicketData'
import { MergeCustomersModal } from '../MergeCustomersModal/MergeCustomersModal'
import { DuplicateCustomer } from './components/DuplicateCustomer/DuplicateCustomer'
import { InfobarTicketCustomerDetailsContainer } from './components/InfobarTicketCustomerDetailsContainer'
import { CustomerPreview } from './components/SearchAndPreviewCustomersPanel/components/CustomerPreview'
import { SearchAndPreviewCustomersPanel } from './components/SearchAndPreviewCustomersPanel/SearchAndPreviewCustomersPanel'
import { SwitchCustomerConfirmationModal } from './components/SwitchCustomerConfirmationModal/SwitchCustomerConfirmationModal'
import { useGetSimilarCustomer } from './hooks/useGetSimilarCustomer'
import { useUpdateTicketCustomer } from './hooks/useUpdateTicketCustomer'
import { InfobarCustomerFieldsSkeleton } from './skeletons/InfobarCustomerFieldsSkeleton'
import { InfobarTicketCustomerHeaderSkeleton } from './skeletons/InfobarTicketCustomerHeaderSkeleton'

import css from './InfobarTicketCustomerDetails.less'

export type InfobarTicketCustomerDetailsProps = {
    onEditCustomer: (customer: TicketCustomer) => void
    onSyncToShopify: (customer: TicketCustomer) => void
    onSwitchCustomer?: (customer: TicketCustomer) => void
    hasShopifyIntegration?: boolean
    ticketId: string
}

export function InfobarTicketCustomerDetails({
    onEditCustomer,
    onSyncToShopify,
    onSwitchCustomer,
    hasShopifyIntegration = false,
    ticketId,
}: InfobarTicketCustomerDetailsProps) {
    const { data: ticket, isLoading: isLoadingTicket } = useGetTicketData(
        ticketId!,
    )
    const ticketCustomer = ticket?.data?.customer
    const ticketCustomerId = ticketCustomer?.id
    const { data: fullCustomerResponse } = useGetCustomer(
        ticketCustomerId ?? 0,
        undefined,
        {
            query: {
                enabled: !!ticketCustomerId,
                refetchOnWindowFocus: false,
            },
        },
    )
    const customer = (fullCustomerResponse?.data ?? ticketCustomer) as
        | TicketCustomer
        | undefined
    const isLoadingDetails = !ticketCustomer && isLoadingTicket

    const { updateTicketCustomer } = useUpdateTicketCustomer(ticketId!)

    const hasNewOrdersSidebar = useFlag(FeatureFlagKey.NewOrdersSidebar)
    const showToggle = hasNewOrdersSidebar

    const [isExpanded, setIsExpanded] = useState(true)
    const toggle = useCallback(() => setIsExpanded((v) => !v), [])

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
        useGetSimilarCustomer(ticketCustomerId)

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
        async (customer: Customer) => {
            const didUpdate = await updateTicketCustomer(
                customer as TicketCustomer,
            )
            if (!didUpdate) {
                return
            }
            onSwitchCustomer?.(customer as TicketCustomer)
            closeAllPanels()
        },
        [onSwitchCustomer, updateTicketCustomer],
    )

    const handleOpenMergeModal = useCallback((customer: Customer) => {
        setCustomerToMerge(customer)
        setIsMergeModalOpen(true)
    }, [])

    return (
        <InfobarTicketCustomerDetailsContainer>
            {isLoadingDetails ? (
                <>
                    <InfobarTicketCustomerHeaderSkeleton />
                    <InfobarCustomerFieldsSkeleton />
                </>
            ) : (
                <>
                    <InfobarTicketCustomerHeader
                        customer={customer}
                        onOpenMergePanel={() => {
                            setIsSearchAndPreviewPanelOpen(true)
                        }}
                        onEditCustomer={onEditCustomer}
                        onSyncToShopify={onSyncToShopify}
                        hasShopifyIntegration={hasShopifyIntegration}
                        isExpanded={showToggle ? isExpanded : undefined}
                        onToggle={showToggle ? toggle : undefined}
                    />
                    {(!showToggle || isExpanded) && (
                        <>
                            {!!similarCustomer && !isLoadingSimilarCustomer && (
                                <div className={css.duplicateCustomer}>
                                    <DuplicateCustomer
                                        onClick={handleViewSimilarCustomer}
                                    />
                                </div>
                            )}
                            <InfobarCustomerFields
                                customer={customer}
                                ticketId={ticketId}
                            />
                        </>
                    )}
                </>
            )}
            <SearchAndPreviewCustomersPanel
                isOpen={isSearchAndPreviewPanelOpen}
                onClose={() => {
                    setIsSearchAndPreviewPanelOpen(false)
                }}
                previewedCustomer={similarCustomer}
                currentCustomerId={customer?.id}
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
            {customer && (
                <MergeCustomersModal
                    isOpen={isMergeModalOpen}
                    onOpenChange={setIsMergeModalOpen}
                    destinationCustomer={customer as Customer}
                    sourceCustomer={customerToMerge}
                    ticketId={Number(ticketId)}
                    onMerge={closeAllPanels}
                />
            )}
        </InfobarTicketCustomerDetailsContainer>
    )
}
