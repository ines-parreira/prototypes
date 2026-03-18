import { BILLING_ADDRESS_FIELD_DEFINITIONS } from './orderBillingAddressFields'
import { FIELD_DEFINITIONS as ORDER_DETAILS_FIELD_DEFINITIONS } from './orderDetailsFields'
import { SHIPPING_ADDRESS_FIELD_DEFINITIONS } from './orderShippingAddressFields'
import { SHIPPING_FIELD_DEFINITIONS } from './orderShippingFields'
import type { OrderFieldConfig, OrderSectionKey } from './types'

export type OrderSectionConfig = {
    key: OrderSectionKey
    label: string
    fieldDefinitions: Record<string, OrderFieldConfig>
    dragType: string
    isNonConfigurable?: boolean
    isToggleDisabled?: boolean
    disclaimer?: string
}

export const ORDER_SECTION_CONFIGS: readonly OrderSectionConfig[] = [
    {
        key: 'orderDetails',
        label: 'Order details',
        fieldDefinitions: ORDER_DETAILS_FIELD_DEFINITIONS,
        dragType: 'field-order-details',
    },
    {
        key: 'lineItems',
        label: 'Line items',
        fieldDefinitions: {},
        dragType: 'field-line-items',
        isNonConfigurable: true,
        isToggleDisabled: true,
    },
    {
        key: 'shipping',
        label: 'Shipping',
        fieldDefinitions: SHIPPING_FIELD_DEFINITIONS,
        dragType: 'field-shipping',
    },
    {
        key: 'shippingAddress',
        label: 'Shipping address',
        fieldDefinitions: SHIPPING_ADDRESS_FIELD_DEFINITIONS,
        dragType: 'field-shipping-address',
        isNonConfigurable: true,
        disclaimer: 'Unable to edit individual fields',
    },
    {
        key: 'billingAddress',
        label: 'Billing address',
        fieldDefinitions: BILLING_ADDRESS_FIELD_DEFINITIONS,
        dragType: 'field-billing-address',
        isNonConfigurable: true,
        disclaimer: 'Unable to edit individual fields',
    },
]
