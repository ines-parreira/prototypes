// flow

import _capitalize from 'lodash/capitalize'

import {HTTP_WIDGET_TYPE, MAGENTO2_WIDGET_TYPE, SMOOCH_INSIDE_WIDGET_TYPE} from './constants'

const labels = {
    [HTTP_WIDGET_TYPE]: 'HTTP',
    [MAGENTO2_WIDGET_TYPE]: 'Magento',
    [SMOOCH_INSIDE_WIDGET_TYPE]: 'Chat',
}

export function getWidgetLabel(widgetType: string): string {
    if (labels[widgetType]) {
        return labels[widgetType]
    }

    return _capitalize(widgetType)
}
