import { useCallback, useContext, useMemo, useState } from 'react'
import type { ReactNode } from 'react'

import { useTicketInfobarNavigation } from '@repo/navigation'
import { useUserDateTimePreferences } from '@repo/preferences'

import { Box } from '@gorgias/axiom'

import { useGetOrderProducts, useIntegrationSelection } from '../../hooks'
import { useGetDraftOrders } from '../../hooks/useGetDraftOrders'
import { useGetOrders } from '../../hooks/useGetOrders'
import { useGetPurchaseSummary } from '../../hooks/useGetPurchaseSummary'
import { useGetShopper } from '../../hooks/useGetShopper'
import { ShopifyCustomerContext } from '../../ShopifyCustomerContext'
import type { OrderEcommerceData } from '../../types'
import { CustomerLink } from '../CustomerLink'
import { StorePicker } from '../StorePicker'
import { CustomerInfoFieldList } from './CustomerInfoFieldList'
import { IntermediateEditPanel } from './IntermediateEditPanel'
import { NoShopifyProfile } from './NoShopifyProfile'
import type { EditShippingAddressModalRenderProps } from './OrderSidePanelPreview'
import { OrderSidePanelPreview } from './OrderSidePanelPreview'
import { OrdersList } from './OrdersList'
import type { FieldRenderContext } from './types'
import { useCustomerFieldPreferences } from './useCustomerFieldPreferences'

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
}: Props) {
    const {
        filteredIntegrations,
        selectedIntegration,
        selectedExternalId,
        handleStoreChange,
        isLoading: isLoadingIntegrations,
    } = useIntegrationSelection({
        associatedShopifyCustomerIds,
        externalIdMap,
        onStoreChange,
    })

    const { onCreateOrder } = useContext(ShopifyCustomerContext)

    const { shopper } = useGetShopper({
        integrationId: selectedIntegration?.id,
        externalId: selectedExternalId,
    })

    const { orders, isLoadingOrders } = useGetOrders({
        integrationId: selectedIntegration?.id,
        shopperIdentityId: shopper?.relationships?.shopper_identity_id,
    })

    const { orders: draftOrders, isLoadingOrders: isLoadingDraftOrders } =
        useGetDraftOrders({
            integrationId: selectedIntegration?.id,
            shopperIdentityId: shopper?.relationships?.shopper_identity_id,
        })

    const { productsMap } = useGetOrderProducts({
        integrationId: selectedIntegration?.id,
        orders: [...(orders ?? []), ...(draftOrders ?? [])],
    })

    const { purchaseSummary } = useGetPurchaseSummary({
        integrationId: selectedIntegration?.id,
        externalId: selectedExternalId,
    })

    const { dateFormat, timeFormat } = useUserDateTimePreferences()

    const context: FieldRenderContext = {
        purchaseSummary,
        shopper,
        dateFormat,
        timeFormat,
        integrationId: selectedIntegration?.id,
        externalId: selectedExternalId,
        customerId,
        ticketId,
    }

    const hasData = !!purchaseSummary || !!shopper

    const { fields, preferences, savePreferences } =
        useCustomerFieldPreferences()

    const { isEditShopifyFieldsOpen, onToggleEditShopifyFields } =
        useTicketInfobarNavigation()

    const allOrders = useMemo(
        () => [...(orders ?? []), ...(draftOrders ?? [])],
        [orders, draftOrders],
    )

    const [selectedOrderIndex, setSelectedOrderIndex] = useState<number | null>(
        null,
    )

    const selectedOrder =
        selectedOrderIndex !== null
            ? (allOrders[selectedOrderIndex] ?? null)
            : null

    const isDraftOrder =
        draftOrders?.some((order) => order.id === selectedOrder?.id) ?? false

    const handleSelectOrder = useCallback(
        (order: OrderEcommerceData) => {
            const index = allOrders.findIndex((o) => o.id === order.id)
            setSelectedOrderIndex(index !== -1 ? index : null)
        },
        [allOrders],
    )

    const handleNavigatePrevious = useCallback(() => {
        setSelectedOrderIndex((prev) =>
            prev !== null && prev > 0 ? prev - 1 : prev,
        )
    }, [])

    const handleCreateOrder = useCallback(() => {
        if (selectedIntegration?.id && shopper?.data && onCreateOrder) {
            onCreateOrder(selectedIntegration.id, shopper.data)
        }
    }, [selectedIntegration?.id, shopper?.data, onCreateOrder])

    const handleNavigateNext = useCallback(() => {
        setSelectedOrderIndex((prev) =>
            prev !== null && prev < allOrders.length - 1 ? prev + 1 : prev,
        )
    }, [allOrders.length])

    const hasPrevious = selectedOrderIndex !== null && selectedOrderIndex > 0
    const hasNext =
        selectedOrderIndex !== null && selectedOrderIndex < allOrders.length - 1

    const handleDuplicateOrder = useCallback(
        (order: OrderEcommerceData['data']) => {
            console.warn('Duplicate order:', order.name)
        },
        [],
    )

    const handleRefundOrder = useCallback(
        (order: OrderEcommerceData['data']) => {
            console.warn('Refund order:', order.name)
        },
        [],
    )

    const handleCancelOrder = useCallback(
        (order: OrderEcommerceData['data']) => {
            console.warn('Cancel order:', order.name)
        },
        [],
    )

    if (isEditShopifyFieldsOpen) {
        return (
            <IntermediateEditPanel
                fields={fields}
                context={context}
                preferences={preferences}
                onSavePreferences={savePreferences}
                onClose={() => onToggleEditShopifyFields(false)}
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
            <Box flexDirection="column" gap="sm" padding="md">
                <StorePicker
                    integrations={filteredIntegrations}
                    selectedIntegrationId={selectedIntegration?.id}
                    onChange={handleStoreChange}
                    isLoading={isLoadingIntegrations || isLoadingTicket}
                    onSyncProfile={onSyncProfile}
                />

                <CustomerLink
                    selectedIntegration={selectedIntegration}
                    shopper={shopper}
                    isLoading={isLoadingIntegrations}
                />
                {hasData && (
                    <CustomerInfoFieldList fields={fields} context={context} />
                )}
            </Box>

            <OrdersList
                orders={orders}
                isLoadingOrders={isLoadingOrders}
                productsMap={productsMap}
                draftOrders={draftOrders}
                isLoadingDraftOrders={isLoadingDraftOrders}
                onSelectOrder={handleSelectOrder}
                onCreateOrder={handleCreateOrder}
            />

            <OrderSidePanelPreview
                order={selectedOrder?.data ?? null}
                isOpen={selectedOrderIndex !== null}
                onOpenChange={(open) => {
                    if (!open) setSelectedOrderIndex(null)
                }}
                productsMap={productsMap}
                isDraftOrder={isDraftOrder}
                onDuplicate={handleDuplicateOrder}
                onRefund={handleRefundOrder}
                onCancel={handleCancelOrder}
                storeName={selectedIntegration?.name}
                integrationId={selectedIntegration?.id}
                ticketId={ticketId}
                customerId={selectedExternalId}
                renderEditShippingAddressModal={renderEditShippingAddressModal}
                hasPrevious={hasPrevious}
                hasNext={hasNext}
                onNavigatePrevious={
                    allOrders.length > 1 ? handleNavigatePrevious : undefined
                }
                onNavigateNext={
                    allOrders.length > 1 ? handleNavigateNext : undefined
                }
            />
        </>
    )
}
