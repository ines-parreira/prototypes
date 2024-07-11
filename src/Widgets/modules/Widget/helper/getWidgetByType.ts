import {IntegrationType} from '@gorgias/api-types'
import {WidgetType} from 'state/widgets/types'

import {WidgetProps} from '../types'
import ShopifyWidget from '../../Shopify/components/Shopify'

const widgetByType: {
    [T in WidgetType]?: (args: WidgetProps) => React.JSX.Element
} = {
    [IntegrationType.Shopify]: ShopifyWidget,
}

export function getWidgetByType(type: WidgetType) {
    return widgetByType[type]
}
