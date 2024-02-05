import React, {ReactNode} from 'react'

import ColorPanel from 'infobar/ui/ColorPanel'
import {WidgetType} from 'state/widgets/types'
import {
    HTTP_WIDGET_TYPE,
    MAGENTO2_WIDGET_TYPE,
    RECHARGE_WIDGET_TYPE,
    SHOPIFY_WIDGET_TYPE,
    SMILE_WIDGET_TYPE,
    YOTPO_WIDGET_TYPE,
    KLAVIYO_WIDGET_TYPE,
    BIGCOMMERCE_WIDGET_TYPE,
    CUSTOMER_EXTERNAL_DATA_WIDGET_TYPE,
    STANDALONE_WIDGET_TYPE,
    WOOCOMMERCE_WIDGET_TYPE,
} from 'state/widgets/constants'

export const WIDGET_COLORS: Readonly<Partial<Record<WidgetType, string>>> = {
    [SHOPIFY_WIDGET_TYPE]: `var(--shopifyGreen)`,
    [RECHARGE_WIDGET_TYPE]: `var(--rechargeBlue)`,
    [SMILE_WIDGET_TYPE]: 'var(--smileYellow)',
    [MAGENTO2_WIDGET_TYPE]: 'var(--magentoOrange)',
    [YOTPO_WIDGET_TYPE]: 'var(--yotpoBlue)',
    [KLAVIYO_WIDGET_TYPE]: 'var(--klaviyoGreen)',
    [BIGCOMMERCE_WIDGET_TYPE]: 'var(--bigcommercePurple)',
    [CUSTOMER_EXTERNAL_DATA_WIDGET_TYPE]: 'var(--customerExternalDataGray)',
    [WOOCOMMERCE_WIDGET_TYPE]: 'var(--woocommercePurple)',
    [STANDALONE_WIDGET_TYPE]: 'var(--main-secondary-1)',
    [HTTP_WIDGET_TYPE]: 'var(--httpMagenta)',
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
