import type { Map } from 'immutable'

import type { Source, Template } from 'models/widget/types'
import { WidgetContextProvider } from 'Widgets/contexts/WidgetContext'
import { WooCommerceWidget } from 'Widgets/modules/WooCommerce'

export type WooCommercePair = {
    widget: Map<string, unknown>
    widgetIndex: number
    storeUuid: string
    source: Map<string, unknown>
    template: Template
}

export function WooCommerceStoreWidget({
    widget,
    widgetIndex,
    storeUuid,
    source,
    template,
}: WooCommercePair) {
    const absolutePath = ['ticket', 'customer', 'ecommerce_data', storeUuid]
    const passedTemplate = {
        ...template,
        templatePath: `${widgetIndex}.template`,
        absolutePath,
    }
    return (
        <WidgetContextProvider value={widget}>
            <WooCommerceWidget
                source={source.toJS() as Source}
                template={passedTemplate}
            />
        </WidgetContextProvider>
    )
}
