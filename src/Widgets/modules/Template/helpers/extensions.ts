import http from 'pages/common/components/infobar/Infobar/InfobarCustomerInfo/InfobarWidgets/widgets/http'
import magento2 from 'pages/common/components/infobar/Infobar/InfobarCustomerInfo/InfobarWidgets/widgets/magento2'
import recharge from 'pages/common/components/infobar/Infobar/InfobarCustomerInfo/InfobarWidgets/widgets/recharge'
import smile from 'pages/common/components/infobar/Infobar/InfobarCustomerInfo/InfobarWidgets/widgets/smile'
import yotpo from 'pages/common/components/infobar/Infobar/InfobarCustomerInfo/InfobarWidgets/widgets/yotpo'
import bigcommerce from 'pages/common/components/infobar/Infobar/InfobarCustomerInfo/InfobarWidgets/widgets/bigcommerce'
import woocommerce from 'pages/common/components/infobar/Infobar/InfobarCustomerInfo/InfobarWidgets/widgets/woocommerce'
import {IntegrationType} from 'models/integration/constants'
import {Template} from 'models/widget/types'
import {WidgetType} from 'state/widgets/types'
import {WOOCOMMERCE_WIDGET_TYPE} from 'state/widgets/constants'
import {CardCustomization} from 'Widgets/modules/Template/modules/Card'

import {TemplateCustomization} from '../types'

const customizationSeekerByType: {
    [T in WidgetType]?: (args: {template: Template}) => CardCustomization
} = {
    [IntegrationType.Recharge]: recharge,
    [IntegrationType.Smile]: smile,
    [IntegrationType.Magento2]: magento2,
    [IntegrationType.Http]: http,
    [IntegrationType.Yotpo]: yotpo,
    [IntegrationType.BigCommerce]: bigcommerce,
    [WOOCOMMERCE_WIDGET_TYPE]: woocommerce,
}

export function getExtensions(widgetType: WidgetType, template: Template) {
    let customization: CardCustomization = {}
    const seeker = customizationSeekerByType[widgetType]
    if (seeker) {
        customization = seeker({template})
    }
    return customization
}

export function seekCardCustomization(
    cardExtensionArray: TemplateCustomization['card'],
    template: Template
) {
    const path = (template.absolutePath || []).join('.')
    let customization: CardCustomization = {}
    if (cardExtensionArray) {
        cardExtensionArray.some(
            ({matcher, customization: matchedExtensions}) => {
                if (matcher.test(path)) {
                    customization = matchedExtensions
                    return true
                }
                return false
            }
        )
    }
    return customization
}
