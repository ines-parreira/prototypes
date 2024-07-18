import {IntegrationType} from '@gorgias/api-types'
import {WidgetType} from 'state/widgets/types'

import ShopifyWidget from 'Widgets/modules/Shopify/'
import BigCommerceWidget from 'Widgets/modules/BigCommerce/'
import YotpoWidget from 'Widgets/modules/Yotpo'

import {WidgetProps} from '../types'

const widgetByType: {
    [T in WidgetType]?: (args: WidgetProps) => React.JSX.Element
} = {
    [IntegrationType.Shopify]: ShopifyWidget,
    [IntegrationType.Bigcommerce]: BigCommerceWidget,
    [IntegrationType.Yotpo]: YotpoWidget,
}

export function getWidgetByType(type: WidgetType) {
    return widgetByType[type]
}
