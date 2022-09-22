import _snakeCase from 'lodash/snakeCase'
import {List, Map} from 'immutable'
import {IntegrationType} from 'models/integration/constants'
import {
    CUSTOMER_EXTERNAL_DATA_WIDGET_TYPE,
    HTTP_WIDGET_TYPE,
    THIRD_PARTY_APP_NAME_KEY,
} from 'state/widgets/constants'
import {humanizeString} from 'utils'
import {Integration} from 'models/integration/types'
import {WidgetType} from 'state/widgets/types'

const LABELS: {[key: string]: string} = {
    [IntegrationType.Http]: 'HTTP',
    [IntegrationType.Magento2]: 'Magento',
    [IntegrationType.SmoochInside]: 'Chat',
    [CUSTOMER_EXTERNAL_DATA_WIDGET_TYPE]: 'Customer third party data',
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
        [CUSTOMER_EXTERNAL_DATA_WIDGET_TYPE, HTTP_WIDGET_TYPE].includes(
            widgetType
        )
    ) {
        return widgetTitle
    }

    const thirdPartyAppName = getWidgetNameForThirdPartyApp(
        source,
        widgetType,
        widgetAppId,
        templatePath
    )
    if (thirdPartyAppName) {
        return thirdPartyAppName
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
