import {ComponentProps} from 'react'

import {HiddenField} from 'Infobar/features/Card/display/CardEditForm'
import http from 'pages/common/components/infobar/Infobar/InfobarCustomerInfo/InfobarWidgets/widgets/http'
import magento2 from 'pages/common/components/infobar/Infobar/InfobarCustomerInfo/InfobarWidgets/widgets/magento2'
import recharge from 'pages/common/components/infobar/Infobar/InfobarCustomerInfo/InfobarWidgets/widgets/recharge'
import shopify from 'pages/common/components/infobar/Infobar/InfobarCustomerInfo/InfobarWidgets/widgets/shopify'
import smile from 'pages/common/components/infobar/Infobar/InfobarCustomerInfo/InfobarWidgets/widgets/smile'
import yotpo from 'pages/common/components/infobar/Infobar/InfobarCustomerInfo/InfobarWidgets/widgets/yotpo'
import bigcommerce from 'pages/common/components/infobar/Infobar/InfobarCustomerInfo/InfobarWidgets/widgets/bigcommerce'
import woocommerce from 'pages/common/components/infobar/Infobar/InfobarCustomerInfo/InfobarWidgets/widgets/woocommerce'
import {IntegrationType} from 'models/integration/constants'
import {Template} from 'models/widget/types'
import {WidgetType} from 'state/widgets/types'
import {WOOCOMMERCE_WIDGET_TYPE} from 'state/widgets/constants'
import Card from 'Infobar/features/Card'

export type Extensions = ComponentProps<typeof Card>['extensions'] & {
    editionHiddenFields?: HiddenField[]
}

const extensionsSeekerByType: {
    [T in WidgetType]?: (args: {template: Template}) => Extensions
} = {
    [IntegrationType.Shopify]: shopify,
    [IntegrationType.Recharge]: recharge,
    [IntegrationType.Smile]: smile,
    [IntegrationType.Magento2]: magento2,
    [IntegrationType.Http]: http,
    [IntegrationType.Yotpo]: yotpo,
    [IntegrationType.BigCommerce]: bigcommerce,
    [WOOCOMMERCE_WIDGET_TYPE]: woocommerce,
}

export function getExtensions(widgetType: WidgetType, template: Template) {
    let extensions: Extensions = {}
    const seeker = extensionsSeekerByType[widgetType]
    if (seeker) {
        extensions = seeker({template})
    }
    return extensions
}
