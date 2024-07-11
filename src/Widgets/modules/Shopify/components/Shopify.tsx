import React from 'react'

import {CustomizationContext} from 'Widgets/modules/Template/contexts/CustomizationContext'
import {TemplateCustomization} from 'Widgets/modules/Template/types'
import Template from 'Widgets/modules/Template'
import {customerCustomization} from 'pages/common/components/infobar/Infobar/InfobarCustomerInfo/InfobarWidgets/widgets/shopify/Customer'
import {draftOrderCustomization} from 'pages/common/components/infobar/Infobar/InfobarCustomerInfo/InfobarWidgets/widgets/shopify/DraftOrder/DraftOrderWidget'
import {orderCustomization} from 'pages/common/components/infobar/Infobar/InfobarCustomerInfo/InfobarWidgets/widgets/shopify/Order/OrderWidget'
import {itemCustomization} from 'pages/common/components/infobar/Infobar/InfobarCustomerInfo/InfobarWidgets/widgets/shopify/Item'
import {fulfillmentCustomization} from 'pages/common/components/infobar/Infobar/InfobarCustomerInfo/InfobarWidgets/widgets/shopify/Fulfillment'
import {shippingAddressCustomization} from 'pages/common/components/infobar/Infobar/InfobarCustomerInfo/InfobarWidgets/widgets/shopify/Order/ShippingAddress'

import {WidgetProps} from '../../Widget/types'

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
