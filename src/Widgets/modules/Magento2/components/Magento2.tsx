import Template, {
    CustomizationContext,
    TemplateCustomization,
} from 'Widgets/modules/Template'
import { WidgetProps } from 'Widgets/modules/Widget'

import { customerCustomization } from './Customer'
import { orderCustomization } from './Order'

export const customization: TemplateCustomization = {
    card: [
        {
            dataMatcher: /integrations\.[0-9]+\.customer$/,
            customization: customerCustomization,
        },
        {
            dataMatcher: /integrations\.[0-9]+\.orders.\[]$/,
            customization: orderCustomization,
        },
    ],
}

export default function Magento2Widget(props: WidgetProps) {
    // You can set as much contexts as you want here
    return (
        <CustomizationContext.Provider value={customization}>
            <Template {...props} />
        </CustomizationContext.Provider>
    )
}
