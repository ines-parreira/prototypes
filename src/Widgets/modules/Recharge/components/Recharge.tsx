import React from 'react'

import Template, {
    TemplateCustomization,
    CustomizationContext,
} from 'Widgets/modules/Template'
import {WidgetProps} from 'Widgets/modules/Widget'

import {customerCustomization} from './Customer'
import {chargeCustomization} from './Charge'
import {subscriptionCustomization} from './Subscription'
import {orderCustomization} from './Order'

export const customization: TemplateCustomization = {
    card: [
        {
            dataMatcher: /integrations\.[0-9]+\.customer$/,
            customization: customerCustomization,
        },
        {
            dataMatcher: /integrations\.[0-9]+\.charges.\[]$/,
            customization: chargeCustomization,
        },
        {
            dataMatcher: /integrations\.[0-9]+\.subscriptions.\[]$/,
            customization: subscriptionCustomization,
        },
        {
            dataMatcher: /integrations\.[0-9]+\.orders.\[]$/,
            customization: orderCustomization,
        },
    ],
}

export default function RechargeWidget(props: WidgetProps) {
    // You can set as much contexts as you want here
    return (
        <CustomizationContext.Provider value={customization}>
            <Template {...props} />
        </CustomizationContext.Provider>
    )
}
