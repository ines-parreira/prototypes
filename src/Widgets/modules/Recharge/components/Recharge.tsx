import React from 'react'

import DatetimeLabel from 'pages/common/utils/DatetimeLabel'
import Template, {
    CustomizationContext,
    TemplateCustomization,
} from 'Widgets/modules/Template'
import { FALLBACK_VALUE } from 'Widgets/modules/Template/modules/Field'
import { WidgetProps } from 'Widgets/modules/Widget'

import { formatRechargeDateTime } from '../helpers/formatRechargeDateTime'
import { chargeCustomization } from './Charge'
import { customerCustomization } from './Customer'
import { orderCustomization } from './Order'
import { subscriptionCustomization } from './Subscription'

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
    field: [
        {
            type: 'date',
            getValue: (source) => {
                if (typeof source === 'string') {
                    return (
                        <DatetimeLabel
                            dateTime={formatRechargeDateTime(source)}
                        />
                    )
                }
                return FALLBACK_VALUE
            },
            getValueString: (source) => {
                if (typeof source === 'string') {
                    return formatRechargeDateTime(source)
                }
                return null
            },
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
