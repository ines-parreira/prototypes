import { TicketInfobarTab, useTicketInfobarNavigation } from '@repo/navigation'
import { isEmpty } from 'lodash'

import useAppSelector from 'hooks/useAppSelector'
import type { Customer } from 'models/customer/types'
import { getActiveCustomer } from 'state/customers/selectors'
import { getTicketCustomer } from 'state/ticket/selectors'

import { ShopifyOrdersWidget } from './ShopifyOrdersWidget'
import { useShopifyOrdersSummary } from './useShopifyOrdersSummary'
import { useWidgetOrderProducts } from './useWidgetOrderProducts'

import css from './ShopifyOrdersWidgetContainer.less'

export function ShopifyOrdersWidgetContainer() {
    const ticketCustomer: Customer = useAppSelector(getTicketCustomer)?.toJS()
    const activeCustomer = useAppSelector(getActiveCustomer)
    const { onChangeTab } = useTicketInfobarNavigation()

    const customer: Customer = isEmpty(ticketCustomer)
        ? (activeCustomer as Customer)
        : ticketCustomer

    const { lastOrder, totalCount, unfulfilledCount, integrationId } =
        useShopifyOrdersSummary(customer)

    const { productsMap } = useWidgetOrderProducts({
        integrationId,
        order: lastOrder,
    })

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
            />
        </div>
    )
}
