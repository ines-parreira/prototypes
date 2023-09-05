import _snakeCase from 'lodash/snakeCase'
import {List, Map} from 'immutable'
import _last from 'lodash/last'
import {IntegrationType} from 'models/integration/constants'
import {
    CUSTOMER_EXTERNAL_DATA_WIDGET_TYPE,
    WOOCOMMERCE_WIDGET_TYPE,
    HTTP_WIDGET_TYPE,
    STANDALONE_WIDGET_TYPE,
    THIRD_PARTY_APP_NAME_KEY,
} from 'state/widgets/constants'
import {humanizeString} from 'utils'
import {Integration} from 'models/integration/types'
import {WidgetType} from 'state/widgets/types'
import {renderTemplate} from 'pages/common/utils/template'

const LABELS: {[key: string]: string} = {
    [IntegrationType.Http]: 'HTTP',
    [IntegrationType.Magento2]: 'Magento',
    [IntegrationType.SmoochInside]: 'Chat',
    [CUSTOMER_EXTERNAL_DATA_WIDGET_TYPE]: 'Customer third party data',
    [STANDALONE_WIDGET_TYPE]: 'Standalone',
}

export function getWidgetLabel(widgetType: string): string {
    const widgetTypeLowerCase = widgetType.toLowerCase()

    if (widgetTypeLowerCase in LABELS) {
        return LABELS[widgetTypeLowerCase]
    }

    return widgetType
}

export function getWidgetId(name: string): string {
    return _snakeCase(name)
}

function getWidgetNameForThirdPartyApp(
    source: List<Map<string, unknown>> | Map<string, unknown>,
    widgetType: WidgetType,
    widgetAppId: Maybe<string>,
    templatePath: string[]
) {
    let thirdPartyAppName = source.getIn(
        [THIRD_PARTY_APP_NAME_KEY],
        ''
    ) as string
    if (thirdPartyAppName) {
        return thirdPartyAppName
    }

    if (widgetType === CUSTOMER_EXTERNAL_DATA_WIDGET_TYPE) {
        thirdPartyAppName = source.getIn(
            [...templatePath, THIRD_PARTY_APP_NAME_KEY],
            ''
        ) as string

        // If we can't find the third party app name then use the appId.
        // Can be the case for Placeholder names.
        if (!thirdPartyAppName && widgetAppId) {
            thirdPartyAppName = widgetAppId
        }

        return thirdPartyAppName
    }
}

function getWidgetNameForEcommerceWidget(
    source: List<Map<string, unknown>> | Map<string, unknown>,
    widgetType: WidgetType,
    templatePath: string[]
) {
    let widgetName = source.getIn(['store', 'display_name']) as
        | string
        | undefined
    if (widgetName) {
        return widgetName
    }

    if (widgetType === WOOCOMMERCE_WIDGET_TYPE) {
        widgetName = source.getIn([
            ...templatePath,
            'store',
            'display_name',
        ]) as string | undefined

        // If we can't find the store name then use the storeUUID.
        // Can be the case for Placeholder names.
        const storeUUID = _last(templatePath)
        if (!widgetName && storeUUID) {
            widgetName = storeUUID
        }

        return widgetName
    }
}

function getWidgetNameForIntegration(integration: Integration) {
    if (integration.type === IntegrationType.Http) {
        return integration.name
    }

    if (integration.type === IntegrationType.SmoochInside) {
        return LABELS[IntegrationType.SmoochInside]
    }

    return humanizeString(integration.type)
}

type GetWidgetNameParams = {
    source: List<Map<string, unknown>> | Map<string, unknown>
    widgetType: WidgetType
    widgetAppId: Maybe<string>
    templatePath: string[]
    integration?: Integration
    widgetTitle?: string
}

export function getWidgetName({
    source,
    widgetTitle,
    widgetType,
    widgetAppId,
    templatePath,
    integration,
}: GetWidgetNameParams) {
    if (
        widgetTitle &&
        [
            WOOCOMMERCE_WIDGET_TYPE,
            CUSTOMER_EXTERNAL_DATA_WIDGET_TYPE,
            HTTP_WIDGET_TYPE,
            STANDALONE_WIDGET_TYPE,
        ].includes(widgetType)
    ) {
        let context = source.getIn(templatePath)
        if (
            !context &&
            (source.getIn([THIRD_PARTY_APP_NAME_KEY]) ||
                source.getIn(['store', 'display_name']))
        ) {
            context = source
        }

        return context
            ? renderTemplate(
                  widgetTitle,
                  (context as Map<string, unknown>).toJS()
              )
            : widgetTitle
    }

    const thirdPartyAppWidgetName = getWidgetNameForThirdPartyApp(
        source,
        widgetType,
        widgetAppId,
        templatePath
    )
    if (thirdPartyAppWidgetName) {
        return thirdPartyAppWidgetName
    }

    const ecommerceWidgetName = getWidgetNameForEcommerceWidget(
        source,
        widgetType,
        templatePath
    )
    if (ecommerceWidgetName) {
        return ecommerceWidgetName
    }

    if (integration?.id) {
        return getWidgetNameForIntegration(integration)
    }

    // as a last resort try to find a default if it was defined
    if (widgetType in LABELS) {
        return LABELS[widgetType]
    }

    return humanizeString(widgetType)
}
