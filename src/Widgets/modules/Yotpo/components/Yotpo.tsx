import React from 'react'

import Template, {
    CustomizationContext,
    TemplateCustomization,
} from 'Widgets/modules/Template'
import {WidgetProps} from 'Widgets/modules/Widget'

import {customerCustomization} from './Customer'
import {loyaltyCustomization} from './Loyalty'
import {reviewsCustomization} from './Reviews'
import {reviewStatisticsCustomization} from './ReviewStatistics'

export const customization: TemplateCustomization = {
    card: [
        {
            dataMatcher: /integrations\.[0-9]+\.customer$/,
            customization: customerCustomization,
        },
        {
            dataMatcher: /integrations\.[0-9]+\.customer\.loyalty_statistics$/,
            customization: loyaltyCustomization,
        },
        {
            dataMatcher: /integrations\.[0-9]+\.customer\.reviews_statistics$/,
            customization: reviewStatisticsCustomization,
        },
        {
            dataMatcher: /integrations\.[0-9]+\.reviews\.\[]$/,
            customization: reviewsCustomization,
        },
    ],
}

export default function YotpoWidget(props: WidgetProps) {
    // You can set as much contexts as you want here
    return (
        <CustomizationContext.Provider value={customization}>
            <Template {...props} />
        </CustomizationContext.Provider>
    )
}
