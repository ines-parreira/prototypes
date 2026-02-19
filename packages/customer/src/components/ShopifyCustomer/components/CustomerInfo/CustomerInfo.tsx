import { useCallback, useState } from 'react'

import { useUserDateTimePreferences } from '@repo/user'

import { Box } from '@gorgias/axiom'

import { useGetOrderProducts, useIntegrationSelection } from '../../hooks'
import { useGetDraftOrders } from '../../hooks/useGetDraftOrders'
import { useGetOrders } from '../../hooks/useGetOrders'
import { useGetPurchaseSummary } from '../../hooks/useGetPurchaseSummary'
import { useGetShopper } from '../../hooks/useGetShopper'
import type { OrderEcommerceData } from '../../types'
import { CustomerLink } from '../CustomerLink'
import { StorePicker } from '../StorePicker'
import { CustomerInfoFieldList } from './CustomerInfoFieldList'
import { NoShopifyProfile } from './NoShopifyProfile'
import { OrderSidePanelPreview } from './OrderSidePanelPreview'
import { OrdersList } from './OrdersList'
import { ShopifyTags } from './ShopifyTags'
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
}

export function CustomerInfo({
    associatedShopifyCustomerIds,
    externalIdMap,
    isLoadingTicket,
    onStoreChange,
    onSyncProfile,
    ticketId,
    customerId,
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
    }

    const hasData = !!purchaseSummary || !!shopper

    const { fields } = useCustomerFieldPreferences()

    const [selectedOrder, setSelectedOrder] =
        useState<OrderEcommerceData | null>(null)
    const [isOrderOpen, setIsOrderOpen] = useState(false)

    const handleSelectOrder = useCallback((order: OrderEcommerceData) => {
        setSelectedOrder(order)
        setIsOrderOpen(true)
    }, [])

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
                    <>
                        <ShopifyTags
                            tags={shopper?.data?.tags}
                            integrationId={selectedIntegration?.id}
                            externalId={selectedExternalId}
                            customerId={customerId}
                            ticketId={ticketId}
                        />
                        <CustomerInfoFieldList
                            fields={fields}
                            context={context}
                        />
                    </>
                )}
            </Box>
            <OrdersList
                orders={orders}
                isLoadingOrders={isLoadingOrders}
                productsMap={productsMap}
                draftOrders={draftOrders}
                isLoadingDraftOrders={isLoadingDraftOrders}
                onSelectOrder={handleSelectOrder}
            />
            <OrderSidePanelPreview
                order={selectedOrder?.data ?? null}
                isOpen={isOrderOpen}
                onOpenChange={setIsOrderOpen}
                productsMap={productsMap}
                onDuplicate={handleDuplicateOrder}
                onRefund={handleRefundOrder}
                onCancel={handleCancelOrder}
            />
        </>
    )
}
