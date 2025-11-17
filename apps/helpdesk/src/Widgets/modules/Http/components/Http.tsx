import type { TemplateCustomization } from 'Widgets/modules/Template'
import Template, { CustomizationContext } from 'Widgets/modules/Template'
import type { WidgetProps } from 'Widgets/modules/Widget'

import { rootCustomization } from './Root'

export const customization: TemplateCustomization = {
    card: [
        {
            /** path must match when there is a root array / list too
             * OK
             * ticket.customer.integrations.10
             * ticket.customer.integrations.10.data
             * ticket.customer.integrations.10.[data]
             * KO
             * ticket.customer.integrations.10.data.[meuuuuh]
             * ticket.customer.integrations.10.data.else
             */
            dataMatcher: /integrations\.[0-9]+(\.[^.]+(\.\[])?)?$/,
            customization: rootCustomization,
        },
    ],
}

export default function HttpWidget(props: WidgetProps) {
    // You can set as much contexts as you want here
    return (
        <CustomizationContext.Provider value={customization}>
            <Template {...props} />
        </CustomizationContext.Provider>
    )
}
