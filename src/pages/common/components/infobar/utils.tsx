import React from 'react'
import {fromJS, Map, List} from 'immutable'
import _compact from 'lodash/compact'
import _concat from 'lodash/concat'
import _get from 'lodash/get'
import _initial from 'lodash/initial'
import _isArray from 'lodash/isArray'
import _isBoolean from 'lodash/isBoolean'
import _isInteger from 'lodash/isInteger'
import _isNull from 'lodash/isNull'
import _isObject from 'lodash/isObject'
import _isString from 'lodash/isString'
import _isUndefined from 'lodash/isUndefined'
import _last from 'lodash/last'
import _omitBy from 'lodash/omitBy'
import _pickBy from 'lodash/pickBy'
import _size from 'lodash/size'
import _sortBy from 'lodash/sortBy'
import _forEach from 'lodash/forEach'
import _forIn from 'lodash/forIn'
import _toLower from 'lodash/toLower'
import _max from 'lodash/max'
import momentTimezone from 'moment-timezone'
import moment, {MomentInput} from 'moment'
import ReactStars from 'react-rating-stars-component'

import {isImmutable} from 'common/utils'
import {SENTIMENT_TYPE_LOWER_BOUND, SENTIMENT_TYPE_UPPER_BOUND} from 'config'
import * as utils from 'utils'
import {reportError} from 'utils/errors'
import {Template, CardTemplate} from 'models/widget/types'
import {WidgetEnvironment} from 'state/widgets/types'
import {getSourcePathFromContext} from 'state/widgets/utils'
import {
    CUSTOM_WIDGET_TYPE,
    CUSTOMER_EXTERNAL_DATA_WIDGET_TYPE,
    CUSTOMER_ECOMMERCE_DATA_KEY,
    WOOCOMMERCE_WIDGET_TYPE,
    CUSTOMER_EXTERNAL_DATA_KEY,
    STANDALONE_WIDGET_TYPE,
} from 'state/widgets/constants'
import {DateTimeResultFormatType} from 'constants/datetime'
import DatetimeLabel from 'pages/common/utils/DatetimeLabel'
import Badge, {ColorType} from 'pages/common/components/Badge/Badge'
import EditableListWidget from 'pages/common/components/infobar/Infobar/InfobarCustomerInfo/InfobarWidgets/widgets/EditableListWidget'

import {CustomerEcommerceData} from 'models/customerEcommerceData/types'
import {formatDatetime} from 'utils'
import css from './utils.less'

/**
 * Check if is an array of objects (and no an array of string for example)
 */
export function isArrayOfObjects(
    value: any
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
    path: string | Template['absolutePath'] = []
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
    everySources = false
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
 * Return true if can display the passed widget according to passed source
 * Passed widget should be a wrapper
 */
export function canDisplayWidget(widget: Template, source: Map<any, any>) {
    if (widget.type !== 'wrapper') {
        return false
    }

    if (!widget.absolutePath?.length) {
        return false
    }

    // ex : ticket, customer, etc.
    const initialSourceName = widget.absolutePath[0] as WidgetEnvironment

    const ready = areSourcesReady(
        fromJS({
            [initialSourceName]: source.get(initialSourceName, fromJS({})),
        }),
        initialSourceName
    )

    return ready && !isWidgetEmpty(widget, source.getIn(widget.absolutePath))
}

export function isWidgetEmpty(
    widget: Template,
    source: Map<any, any> | List<any> | undefined,
    // we could find a way to not need a path here
    // by always matching source with current template
    path: Template['absolutePath'] = []
): boolean {
    switch (widget.type) {
        case 'wrapper': {
            const subWidgets = widget.widgets
            if (!subWidgets || !subWidgets.length) return true
            return subWidgets.every((subWidget) =>
                isWidgetEmpty(
                    subWidget,
                    source,
                    widget.path ? [widget.path] : undefined
                )
            )
        }
        case 'card': {
            const subWidgets = widget.widgets
            if (hasCustomAction(widget)) return false
            if (!subWidgets || !subWidgets.length) return true
            const subPath = widget.path ? [...path, widget.path] : path
            return subWidgets.every((subWidget) =>
                isWidgetEmpty(subWidget, source, subPath)
            )
        }
        case 'list': {
            const subWidgets = widget.widgets
            if (!subWidgets || !subWidgets.length) return true
            const subPath = widget.path ? [...path, widget.path] : path
            const data =
                (source?.getIn(subPath, fromJS([])) as List<any> | undefined) ||
                (fromJS([]) as List<any>)
            if (!List.isList(data)) return true
            return data.every((value, index) =>
                subWidgets.every((subWidget) =>
                    isWidgetEmpty(subWidget, source, [
                        ...subPath,
                        index?.toString() || '0',
                    ])
                )
            )
        }
        default: {
            const subPath = [...path, widget.path]
            const data = source?.getIn(subPath)
            return typeof data !== 'number' && !data
        }
    }
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
                firstWidget.get('widgets', fromJS([]))
            )
        }
    }

    return wrapperWidget
}

/**
 * Translate json to template configuration for widgets
 */
export function jsonToTemplate(value: any, key = '', isChildOfList = false) {
    try {
        // if array of objects
        if (isArrayOfObjects(value)) {
            const response: {
                path?: string
                type: string
                widgets: Record<string, unknown>[]
            } = {
                type: 'list',
                widgets: [jsonToTemplate(value[0], key, true)],
            }

            if (!isChildOfList) {
                response.path = key
            }

            return response
        }

        if (isObject(value)) {
            // remove private keys from source
            const filteredValue = _omitBy(value, (v, k: string) =>
                k.startsWith('_')
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
            _forIn(enhancedValues, (v, k) => widgets.push(jsonToTemplate(v, k)))

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
    context = WidgetEnvironment.Ticket
) {
    const defaultWidgets: Map<any, any>[] = []

    try {
        const dataSourcePaths = [
            getSourcePathFromContext(context, CUSTOM_WIDGET_TYPE) as string[],
        ]

        const mutableDataSourcePaths = [
            getSourcePathFromContext(context, 'integrations') as string[],
            getSourcePathFromContext(
                context,
                CUSTOMER_EXTERNAL_DATA_WIDGET_TYPE
            ) as string[],
            getSourcePathFromContext(
                context,
                WOOCOMMERCE_WIDGET_TYPE
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
                        fromJS({type, integrationId: parseInt(datumId)})
                    )
                }

                if (
                    mutableDataSourcePath.includes(CUSTOMER_EXTERNAL_DATA_KEY)
                ) {
                    type = CUSTOMER_EXTERNAL_DATA_WIDGET_TYPE
                    typeByPath = typeByPath.set(
                        newPath,
                        fromJS({type, appId: datumId})
                    )
                }

                if (
                    mutableDataSourcePath.includes(
                        CUSTOMER_ECOMMERCE_DATA_KEY
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
                        })
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

            const template = jsonToTemplate(source)

            if (!template || !_size(template)) {
                return null
            }

            const widgetType = typeByPath.getIn(
                [sourcePath, 'type'],
                CUSTOM_WIDGET_TYPE
            )

            return fromJS({
                type: widgetType,
                order: i,
                context,
                template: makeWrapper({child: template, widgetType}),
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
 * Return true if you can drop something at source path to a card in target path
 */
export function canDrop(
    group = '',
    targetAbsolutePath: string | Template['absolutePath'] = ''
) {
    // root source
    if (isRootSource(group)) {
        return !targetAbsolutePath
    }

    return (
        group ===
        (typeof targetAbsolutePath === 'string'
            ? targetAbsolutePath
            : targetAbsolutePath.join('.'))
    )
}

/**
 * Format some data from widget before it is display
 */
export function updateAbsolutePathAndData(
    template: Template,
    source?: Map<any, any>,
    parent?: Template
) {
    // build absolute path of widget
    const parentAbsolutePath = parent?.absolutePath
    const ownPath = template.path

    let absolutePath = template.absolutePath

    if (parentAbsolutePath) {
        absolutePath = parentAbsolutePath

        if (ownPath) {
            absolutePath = _concat(absolutePath, ownPath)
        }
    }

    const updatedTemplate = {...template, absolutePath}

    // get set of data related to new path
    const data = (ownPath ? source?.get(ownPath, undefined) : source) as
        | Map<string, unknown>
        | undefined

    return {
        updatedTemplate,
        data,
    }
}

/**
 * Return colors used by the Star Rating widgets
 */
export const StarRatingColors = Object.freeze({
    color: '#E8EBEF',
    activeColor: '#FDAB40',
})

/**
 * Return a field value based on raw incoming data and a field type
 */
export function guessFieldValueFromRawData(
    potentiallyImmutableData: unknown,
    type?: string,
    integrationType?: string
) {
    let assignedType = type
    const fallbackValue = '-'
    const data = (
        isImmutable(potentiallyImmutableData)
            ? potentiallyImmutableData.toJS()
            : potentiallyImmutableData
    ) as unknown

    if (_isUndefined(data) || _isNull(data)) {
        return fallbackValue
    }

    if (!type) {
        if (_isBoolean(data)) {
            assignedType = 'boolean'
        } else if (_isString(data) || typeof data === 'number') {
            assignedType = 'text'
        } else if (_isArray(data)) {
            assignedType = 'array'
        } else {
            return fallbackValue
        }
    }

    switch (assignedType) {
        case 'text': {
            if ((_isString(data) && data) || typeof data === 'number') {
                return data
            }
            break
        }
        case 'date': {
            if (_isString(data) && data) {
                return (
                    <DatetimeLabel
                        dateTime={data}
                        integrationType={integrationType}
                    />
                )
            }
            break
        }
        case 'age': {
            if (_isString(data) && moment(data).isValid()) {
                return `${moment().diff(data, 'years')} (${moment(data).format(
                    'YYYY-MM-DD'
                )})`
            }
            break
        }
        case 'url': {
            if (_isString(data) && utils.isUrl(data)) {
                return (
                    <a href={data} target="_blank" rel="noopener noreferrer">
                        {data.length > 60 ? `${data.slice(0, 57)}...` : data}
                    </a>
                )
            }
            break
        }
        case 'email': {
            if (_isString(data) && utils.isEmail(data)) {
                return (
                    <a
                        href={`mailto:${data}`}
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        {data}
                    </a>
                )
            }
            break
        }
        case 'boolean': {
            let isTrue = true

            if (_isBoolean(data)) {
                isTrue = data
            }

            if (_isString(data)) {
                isTrue = data === 'true' || data.toString() === '1'
            }

            if (_isInteger(data)) {
                isTrue = data !== 0
            }

            return (
                <Badge type={isTrue ? ColorType.Success : ColorType.Error}>
                    {isTrue ? 'True' : 'False'}
                </Badge>
            )
        }
        case 'array': {
            if (_isArray(data)) {
                if (!data.length) {
                    return fallbackValue
                }
                // This case means the array was empty when the template was generated
                // so we could not guess the type of data it would contains
                if (_isObject(data[0])) {
                    return 'Undetermined value'
                }
                return data.map(
                    (val: Maybe<string | number | boolean>, index: number) => {
                        return (
                            <React.Fragment key={index}>
                                {index > 0 && ', '}
                                {val ? val.toString() : fallbackValue}
                            </React.Fragment>
                        )
                    }
                )
            }

            break
        }
        case 'sentiment': {
            const value = Number(data)
            if (!Number.isNaN(value)) {
                return (
                    <>
                        {value >= SENTIMENT_TYPE_UPPER_BOUND ? (
                            <>
                                <strong>Positive</strong>
                                <span
                                    className={`material-icons ${css.greenThumb}`}
                                >
                                    thumb_up
                                </span>
                            </>
                        ) : value <= SENTIMENT_TYPE_LOWER_BOUND ? (
                            <>
                                <strong>Negative</strong>
                                <span
                                    className={`material-icons ${css.redThumb}`}
                                >
                                    thumb_down
                                </span>
                            </>
                        ) : (
                            <>
                                <strong>Inconclusive</strong>
                            </>
                        )}
                    </>
                )
            }
            break
        }
        case 'editableList': {
            if (_isString(data)) {
                return <EditableListWidget selectedOptions={data} />
            }
            break
        }
        case 'rating': {
            const value = Number(data)
            if (!Number.isNaN(value)) {
                const starRatings = {
                    activeColor: StarRatingColors.activeColor,
                    value,
                    size: 15,
                    edit: false,
                    isHalf: true,
                    color: StarRatingColors.color,
                    emptyIcon: <span className={`material-icons`}>star</span>,
                    halfIcon: (
                        <span className={`material-icons`}>star_half</span>
                    ),
                    filledIcon: <span className={`material-icons`}>star</span>,
                }
                return (
                    <>
                        <b>{value}</b>
                        <span className={css.starRatingWrapper}>
                            <ReactStars {...starRatings} />
                        </span>
                    </>
                )
            }
            break
        }
        case 'points': {
            const value = Number(data)
            if (!Number.isNaN(value)) {
                return (
                    <Badge type={ColorType.Grey}>
                        {value.toLocaleString()}
                    </Badge>
                )
            }

            break
        }
        case 'percent': {
            const value = Number(data)
            if (!Number.isNaN(value)) {
                return value.toString() + '%'
            }

            break
        }
    }

    return _isString(data) && data ? data : fallbackValue
}

export function stringifyRawData(data: any, type: string): string | null {
    if (_isUndefined(data) || _isNull(data)) {
        return null
    }

    switch (type) {
        case 'text': {
            return (data as string).toString()
        }
        case 'date': {
            if (moment(data).isValid()) {
                return moment(data).format()
            }
            break
        }
        case 'url': {
            if (_isString(data) && utils.isUrl(data)) {
                return data
            }
            break
        }
        case 'email': {
            if (_isString(data) && utils.isEmail(data)) {
                return data
            }
            break
        }
        case 'age': {
            if (moment(data).isValid()) {
                return `${moment().diff(data, 'years')} (${moment(data).format(
                    'YYYY-MM-DD'
                )})`
            }
            break
        }
        case 'boolean': {
            let isTrue = true

            if (_isBoolean(data)) {
                isTrue = data
            }

            if (_isString(data)) {
                isTrue = data === 'true' || data.toString() === '1'
            }

            if (_isInteger(data)) {
                isTrue = data !== 0
            }

            return isTrue ? 'true' : 'false'
        }
        case 'rating': {
            const value = Number(data)
            if (!Number.isNaN(value)) {
                return value.toString()
            }
            break
        }
        case 'sentiment': {
            const value = Number(data)

            if (!Number.isNaN(value)) {
                if (value >= SENTIMENT_TYPE_UPPER_BOUND) {
                    return 'Positive'
                } else if (value <= SENTIMENT_TYPE_UPPER_BOUND) {
                    return 'Negative'
                }

                return 'Inconclusive'
            }
            break
        }
        case 'points': {
            const value = Number(data)
            if (!Number.isNaN(value)) {
                return value.toLocaleString()
            }

            break
        }
        case 'percent': {
            const value = Number(data)
            if (!Number.isNaN(value)) {
                return value.toString() + '%'
            }
            break
        }
    }
    return null
}

/**
 * Return the local time in string format, based on the UTC offset value
 */
export function getLocalTime(
    timezoneOffset: string,
    datetimeFormat: DateTimeResultFormatType
) {
    const timezoneDifference = parseInt(timezoneOffset.substring(0, 3))
    const localTime = moment.utc().utcOffset(timezoneDifference)

    return formatDatetime(localTime, datetimeFormat).toString()
}

/**
 * Return the prettified last seen on chat string, based on the UTC timestamp received from the chat
 */
export function getDisplayCustomerLastSeenOnChat(
    customerLastSeenOnChatUtcDateTimeStamp: MomentInput,
    timezone: string | null,
    referenceDay: MomentInput = null
) {
    const now = momentTimezone.utc()
    const customerLastSeenOnChatUtcDateTime = momentTimezone.utc(
        customerLastSeenOnChatUtcDateTimeStamp
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

export function getInfobarMinWidth() {
    return _max([window.innerWidth / 5.1, 350])
}

export function getInfobarWidth() {
    return window.localStorage.getItem('infobar-width')
}
