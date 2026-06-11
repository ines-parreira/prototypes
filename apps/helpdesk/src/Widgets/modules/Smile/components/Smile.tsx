import type { TemplateCustomization } from 'Widgets/modules/Template'
import { CustomizationContext, Template } from 'Widgets/modules/Template'
import type { WidgetProps } from 'Widgets/modules/Widget'

import { customerCustomization } from './Customer'

export const customization: TemplateCustomization = {
    card: [
        {
            dataMatcher: /integrations\.[0-9]+\.customer$/,
            customization: customerCustomization,
        },
    ],
}

export function SmileWidget(props: WidgetProps) {
    // You can set as much contexts as you want here
    return (
        <CustomizationContext.Provider value={customization}>
            <Template {...props} />
        </CustomizationContext.Provider>
    )
}
