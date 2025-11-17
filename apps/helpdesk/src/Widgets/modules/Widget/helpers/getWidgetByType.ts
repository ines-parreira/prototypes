import { IntegrationType } from '@gorgias/helpdesk-types'

import { WOOCOMMERCE_WIDGET_TYPE } from 'state/widgets/constants'
import type { WidgetType } from 'state/widgets/types'
import BigCommerceWidget from 'Widgets/modules/BigCommerce/'
import HttpWidget from 'Widgets/modules/Http/'
import Magento2Widget from 'Widgets/modules/Magento2'
import RechargeWidget from 'Widgets/modules/Recharge'
import ShopifyWidget from 'Widgets/modules/Shopify/'
import SmileWidget from 'Widgets/modules/Smile'
import WooCommerce from 'Widgets/modules/WooCommerce'
import YotpoWidget from 'Widgets/modules/Yotpo'

import type { WidgetProps } from '../types'

const widgetByType: {
    [T in WidgetType]?: (args: WidgetProps) => React.JSX.Element
} = {
    [IntegrationType.Bigcommerce]: BigCommerceWidget,
    [IntegrationType.Http]: HttpWidget,
    [IntegrationType.Magento2]: Magento2Widget,
    [IntegrationType.Recharge]: RechargeWidget,
    [IntegrationType.Shopify]: ShopifyWidget,
    [IntegrationType.Smile]: SmileWidget,
    [WOOCOMMERCE_WIDGET_TYPE]: WooCommerce,
    [IntegrationType.Yotpo]: YotpoWidget,
}

export function getWidgetByType(type: WidgetType) {
    return widgetByType[type]
}
