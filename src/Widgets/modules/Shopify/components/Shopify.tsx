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
            dataMatcher: /integrations\.\d+\.customer$/,
            customization: customerCustomization,
        },
        {
            dataMatcher: /integrations\.\d+\.draft_orders\.\[]$/,
            customization: draftOrderCustomization,
        },
        {
            dataMatcher: /integrations\.\d+\.orders\.\[]$/,
            customization: orderCustomization,
        },
        {
            dataMatcher: /integrations\.\d+\.orders\.\[]\.line_items\.\[]$/,
            customization: itemCustomization,
        },
        {
            dataMatcher: /integrations\.\d+\.orders\.\[]\.fulfillments\.\[]$/,
            customization: fulfillmentCustomization,
        },
        {
            dataMatcher: /integrations\.\d+\.orders\.\[]\.shipping_address$/,
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
