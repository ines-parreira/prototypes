import {IntegrationType} from '@gorgias/api-types'
import {WidgetType} from 'state/widgets/types'

import ShopifyWidget from 'Widgets/modules/Shopify'

import {WidgetProps} from '../types'

const widgetByType: {
    [T in WidgetType]?: (args: WidgetProps) => React.JSX.Element
} = {
    [IntegrationType.Shopify]: ShopifyWidget,
}

export function getWidgetByType(type: WidgetType) {
    return widgetByType[type]
}
