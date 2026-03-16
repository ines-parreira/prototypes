import type { ComponentType, ReactNode } from 'react'
import { useCallback } from 'react'

import type {
    EditShippingAddressModalRenderProps,
    OrderData,
    ShopperData,
} from '@repo/customer'
import { OrderSidePanelPreview } from '@repo/customer'
import type { OrderCardProduct } from '@repo/ecommerce/shopify/types'
import { fromJS } from 'immutable'

import type { InfobarModalProps } from 'pages/common/components/infobar/Infobar/InfobarCustomerInfo/InfobarWidgets/widgets/types'
import { useCancelOrder } from 'pages/tickets/detail/hooks/useCancelOrder'
import { useDuplicateOrder } from 'pages/tickets/detail/hooks/useDuplicateOrder'
import { useEditOrder } from 'pages/tickets/detail/hooks/useEditOrder'
import { useRefundOrder } from 'pages/tickets/detail/hooks/useRefundOrder'
import { CustomerContext } from 'providers/infobar/CustomerContext'
import { IntegrationContext } from 'providers/infobar/IntegrationContext'
import DraftOrderModal from 'Widgets/modules/Shopify/modules/DraftOrderModal'
import CancelOrderModalDefault from 'Widgets/modules/Shopify/modules/Order/modules/CancelOrderModal'
import EditOrderModal from 'Widgets/modules/Shopify/modules/Order/modules/EditOrderModal'
import RefundOrderModal from 'Widgets/modules/Shopify/modules/Order/modules/RefundOrderModal'
import { ShopifyActionType } from 'Widgets/modules/Shopify/types'

import css from './OrderSidePanelWithActions.less'

const CancelOrderModal = CancelOrderModalDefault as ComponentType<
    InfobarModalProps & {
        data: { actionName: string | null; order: unknown }
        modalClassName?: string
    }
>
type Props<T extends OrderData = OrderData> = {
    order: T | null
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

export function OrderSidePanelWithActions<T extends OrderData = OrderData>({
    order,
    isOpen,
    onOpenChange,
    productsMap,
    isDraftOrder,
    storeName,
    integrationId,
    ticketId,
    customerId,
    renderEditShippingAddressModal,
    hasPrevious,
    hasNext,
    onNavigatePrevious,
    onNavigateNext,
}: Props<T>) {
    const editOrder = useEditOrder()
    const duplicateOrder = useDuplicateOrder()
    const cancelOrder = useCancelOrder()
    const refundOrder = useRefundOrder()

    const handleEdit = useCallback(
        (order: T) => {
            if (
                integrationId &&
                (order as unknown as { customer?: ShopperData }).customer
            ) {
                editOrder.open(
                    integrationId,
                    order as unknown as OrderData & { customer: ShopperData },
                )
            }
        },
        [integrationId, editOrder],
    )

    const handleDuplicate = useCallback(
        (order: T) => {
            if (
                integrationId &&
                (order as unknown as { customer?: ShopperData }).customer
            ) {
                duplicateOrder.open(
                    integrationId,
                    order as unknown as OrderData & { customer: ShopperData },
                )
            }
        },
        [integrationId, duplicateOrder],
    )

    const handleRefund = useCallback(
        (order: T) => {
            if (integrationId) {
                refundOrder.open(integrationId, order)
            }
        },
        [integrationId, refundOrder],
    )

    const handleCancel = useCallback(
        (order: T) => {
            if (integrationId) {
                cancelOrder.open(integrationId, order)
            }
        },
        [integrationId, cancelOrder],
    )

    return (
        <>
            <OrderSidePanelPreview
                order={order}
                isOpen={isOpen}
                onOpenChange={onOpenChange}
                productsMap={productsMap}
                isDraftOrder={isDraftOrder}
                onEdit={handleEdit}
                onDuplicate={handleDuplicate}
                onRefund={handleRefund}
                onCancel={handleCancel}
                storeName={storeName}
                integrationId={integrationId}
                ticketId={ticketId}
                customerId={customerId}
                renderEditShippingAddressModal={renderEditShippingAddressModal}
                hasPrevious={hasPrevious}
                hasNext={hasNext}
                onNavigatePrevious={onNavigatePrevious}
                onNavigateNext={onNavigateNext}
            />
            <CustomerContext.Provider value={{ customerId: null }}>
                <IntegrationContext.Provider
                    value={{
                        integration: fromJS({}),
                        integrationId: editOrder.data?.integrationId ?? null,
                    }}
                >
                    <EditOrderModal
                        isOpen={editOrder.isOpen}
                        title="Edit order"
                        onChange={editOrder.onChange}
                        onBulkChange={editOrder.onBulkChange}
                        onSubmit={editOrder.onSubmit}
                        onClose={editOrder.onClose}
                        modalClassName={css.aboveSidePanel}
                        data={{
                            actionName: ShopifyActionType.EditOrder,
                            order: editOrder.data?.orderImmutable,
                            customer: editOrder.data?.customerImmutable,
                        }}
                    />
                </IntegrationContext.Provider>
                <IntegrationContext.Provider
                    value={{
                        integration: fromJS({}),
                        integrationId:
                            duplicateOrder.data?.integrationId ?? null,
                    }}
                >
                    <DraftOrderModal
                        isOpen={duplicateOrder.isOpen}
                        title="Duplicate order"
                        onChange={duplicateOrder.onChange}
                        onBulkChange={duplicateOrder.onBulkChange}
                        onSubmit={duplicateOrder.onSubmit}
                        onClose={duplicateOrder.onClose}
                        modalClassName={css.aboveSidePanel}
                        data={{
                            actionName: ShopifyActionType.DuplicateOrder,
                            order: duplicateOrder.data?.orderImmutable,
                            customer: duplicateOrder.data?.customerImmutable,
                        }}
                    />
                </IntegrationContext.Provider>
                <IntegrationContext.Provider
                    value={{
                        integration: fromJS({}),
                        integrationId: refundOrder.data?.integrationId ?? null,
                    }}
                >
                    <RefundOrderModal
                        isOpen={refundOrder.isOpen}
                        title="Refund order"
                        onChange={refundOrder.onChange}
                        onBulkChange={refundOrder.onBulkChange}
                        onSubmit={refundOrder.onSubmit}
                        onClose={refundOrder.onClose}
                        modalClassName={css.aboveSidePanel}
                        data={{
                            actionName: ShopifyActionType.RefundOrder,
                            order: refundOrder.data?.orderImmutable,
                        }}
                    />
                </IntegrationContext.Provider>
                <IntegrationContext.Provider
                    value={{
                        integration: fromJS({}),
                        integrationId: cancelOrder.data?.integrationId ?? null,
                    }}
                >
                    <CancelOrderModal
                        isOpen={cancelOrder.isOpen}
                        title="Cancel order"
                        onChange={cancelOrder.onChange}
                        onBulkChange={cancelOrder.onBulkChange}
                        onSubmit={cancelOrder.onSubmit}
                        onClose={cancelOrder.onClose}
                        modalClassName={css.aboveSidePanel}
                        data={{
                            actionName: ShopifyActionType.CancelOrder,
                            order: cancelOrder.data?.orderImmutable,
                        }}
                    />
                </IntegrationContext.Provider>
            </CustomerContext.Provider>
        </>
    )
}
