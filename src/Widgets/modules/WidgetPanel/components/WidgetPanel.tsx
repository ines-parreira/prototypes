import React, {ReactNode} from 'react'

import {IntegrationType} from 'models/integration/types'
import {
    CUSTOMER_EXTERNAL_DATA_WIDGET_TYPE,
    STANDALONE_WIDGET_TYPE,
    WOOCOMMERCE_WIDGET_TYPE,
} from 'state/widgets/constants'
import {WidgetType} from 'state/widgets/types'

import ColorPanel from './views/ColorPanel'

export const WIDGET_COLORS: Readonly<Partial<Record<WidgetType, string>>> = {
    [IntegrationType.Shopify]: `var(--shopifyGreen)`,
    [IntegrationType.Recharge]: `var(--rechargeBlue)`,
    [IntegrationType.Smile]: 'var(--smileYellow)',
    [IntegrationType.Magento2]: 'var(--magentoOrange)',
    [IntegrationType.Yotpo]: 'var(--yotpoBlue)',
    [IntegrationType.Klaviyo]: 'var(--klaviyoGreen)',
    [IntegrationType.BigCommerce]: 'var(--bigcommercePurple)',
    [IntegrationType.Http]: 'var(--httpMagenta)',
    [CUSTOMER_EXTERNAL_DATA_WIDGET_TYPE]: 'var(--customerExternalDataGray)',
    [WOOCOMMERCE_WIDGET_TYPE]: 'var(--woocommercePurple)',
    [STANDALONE_WIDGET_TYPE]: 'var(--main-secondary-1)',
} as const

type Props = {
    widgetType: WidgetType
    customColor?: string
    fallbackColor?: string
    children?: ReactNode
}

export default function WidgetPanel({
    widgetType,
    customColor,
    fallbackColor,
    children,
}: Props) {
    return (
        <ColorPanel
            accentColor={
                customColor || WIDGET_COLORS[widgetType] || fallbackColor
            }
        >
            {children}
        </ColorPanel>
    )
}
