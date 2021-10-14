import _capitalize from 'lodash/capitalize'

import {IntegrationType} from '../../models/integration/types'

const labels: {[key: string]: string} = {
    [IntegrationType.Http]: 'HTTP',
    [IntegrationType.Magento2]: 'Magento',
    [IntegrationType.SmoochInside]: 'Chat',
}

export function getWidgetLabel(widgetType: string): string {
    if (labels[widgetType]) {
        return labels[widgetType]
    }

    return _capitalize(widgetType)
}
