import { useCallback, useState } from 'react'

import { TicketInfobarTab, useTicketInfobarNavigation } from '@repo/navigation'
import { SearchAndPreviewCustomersPanel } from '@repo/tickets'

import type { TicketCustomer, TicketTag } from '@gorgias/helpdesk-queries'
import { useGetCurrentUser } from '@gorgias/helpdesk-queries'
import type { Customer } from '@gorgias/helpdesk-types'

import useAppSelector from 'hooks/useAppSelector'
import { IntegrationType } from 'models/integration/constants'
import { channelToCommunicationIcon } from 'pages/common/components/infobar/Infobar/TicketTimelineWidget/channelToCommunicationIcon'
import { useCustomerProfileActions } from 'pages/common/components/infobar/Infobar/useCustomerProfileActions'
import {
    InfobarLayoutContainer,
    InfobarLayoutContent,
} from 'pages/tickets/detail/layout/InfobarLayout'
import { makeHasIntegrationOfTypes } from 'state/integrations/selectors'
import { TimelineContent } from 'tickets/ticket-timeline'

import { NewTicketPageInfobarCustomerTab } from './NewTicketPageInfobarCustomerTab'
import { NewTicketPageInfobarShopifyTab } from './NewTicketPageInfobarShopifyTab'
import { useNewTicketPageShopifyCustomerData } from './useNewTicketPageShopifyCustomerData'

type NewTicketPageInfobarProps = {
    tags: TicketTag[]
    onTagsChange: (tags: TicketTag[]) => void
    onCustomerChange: (customer: TicketCustomer) => void
    customer: TicketCustomer | null
}

export function NewTicketPageInfobar({
    tags,
    onTagsChange,
    onCustomerChange,
    customer,
}: NewTicketPageInfobarProps) {
    const { activeTab } = useTicketInfobarNavigation()
    const [isSearchAndPreviewPanelOpen, setIsSearchAndPreviewPanelOpen] =
        useState(false)
    const hasIntegrationsOfTypes = useAppSelector(makeHasIntegrationOfTypes)
    const hasShopifyIntegration = hasIntegrationsOfTypes(
        IntegrationType.Shopify,
    )
    const { data: currentUser } = useGetCurrentUser({
        query: {
            select: (data) => data.data,
        },
    })
    const {
        handleEditCustomer,
        handleSyncToShopify,
        customerProfileActionModals,
    } = useCustomerProfileActions()
    const { associatedShopifyCustomerIds, externalIdMap } =
        useNewTicketPageShopifyCustomerData(customer)

    const handleSetCustomer = useCallback(
        (selectedCustomer: Customer) => {
            onCustomerChange(selectedCustomer as TicketCustomer)
        },
        [onCustomerChange],
    )

    const handleOpenSearchAndPreviewPanel = useCallback(() => {
        setIsSearchAndPreviewPanelOpen(true)
    }, [])

    const handleCloseSearchAndPreviewPanel = useCallback(() => {
        setIsSearchAndPreviewPanelOpen(false)
    }, [])

    return (
        <InfobarLayoutContainer>
            <InfobarLayoutContent>
                {activeTab === TicketInfobarTab.Customer && (
                    <NewTicketPageInfobarCustomerTab
                        tags={tags}
                        customer={customer}
                        hasShopifyIntegration={hasShopifyIntegration}
                        onTagsChange={onTagsChange}
                        onEditCustomer={handleEditCustomer}
                        onSyncToShopify={handleSyncToShopify}
                        onSearchCustomers={handleOpenSearchAndPreviewPanel}
                    />
                )}
                {activeTab === TicketInfobarTab.Timeline && (
                    <TimelineContent
                        shopperId={customer?.id}
                        channelToCommunicationIcon={channelToCommunicationIcon}
                    />
                )}
                {activeTab === TicketInfobarTab.Shopify &&
                    customer &&
                    hasShopifyIntegration && (
                        <NewTicketPageInfobarShopifyTab
                            customer={customer}
                            associatedShopifyCustomerIds={
                                associatedShopifyCustomerIds
                            }
                            externalIdMap={externalIdMap}
                            onSyncToShopify={handleSyncToShopify}
                            currentUser={currentUser}
                        />
                    )}
                {customerProfileActionModals}
                <SearchAndPreviewCustomersPanel
                    isOpen={isSearchAndPreviewPanelOpen}
                    onClose={handleCloseSearchAndPreviewPanel}
                    onSetCustomer={handleSetCustomer}
                    setCustomerLabel="Select customer"
                />
            </InfobarLayoutContent>
        </InfobarLayoutContainer>
    )
}
