import type { ReactNode } from 'react'

import type { OrderCardProduct } from '@repo/ecommerce/shopify/types'

import type { OrderData, OrderEcommerceData } from '../../../types'
import type { EditShippingAddressModalRenderProps } from '../orders/sections/ShippingAddressSection'

export type OrdersV2Order = {
    eco: OrderEcommerceData
    data: OrderData
    isDraft: boolean
}

export type OrdersSidebarV2Props = {
    orders: OrderEcommerceData[] | undefined
    draftOrders: OrderEcommerceData[] | undefined
    isLoadingOrders: boolean
    isLoadingDraftOrders: boolean
    productsMap: Map<number, OrderCardProduct> | undefined
    storeName?: string
    integrationId?: number
    ticketId?: string
    customerId?: number
    selectedExternalId?: string
    onCreateOrder?: () => void
    renderEditShippingAddressModal?: (
        props: EditShippingAddressModalRenderProps,
    ) => ReactNode
}
