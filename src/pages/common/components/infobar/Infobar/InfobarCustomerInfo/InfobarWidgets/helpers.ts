import _snakeCase from 'lodash/snakeCase'

import {IntegrationType} from 'models/integration/constants'
import {Integration} from 'models/integration/types'
import {isSourceRecord, Source, Template} from 'models/widget/types'
import {renderTemplate} from 'pages/common/utils/template'
import {
    CUSTOMER_EXTERNAL_DATA_WIDGET_TYPE,
    WOOCOMMERCE_WIDGET_TYPE,
    STANDALONE_WIDGET_TYPE,
    THIRD_PARTY_APP_NAME_KEY,
} from 'state/widgets/constants'
import {WidgetType} from 'state/widgets/types'
import {humanizeString} from 'utils'

export const LABELS: {[key: string]: string} = {
    // not sure this one is needed
    [IntegrationType.Http]: 'HTTP',
    [IntegrationType.Magento2]: 'Magento',
    [CUSTOMER_EXTERNAL_DATA_WIDGET_TYPE]: 'Customer third party data',
    [STANDALONE_WIDGET_TYPE]: 'Standalone',
    [WOOCOMMERCE_WIDGET_TYPE]: 'WooCommerce',
}

export function getWidgetTitle({
    source,
    template,
    integration,
    widgetType,
    appId,
}: {
    source: Source
    template?: Maybe<Template>
    integration?: Maybe<Integration>
    widgetType: WidgetType
    appId?: Maybe<string>
}) {
    // If there is a title on the main wrapper, let’s use it
    // and discard any other logic
    let title = template?.title
    if (title) return renderTemplate(title, source)

    // @ts-ignore-next-line ecommerce is not yet typed
    if (integration?.id && integration.type !== IntegrationType.Ecommerce) {
        title = LABELS[integration.type] || humanizeString(integration.type)

        if (integration.type === IntegrationType.Http && integration.name) {
            title = integration.name
        }

        if (title) return title
    }

    if (widgetType === CUSTOMER_EXTERNAL_DATA_WIDGET_TYPE) {
        // If we can't find the third party app name then use the appId.
        // Can be the case for Placeholder names.
        title =
            (isSourceRecord(source) && source[THIRD_PARTY_APP_NAME_KEY]) ||
            appId ||
            ''

        if (title) return title
    }

    if (widgetType === WOOCOMMERCE_WIDGET_TYPE) {
        return LABELS[widgetType]
    }

    // last resort, used for standalone widgets for example
    if (template?.type === 'wrapper') {
        title = template?.widgets?.[0]?.title
    }

    return title || LABELS[widgetType] || humanizeString(widgetType)
}

export function getWidgetId(name: string) {
    return _snakeCase(name)
}
