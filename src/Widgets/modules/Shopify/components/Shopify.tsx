import React from 'react'

import Template, {
    TemplateCustomization,
    CustomizationContext,
} from 'Widgets/modules/Template'
import {WidgetProps} from 'Widgets/modules/Widget'

import {useShopifyContextData} from '../hooks/useShopifyContextData'
import {ShopifyContext} from '../contexts/ShopifyContext'
import {customerCustomization} from './Customer'
import {draftOrderCustomization} from './DraftOrder'
import {orderCustomization} from './Order'
import {itemCustomization} from './Item'
import {fulfillmentCustomization} from './Fulfillment'
import {shippingAddressCustomization} from './ShippingAddress'
import {editableListCustomization} from './EditableListField'

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
    field: [editableListCustomization],
}

export default function ShopifyWidget(props: WidgetProps) {
    const shopifyContextData = useShopifyContextData(props.source)

    return (
        <ShopifyContext.Provider value={shopifyContextData}>
            <CustomizationContext.Provider value={customization}>
                <Template {...props} />
            </CustomizationContext.Provider>
        </ShopifyContext.Provider>
    )
}
