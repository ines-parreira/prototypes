import React from 'react'

import Template, {
    TemplateCustomization,
    CustomizationContext,
} from 'Widgets/modules/Template'
import {WidgetProps} from 'Widgets/modules/Widget'

import {orderCustomization} from './Order'
import {shopperCustomization} from './Shopper'

export const customization: TemplateCustomization = {
    card: [
        {
            dataMatcher: /ecommerce_data\..+\.shopper$/,
            customization: shopperCustomization,
        },
        {
            dataMatcher: /ecommerce_data\..+\.orders$/,
            customization: orderCustomization,
        },
    ],
}

export default function WooCommerceWidget(props: WidgetProps) {
    // You can set as much contexts as you want here
    return (
        <CustomizationContext.Provider value={customization}>
            <Template {...props} />
        </CustomizationContext.Provider>
    )
}
