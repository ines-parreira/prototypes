import type { ReactNode } from 'react'
import { useCallback, useEffect, useState } from 'react'

import type { EditShippingAddressModalRenderProps } from '@repo/customer'
import { TicketInfobarTab, useTicketInfobarNavigation } from '@repo/navigation'

import { useGetCustomer } from '@gorgias/helpdesk-queries'

import useAppSelector from 'hooks/useAppSelector'
import type { Customer } from 'models/customer/types'
import { IntegrationType } from 'models/integration/types'
import { getActiveCustomer } from 'state/customers/selectors'
import { getIntegrationByIdAndType } from 'state/integrations/selectors'
import { getTicketCustomer } from 'state/ticket/selectors'
import { OrderSidePanelWithActions } from 'Widgets/modules/Shopify/modules/Order/components/OrderSidePanelWithActions'

import { ShopifyOrdersWidget } from './ShopifyOrdersWidget'
import { useShopifyOrdersSummary } from './useShopifyOrdersSummary'
import { useWidgetOrderProducts } from './useWidgetOrderProducts'

import css from './ShopifyOrdersWidgetContainer.less'

type Props = {
    renderEditShippingAddressModal?: (
        props: EditShippingAddressModalRenderProps,
    ) => ReactNode
}

export function ShopifyOrdersWidgetContainer({
    renderEditShippingAddressModal,
}: Props) {
    const ticketCustomer = useAppSelector(getTicketCustomer)
    const activeCustomer = useAppSelector(getActiveCustomer)
    const customerId =
        ticketCustomer?.get('id') || (activeCustomer as Customer)?.id
    const { onChangeTab } = useTicketInfobarNavigation()

    const { data: customerResponse } = useGetCustomer(customerId, undefined, {
        query: { enabled: !!customerId },
    })
    const customer = customerResponse?.data as Customer | undefined

    const {
        lastOrder,
        totalCount,
        unfulfilledCount,
        integrationId,
        integrationOrders,
    } = useShopifyOrdersSummary(customer)

    const integration = useAppSelector(
        getIntegrationByIdAndType(integrationId!, IntegrationType.Shopify),
    )

    const [isOrderOpen, setIsOrderOpen] = useState(false)
    const [selectedOrderIndex, setSelectedOrderIndex] = useState(0)

    useEffect(() => {
        setSelectedOrderIndex(0)
    }, [integrationOrders])

    const selectedOrder = integrationOrders[selectedOrderIndex] ?? lastOrder

    const hasPrevious = selectedOrderIndex > 0
    const hasNext = selectedOrderIndex < integrationOrders.length - 1

    const handleNavigatePrevious = useCallback(() => {
        setSelectedOrderIndex((prev) => (prev > 0 ? prev - 1 : prev))
    }, [])

    const handleNavigateNext = useCallback(() => {
        setSelectedOrderIndex((prev) =>
            prev < integrationOrders.length - 1 ? prev + 1 : prev,
        )
    }, [integrationOrders.length])

    const { productsMap } = useWidgetOrderProducts({
        integrationId,
        orders: integrationOrders,
    })

    const handleSelectOrder = useCallback(() => {
        setSelectedOrderIndex(0)
        setIsOrderOpen(true)
    }, [])

    if (!lastOrder) return null

    const handleShowAll = () => {
        onChangeTab(TicketInfobarTab.Shopify, {
            shopifyIntegrationId: integrationId,
        })
    }

    return (
        <div className={css.container}>
            <ShopifyOrdersWidget
                lastOrder={lastOrder}
                totalCount={totalCount}
                unfulfilledCount={unfulfilledCount}
                productsMap={productsMap}
                onShowAll={handleShowAll}
                onClick={handleSelectOrder}
            />
            <OrderSidePanelWithActions
                order={selectedOrder}
                isOpen={isOrderOpen}
                onOpenChange={setIsOrderOpen}
                productsMap={productsMap}
                integrationId={integrationId}
                storeName={integration?.name}
                customerId={String(selectedOrder?.customer?.id ?? '')}
                renderEditShippingAddressModal={renderEditShippingAddressModal}
                hasPrevious={hasPrevious}
                hasNext={hasNext}
                onNavigatePrevious={
                    integrationOrders.length > 1
                        ? handleNavigatePrevious
                        : undefined
                }
                onNavigateNext={
                    integrationOrders.length > 1
                        ? handleNavigateNext
                        : undefined
                }
            />
        </div>
    )
}
