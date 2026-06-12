import { reportError } from '@repo/logging'
import type { List, Map } from 'immutable'
import { fromJS } from 'immutable'
import _compact from 'lodash/compact'
import _forEach from 'lodash/forEach'
import _forIn from 'lodash/forIn'
import _get from 'lodash/get'
import _initial from 'lodash/initial'
import _isArray from 'lodash/isArray'
import _isBoolean from 'lodash/isBoolean'
import _isObject from 'lodash/isObject'
import _isString from 'lodash/isString'
import _last from 'lodash/last'
import _omitBy from 'lodash/omitBy'
import _pickBy from 'lodash/pickBy'
import _size from 'lodash/size'
import _sortBy from 'lodash/sortBy'
import _toLower from 'lodash/toLower'
import type { MomentInput } from 'moment'
import moment from 'moment'
import momentTimezone from 'moment-timezone'

import { isImmutable } from 'common/utils'
import type { CustomerEcommerceData } from 'models/customerEcommerceData/types'
import type { CardTemplate, Source, Template } from 'models/widget/types'
import {
    isCardTemplate,
    isListTemplate,
    isSourceRecord,
    isWrapperTemplate,
} from 'models/widget/types'
import {
    CUSTOM_WIDGET_TYPE,
    CUSTOMER_ECOMMERCE_DATA_KEY,
    CUSTOMER_EXTERNAL_DATA_KEY,
    CUSTOMER_EXTERNAL_DATA_WIDGET_TYPE,
    STANDALONE_WIDGET_TYPE,
    WOOCOMMERCE_WIDGET_TYPE,
} from 'state/widgets/constants'
import { WidgetEnvironment } from 'state/widgets/types'
import { getSourcePathFromContext } from 'state/widgets/utils'
import * as utils from 'utils'

/**
 * Check if is an array of objects (and no an array of string for example)
 */
export function isArrayOfObjects(
    value: any,
): value is Record<string, unknown>[] {
    return _isArray(value) && !!value.length && _isObject(value[0])
}

/**
 * Check if is a real object (since arrays are objects, we just want objects (no arrays) here)
 */
export function isObject(value: any) {
    return !!value && _isObject(value) && !_isArray(value)
}

/**
 * Check if a widget is a simple field (not a card or a list)
 */
export function isSimpleTemplateWidget(widget: Template) {
    if (typeof widget === 'undefined') return true
    return !['card', 'list'].includes(widget.type)
}

/**
 * Check if a widget does not contain any simple widget (ie. only complex widgets such as cards or lists)
 * If it contains at least a card, or a list, etc. it returns false
 */
export function hasNoSimpleWidget(widget: Template) {
    const children = widget.widgets || []
    return !children.some(isSimpleTemplateWidget)
}

export function isUppercase(string: string) {
    return string === string.toUpperCase()
}

/**
 * Return true if passed customer data is valid (Immutable Map, etc.)
 */
export const isCustomerDataValid = (data: any): data is Map<any, any> => {
    return !!data && isImmutable(data)
}

/**
 * Return true if passed customer data is valid and not empty
 */
export const isCustomerDataPresent = (data: any) => {
    return isCustomerDataValid(data) && !data.isEmpty()
}

/**
 * Remove last "[]" from the passed path
 * Ex: ticket.orders[] to ticket.orders
 */
export function stripLastListsFromPath(
    path: string | Template['absolutePath'] = [],
) {
    let newPath = path

    while (_last(newPath) === '[]') {
        newPath = _initial(newPath)
    }

    return newPath as string
}

/**
 * Return true if passed absolute path is a root source
 * Ex : ticket.customer.data
 */
export function isRootSource(group: string) {
    return group === 'root'
}

/**
 * Guess if a passed string is a date
 */
export function isDate(string: string) {
    const formats = [
        'YYYY-MM-DD LT',
        'YYYY-MM-DD h:mm:ss A',
        'YYYY-MM-DD HH:mm:ss',
        'YYYY-MM-DD HH:mm',
        'YYYY-MM-DD',
        'YYYY-MM-DDThh:mm',
        'YYYY-MM-DDThh:mm:ss',
        'YYYY-MM-DDThh:mm:ss.s',
        'YYYY-MM-DDThh:mmTZD',
        'YYYY-MM-DDThh:mm:ssTZD',
        'YYYY-MM-DDThh:mm:ss.sTZD',
    ]

    return moment(string, formats, true).isValid()
}

/**
 * Guess if a passed string is a boolean
 */
export function isBoolean(string: any) {
    if (_isBoolean(string)) {
        return true
    }

    if (_isString(string)) {
        return string === 'true' || string === 'false'
    }

    return false
}

/**
 * Return true if sources exist and are not empty
 */
export function areSourcesReady(
    sources: Map<any, any>,
    context: WidgetEnvironment,
    everySources = false,
): boolean {
    // for every source
    const currentSource = sources.get(context) as Map<any, any>

    // get the paths we have to search in
    const sourcePaths = getSourcePathFromContext(context) as string[][]

    if (!sourcePaths || !currentSource) {
        return false
    }

    const condition = (sourcePath: string[]) => {
        // we remove the first property of the source origin path since we are searching directly in the source
        // ex : we transform ticket.customer.data into ['customer', 'data']
        const immutableSourcePath = sourcePath.slice(1)

        const sourceData = currentSource.getIn(immutableSourcePath, fromJS({}))

        return isCustomerDataPresent(sourceData)
    }

    return everySources
        ? sourcePaths.every(condition)
        : sourcePaths.some(condition)
}

/**
 * Return true if can display the passed template according to passed source
 * Passed template should be a wrapper
 */
export function canDisplayWidget(
    template: Template,
    environmentData: Map<string, unknown>,
    source: Source,
) {
    if (template.type !== 'wrapper') {
        return false
    }

    return !isWidgetEmpty(template, source)
}

export function isWidgetEmpty(template: Template, source: Source): boolean {
    const data =
        isSourceRecord(source) && template.path ? source[template.path] : source

    if (isWrapperTemplate(template)) {
        const childTemplates = template.widgets
        if (!childTemplates || !childTemplates.length) return true
        return childTemplates.every((subWidget) =>
            isWidgetEmpty(subWidget, data),
        )
    }

    if (isCardTemplate(template)) {
        const childTemplates = template.widgets
        if (hasCustomAction(template)) return false
        if (!childTemplates || !childTemplates.length) return true
        return childTemplates.every((subWidget) =>
            isWidgetEmpty(subWidget, data),
        )
    }

    if (isListTemplate(template)) {
        const childTemplate = template.widgets?.[0]
        if (!childTemplate) return true
        if (!Array.isArray(data)) return true
        return data.every((value) => isWidgetEmpty(childTemplate, value))
    }

    return typeof data !== 'number' && !data
}

export function hasCustomAction(widget: CardTemplate) {
    const links = widget.meta?.custom?.links
    const buttons = widget.meta?.custom?.buttons
    return Boolean((links && links.length) || (buttons && buttons.length))
}

export function makeWrapper({
    child,
    widgetType,
}: {
    child: Map<any, any> | Record<string, unknown>
    widgetType: string
}) {
    let wrapperWidget = fromJS({
        type: 'wrapper',
        widgets: [child],
    }) as Map<any, any>

    // we don't want to display a card around data in wrapper (unnecessary nesting)
    // if there is only a card in the wrapper and no simple widget in this card (ie. only cards or lists) we move those
    // children into the wrapper directly instead of letting them in the card
    if (widgetType !== STANDALONE_WIDGET_TYPE) {
        const firstWidget = (
            wrapperWidget.get('widgets', fromJS([])) as List<any>
        ).first() as Map<any, any>
        if (hasNoSimpleWidget(firstWidget.toJS())) {
            wrapperWidget = wrapperWidget.set(
                'widgets',
                firstWidget.get('widgets', fromJS([])),
            )
        }
    }

    return wrapperWidget
}

/**
 * Translate json to template configuration for widgets
 */
export function jsonToTemplate(
    value: any,
    key = '',
    isChildOfList = false,
    isShopifyContext = false,
) {
    try {
        // if array of objects
        if (isArrayOfObjects(value)) {
            const response: {
                path?: string
                type: string
                widgets: Record<string, unknown>[]
            } = {
                type: 'list',
                widgets: [
                    jsonToTemplate(value[0], key, true, isShopifyContext),
                ],
            }

            if (!isChildOfList) {
                response.path = key
            }

            return response
        }

        if (isObject(value)) {
            // Filter private keys always, metafields only in Shopify context
            const filteredValue = _omitBy(
                value,
                (v, k: string) =>
                    k.startsWith('_') ||
                    (isShopifyContext && k === 'metafields'),
            )

            let enhancedValues: Record<string, unknown> = {}

            // order keys in alphabetical order
            _sortBy(Object.keys(filteredValue), _toLower).forEach((v) => {
                enhancedValues[v] = filteredValue[v]
            })

            // order keys by simple fields, then objects and finally arrays
            enhancedValues = {
                ..._pickBy(enhancedValues, (v) => {
                    return !isObject(v) && !isArrayOfObjects(v)
                }),
                ..._pickBy(enhancedValues, isObject),
                ..._pickBy(enhancedValues, isArrayOfObjects),
            }

            const widgets: Record<string, unknown>[] = []
            _forIn(enhancedValues, (v, k) =>
                widgets.push(jsonToTemplate(v, k, false, isShopifyContext)),
            )

            const response: {
                type: string
                title: string
                widgets: Record<string, unknown>[]
                path?: string
            } = {
                type: 'card',
                title: utils.humanizeString(key),
                widgets,
            }

            if (!isChildOfList) {
                response.path = key
            }

            return response
        }

        // other kind of field
        let type = 'text'

        if (_isArray(value)) {
            type = 'array'
        } else if (key === 'birthday') {
            type = 'age'
        } else if (isBoolean(value)) {
            type = 'boolean'
        } else if (utils.isEmail(value)) {
            type = 'email'
        } else if (utils.isUrl(value)) {
            type = 'url'
        } else if (isDate(value)) {
            type = 'date'
        }

        const response: {
            type: string
            title: string
            path?: string
        } = {
            type,
            title: isUppercase(key) ? key : utils.humanizeString(key),
        }

        // if is child of list, we do not set its path since the list already has it
        if (!isChildOfList) {
            response.path = key
        }

        return response
    } catch (err) {
        reportError(err, {
            extra: {
                description: 'Conversion of json to widgets failed',
                json: value,
                key,
            },
        })
        return {}
    }
}

/**
 * Transform a json to template configuration and adapt it for infobar display
 */
export function jsonToWidgets(
    json: Record<string, unknown>,
    context = WidgetEnvironment.Ticket,
) {
    const defaultWidgets: Map<string, unknown>[] = []

    try {
        const dataSourcePaths = [
            getSourcePathFromContext(context, CUSTOM_WIDGET_TYPE) as string[],
        ]

        const mutableDataSourcePaths = [
            getSourcePathFromContext(context, 'integrations') as string[],
            getSourcePathFromContext(
                context,
                CUSTOMER_EXTERNAL_DATA_WIDGET_TYPE,
            ) as string[],
            getSourcePathFromContext(
                context,
                WOOCOMMERCE_WIDGET_TYPE,
            ) as string[],
        ]

        let typeByPath = fromJS({}) as Map<any, any>
        mutableDataSourcePaths.forEach((mutableDataSourcePath) => {
            const data = _get(json, mutableDataSourcePath, {}) as Record<
                string,
                unknown
            >
            // Transform:
            //  [
            //      ['customer', 'integrations'],
            //      ['customer', CUSTOMER_EXTERNAL_DATA_KEY]
            //      ['customer', CUSTOMER_ECOMMERCE_DATA_KEY]
            //  ]
            // To:
            //  [
            //      ['customer', 'integrations', '1'], ['customer', 'integrations', '2'],
            //      ['customer', CUSTOMER_EXTERNAL_DATA_KEY, 'fooBarAppId'], ['customer', CUSTOMER_EXTERNAL_DATA_KEY, 'fooBarAppId2']
            //      ['customer', CUSTOMER_ECOMMERCE_DATA_KEY, 'foo-bar-store-uuid'], ['customer', CUSTOMER_ECOMMERCE_DATA_KEY, 'foo-bar-store-uuid2']
            //  ]
            _forEach(data, (datum, datumId) => {
                // datum = integrations, CUSTOMER_EXTERNAL_DATA_KEY or CUSTOMER_ECOMMERCE_DATA_KEY
                // datumId = integrationId, appId or storeUuid

                const newPath = mutableDataSourcePath.slice()
                newPath.push(datumId.toString())

                let type = null

                if (mutableDataSourcePath.includes('integrations')) {
                    type = (datum as Record<string, unknown>)[
                        '__integration_type__'
                    ]
                    typeByPath = typeByPath.set(
                        newPath,
                        fromJS({ type, integrationId: parseInt(datumId) }),
                    )
                }

                if (
                    mutableDataSourcePath.includes(CUSTOMER_EXTERNAL_DATA_KEY)
                ) {
                    type = CUSTOMER_EXTERNAL_DATA_WIDGET_TYPE
                    typeByPath = typeByPath.set(
                        newPath,
                        fromJS({ type, appId: datumId }),
                    )
                }

                if (
                    mutableDataSourcePath.includes(
                        CUSTOMER_ECOMMERCE_DATA_KEY,
                    ) &&
                    (datum as CustomerEcommerceData).store.type ===
                        WOOCOMMERCE_WIDGET_TYPE
                ) {
                    type = WOOCOMMERCE_WIDGET_TYPE
                    typeByPath = typeByPath.set(
                        newPath,
                        fromJS({
                            type,
                            integrationId: (datum as CustomerEcommerceData)
                                .store.helpdesk_integration_id,
                        }),
                    )
                }

                if (!type) return // equivalent to continue in normal for loops

                dataSourcePaths.push(newPath)
            })
        })

        const widgets = dataSourcePaths.map((sourcePath, i) => {
            let source = _get(json, sourcePath, {}) as Record<string, unknown>

            // remove private keys from source before we transform it into a template
            source = _omitBy(source, (v, k: string) => k.startsWith('_'))

            if (!source || !_size(source)) {
                return null
            }

            const widgetType = typeByPath.getIn(
                [sourcePath, 'type'],
                CUSTOM_WIDGET_TYPE,
            )
            const isShopifyContext = widgetType === 'shopify'

            const template = jsonToTemplate(source, '', false, isShopifyContext)

            /* istanbul ignore next, defensive check */
            if (!template || !_size(template)) {
                return null
            }

            return fromJS({
                type: widgetType,
                order: i,
                context,
                template: makeWrapper({ child: template, widgetType }),
                sourcePath,
                integration_id:
                    typeByPath.getIn([sourcePath, 'integrationId']) || null,
                app_id: typeByPath.getIn([sourcePath, 'appId']) || null,
            }) as Map<string, unknown>
        })

        // remove null widgets
        return _compact(widgets)
    } catch (err) {
        reportError(err, {
            extra: {
                description:
                    'Conversion of json to infobar widgets template failed',
                json,
                context,
            },
        })
        return defaultWidgets
    }
}

/**
 * Return the prettified last seen on chat string, based on the UTC timestamp received from the chat
 */
export function getDisplayCustomerLastSeenOnChat(
    customerLastSeenOnChatUtcDateTimeStamp: MomentInput,
    timezone: string | null,
    referenceDay: MomentInput = null,
) {
    const now = momentTimezone.utc()
    const customerLastSeenOnChatUtcDateTime = momentTimezone.utc(
        customerLastSeenOnChatUtcDateTimeStamp,
    )

    const diff = now.diff(customerLastSeenOnChatUtcDateTime)
    const diffDuration = momentTimezone.duration(diff)
    const minusDiffDuration = momentTimezone.duration(diff * -1)

    if (diffDuration.asSeconds() < 125) {
        // 2 minutes and 5 seconds
        return 'now'
    }
    if (diffDuration.asMinutes() < 59) {
        return minusDiffDuration.humanize(true)
    }

    // the same way we display it on the ticket messages
    return timezone
        ? customerLastSeenOnChatUtcDateTime
              .tz(timezone)
              .calendar(referenceDay, {
                  lastWeek: 'dddd', // Tuesday, Friday, etc.. The default is: [Last] dddd
              })
        : customerLastSeenOnChatUtcDateTime.calendar(referenceDay, {
              lastWeek: 'dddd',
          })
}
