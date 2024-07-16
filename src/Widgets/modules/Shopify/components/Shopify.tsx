import React from 'react'

import Template, {
    TemplateCustomization,
    CustomizationContext,
} from 'Widgets/modules/Template'
import {WidgetProps} from 'Widgets/modules/Widget'

import {customerCustomization} from './Customer'
import {draftOrderCustomization} from './DraftOrder'
import {orderCustomization} from './Order'
import {itemCustomization} from './Item'
import {fulfillmentCustomization} from './Fulfillment'
import {shippingAddressCustomization} from './ShippingAddress'

export const customization: TemplateCustomization = {
    card: [
        {
            matcher: /integrations\.\d+\.customer$/,
            customization: customerCustomization,
        },
        {
            matcher: /integrations\.\d+\.draft_orders\.\[]$/,
            customization: draftOrderCustomization,
        },
        {
            matcher: /integrations\.\d+\.orders\.\[]$/,
            customization: orderCustomization,
        },
        {
            matcher: /integrations\.\d+\.orders\.\[]\.line_items\.\[]$/,
            customization: itemCustomization,
        },
        {
            matcher: /integrations\.\d+\.orders\.\[]\.fulfillments\.\[]$/,
            customization: fulfillmentCustomization,
        },
        {
            matcher: /integrations\.\d+\.orders\.\[]\.shipping_address$/,
            customization: shippingAddressCustomization,
        },
    ],
}

export default function ShopifyWidget(props: WidgetProps) {
    // You can set as much contexts as you want here
    return (
        <CustomizationContext.Provider value={customization}>
            <Template {...props} />
        </CustomizationContext.Provider>
    )
}
