import type { ReactNode } from 'react'

import type { OrderCardProduct } from '@repo/ecommerce/shopify/types'
import { EditFieldsType, useTicketInfobarNavigation } from '@repo/navigation'

import { Box } from '@gorgias/axiom'

import type { OrderEcommerceData } from '../../types'
import { CustomerDetailsPanel } from './CustomerDetailsPanel'
import { IntermediateEditPanel } from './editPanels/IntermediateEditPanel'
import { NoShopifyProfile } from './NoShopifyProfile'
import { OrdersList } from './orders/OrdersList'
import type { EditShippingAddressModalRenderProps } from './orders/sidePanel/OrderSidePanelPreview'
import { useOrderNavigation } from './orders/useOrderNavigation'
import { useCustomerInfoData } from './useCustomerInfoData'
import { useCustomerFieldPreferences } from './widget/useCustomerFieldPreferences'
import { useOrderFieldPreferences } from './widget/useOrderFieldPreferences'

export type OrderSidePanelRenderProps = {
    order: OrderEcommerceData['data'] | null
    isOpen: boolean
    onOpenChange: (isOpen: boolean) => void
    productsMap?: Map<number, OrderCardProduct>
    isDraftOrder?: boolean
    storeName?: string
    integrationId?: number
    ticketId?: string
    customerId?: string
    renderEditShippingAddressModal?: (
        props: EditShippingAddressModalRenderProps,
    ) => ReactNode
    hasPrevious?: boolean
    hasNext?: boolean
    onNavigatePrevious?: () => void
    onNavigateNext?: () => void
}

type Props = {
    associatedShopifyCustomerIds: Set<number>
    externalIdMap: Map<number, string>
    isLoadingTicket?: boolean
    onStoreChange?: (integrationId: number) => void
    onSyncProfile?: () => void
    ticketId?: string
    customerId?: number
    renderEditShippingAddressModal?: (
        props: EditShippingAddressModalRenderProps,
    ) => ReactNode
    currentUser?: {
        name?: string
        firstname?: string
        lastname?: string
        email?: string
    }
    renderOrderSidePanel: (props: OrderSidePanelRenderProps) => ReactNode
}

export function CustomerInfo({
    associatedShopifyCustomerIds,
    externalIdMap,
    isLoadingTicket,
    onStoreChange,
    onSyncProfile,
    ticketId,
    customerId,
    renderEditShippingAddressModal,
    currentUser,
    renderOrderSidePanel,
}: Props) {
    const {
        filteredIntegrations,
        selectedIntegration,
        selectedExternalId,
        handleStoreChange,
        isLoadingIntegrations,
        onCreateOrder,
        shopper,
        orders,
        isLoadingOrders,
        draftOrders,
        isLoadingDraftOrders,
        productsMap,
        enrichedCustomer,
        context,
        hasData,
        ticketData,
        dateFormat,
        timeFormat,
    } = useCustomerInfoData({
        associatedShopifyCustomerIds,
        externalIdMap,
        onStoreChange,
        ticketId,
        customerId,
    })

    const { customerFields, sections, preferences, savePreferences } =
        useCustomerFieldPreferences()

    const {
        preferences: orderPreferences,
        savePreferences: saveOrderPreferences,
    } = useOrderFieldPreferences()

    const { editingWidgetType, onSetEditingWidgetType } =
        useTicketInfobarNavigation()

    const {
        allOrders,
        selectedOrderIndex,
        setSelectedOrderIndex,
        selectedOrder,
        isDraftOrder,
        ordersListIndex,
        handleSelectOrder,
        handleNavigatePrevious,
        handleNavigateNext,
        handleCreateOrder,
        hasPrevious,
        hasNext,
        orderContext,
    } = useOrderNavigation({
        orders,
        draftOrders,
        selectedIntegrationId: selectedIntegration?.id,
        selectedIntegrationName: selectedIntegration?.name,
        shopper,
        onCreateOrder,
        ticketId,
        dateFormat,
        timeFormat,
    })

    if (editingWidgetType === EditFieldsType.Shopify) {
        return (
            <IntermediateEditPanel
                customerFields={customerFields}
                context={context}
                preferences={preferences}
                onSavePreferences={savePreferences}
                orderPreferences={orderPreferences}
                onSaveOrderPreferences={saveOrderPreferences}
                orderContext={orderContext}
                onClose={() => onSetEditingWidgetType(null)}
            />
        )
    }

    if (
        filteredIntegrations.length === 0 &&
        !isLoadingIntegrations &&
        !isLoadingTicket
    ) {
        return (
            <Box flexDirection="column" gap="sm" padding="sm">
                <NoShopifyProfile onSyncProfile={onSyncProfile ?? (() => {})} />
            </Box>
        )
    }

    return (
        <>
            <CustomerDetailsPanel
                filteredIntegrations={filteredIntegrations}
                selectedIntegration={selectedIntegration}
                isLoadingIntegrations={isLoadingIntegrations}
                isLoadingTicket={isLoadingTicket}
                onStoreChange={handleStoreChange}
                onSyncProfile={onSyncProfile}
                ticketData={ticketData}
                enrichedCustomer={enrichedCustomer}
                currentUser={currentUser}
                hasData={hasData}
                customerFields={customerFields}
                context={context}
                sections={sections}
                ordersListIndex={ordersListIndex}
                customerId={customerId}
                ticketId={ticketId}
                shopper={shopper}
            >
                <OrdersList
                    orders={orders}
                    isLoadingOrders={isLoadingOrders}
                    productsMap={productsMap}
                    draftOrders={draftOrders}
                    isLoadingDraftOrders={isLoadingDraftOrders}
                    onSelectOrder={handleSelectOrder}
                    onCreateOrder={handleCreateOrder}
                />
            </CustomerDetailsPanel>

            {renderOrderSidePanel({
                order: selectedOrder?.data ?? null,
                isOpen: selectedOrderIndex !== null,
                onOpenChange: (open) => {
                    if (!open) setSelectedOrderIndex(null)
                },
                productsMap,
                isDraftOrder,
                storeName: selectedIntegration?.name,
                integrationId: selectedIntegration?.id,
                ticketId,
                customerId: selectedExternalId,
                renderEditShippingAddressModal,
                hasPrevious,
                hasNext,
                onNavigatePrevious:
                    allOrders.length > 1 ? handleNavigatePrevious : undefined,
                onNavigateNext:
                    allOrders.length > 1 ? handleNavigateNext : undefined,
            })}
        </>
    )
}
