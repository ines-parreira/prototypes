import type { ReactNode } from 'react'
import { useCallback, useState } from 'react'

import type { EditShippingAddressModalRenderProps } from '@repo/customer'
import { TicketInfobarTab, useTicketInfobarNavigation } from '@repo/navigation'

import { useGetCustomer } from '@gorgias/helpdesk-queries'

import useAppSelector from 'hooks/useAppSelector'
import type { Customer } from 'models/customer/types'
import { getActiveCustomer } from 'state/customers/selectors'
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

    const { lastOrder, totalCount, unfulfilledCount, integrationId } =
        useShopifyOrdersSummary(customer)

    const { productsMap } = useWidgetOrderProducts({
        integrationId,
        order: lastOrder,
    })

    const [isOrderOpen, setIsOrderOpen] = useState(false)

    const handleSelectOrder = useCallback(() => {
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
                order={lastOrder}
                isOpen={isOrderOpen}
                onOpenChange={setIsOrderOpen}
                productsMap={productsMap}
                integrationId={integrationId}
                customerId={String(lastOrder.customer?.id ?? '')}
                renderEditShippingAddressModal={renderEditShippingAddressModal}
            />
        </div>
    )
}
