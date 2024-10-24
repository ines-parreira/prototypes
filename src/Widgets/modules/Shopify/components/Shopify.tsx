import React from 'react'

import Template, {
    TemplateCustomization,
    CustomizationContext,
} from 'Widgets/modules/Template'
import {WidgetProps} from 'Widgets/modules/Widget'

import {customerCustomization} from './Customer'
import {draftOrderCustomization} from './DraftOrder'
import {editableListCustomization} from './EditableListField'
import {fulfillmentCustomization} from './Fulfillment'
import {itemCustomization} from './Item'
import {orderCustomization} from './Order'
import {orderNotesCustomization} from './OrderNotesField'
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
    field: [editableListCustomization, orderNotesCustomization],
}

export default function ShopifyWidget(props: WidgetProps) {
    return (
        <CustomizationContext.Provider value={customization}>
            <Template {...props} />
        </CustomizationContext.Provider>
    )
}
