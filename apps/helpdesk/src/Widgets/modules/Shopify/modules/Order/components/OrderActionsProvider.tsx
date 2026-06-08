import type { ComponentType, ReactNode } from 'react'
import { useMemo } from 'react'

import type { OrderActionHandlers } from '@repo/customer'
import { OrderActionsContext } from '@repo/customer'
import { FeatureFlagKey, useFlag } from '@repo/feature-flags'
import { fromJS } from 'immutable'

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

import type { InfobarModalProps } from 'pages/common/components/infobar/Infobar/InfobarCustomerInfo/InfobarWidgets/widgets/types'

import css from './OrderSidePanelWithActions.less'

const CancelOrderModal = CancelOrderModalDefault as ComponentType<
    InfobarModalProps & {
        data: { actionName: string | null; order: unknown }
        modalClassName?: string
    }
>

const noop = () => undefined

type Props = {
    ticketCustomerId?: number | null
    children: ReactNode
}

export function OrderActionsProvider({ ticketCustomerId, children }: Props) {
    const editOrder = useEditOrder()
    const duplicateOrder = useDuplicateOrder()
    const refundOrder = useRefundOrder()
    const cancelOrder = useCancelOrder()
    const hideActions = useFlag(FeatureFlagKey.ShopifyHideActionButtons)

    const handlers = useMemo<OrderActionHandlers>(() => {
        if (hideActions) {
            return {
                onEdit: noop,
                onDuplicate: noop,
                onRefund: noop,
                onCancel: noop,
            }
        }
        return {
            onEdit: (integrationId, order) =>
                editOrder.open(
                    integrationId,
                    order as unknown as Parameters<typeof editOrder.open>[1],
                ),
            onDuplicate: (integrationId, order) =>
                duplicateOrder.open(
                    integrationId,
                    order as unknown as Parameters<
                        typeof duplicateOrder.open
                    >[1],
                ),
            onRefund: (integrationId, order) =>
                refundOrder.open(
                    integrationId,
                    order as unknown as Parameters<typeof refundOrder.open>[1],
                ),
            onCancel: (integrationId, order) =>
                cancelOrder.open(
                    integrationId,
                    order as unknown as Parameters<typeof cancelOrder.open>[1],
                ),
        }
    }, [hideActions, editOrder, duplicateOrder, refundOrder, cancelOrder])

    return (
        <OrderActionsContext.Provider value={handlers}>
            {children}
            <CustomerContext.Provider
                value={{ customerId: ticketCustomerId ?? null }}
            >
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
        </OrderActionsContext.Provider>
    )
}
