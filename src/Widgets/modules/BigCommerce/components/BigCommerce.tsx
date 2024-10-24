import React from 'react'

import {customerCustomization} from 'pages/common/components/infobar/Infobar/InfobarCustomerInfo/InfobarWidgets/widgets/bigcommerce/Customer'
import {orderCustomization} from 'pages/common/components/infobar/Infobar/InfobarCustomerInfo/InfobarWidgets/widgets/bigcommerce/OrderWidget'
import {shippingCustomization} from 'pages/common/components/infobar/Infobar/InfobarCustomerInfo/InfobarWidgets/widgets/bigcommerce/Shipping'

import Template from 'Widgets/modules/Template'
import {CustomizationContext} from 'Widgets/modules/Template/contexts/CustomizationContext'
import {TemplateCustomization} from 'Widgets/modules/Template/types'
import {WidgetProps} from 'Widgets/modules/Widget'

export const customization: TemplateCustomization = {
    card: [
        {
            dataMatcher: /integrations\.\d+\.customer$/,
            customization: customerCustomization,
        },
        {
            dataMatcher: /integrations\.\d+\.(draft_orders|orders)\.\[\]$/,
            templateMatcher: /\d+\.template\.widgets\.\d+\.widgets\.\d+$/,
            customization: orderCustomization,
        },
        {
            dataMatcher:
                /integrations\.\d+\.orders\.\[]\.bc_order_shipments\.\[\]$/,
            customization: shippingCustomization,
        },
    ],
}

export default function BigCommerceWidget(props: WidgetProps) {
    // You can set as much contexts as you want here
    return (
        <CustomizationContext.Provider value={customization}>
            <Template {...props} />
        </CustomizationContext.Provider>
    )
}
