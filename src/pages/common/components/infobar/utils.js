// @flow
import React from 'react'
import {fromJS, type Map} from 'immutable'
import {Badge} from 'reactstrap'
import _compact from 'lodash/compact'
import _concat from 'lodash/concat'
import _get from 'lodash/get'
import _includes from 'lodash/includes'
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
import moment from 'moment'

import ReactStars from 'react-rating-stars-component'

import {DatetimeLabel} from '../../utils/labels.tsx'
import * as utils from '../../../../utils.ts'
import {
    getContextFromSourcePath,
    getSourcePathFromContext,
} from '../../../../state/widgets/utils.ts'

import {
    SENTIMENT_TYPE_LOWER_BOUND,
    SENTIMENT_TYPE_UPPER_BOUND,
} from '../../../../config.ts'
import {reportError} from '../../../../utils/errors.ts'

import css from './utils.less'
import EditableListWidget from './Infobar/InfobarCustomerInfo/InfobarWidgets/widgets/EditableListWidget.tsx'

/**
 * Check if is an array of objects (and no an array of string for example)
 * @param value
 * @returns {*|boolean}
 */
export function isArrayOfObjects(value: any) {
    return _isArray(value) && !!value.length && _isObject(value[0])
}

/**
 * Check if is a real object (since arrays are objects, we just want objects (no arrays) here)
 * @param value
 * @returns {boolean}
 */
export function isObject(value: any) {
    return !!value && _isObject(value) && !_isArray(value)
}

/**
 * Check if a widget is a simple field (not a card or a list)
 * @param widget
 * @returns {boolean}
 */
export function isSimpleTemplateWidget(widget: Map<any, any>) {
    return !['card', 'list'].includes(widget.get('type'))
}

/**
 * Check if a widget does not contain any simple widget (ie. only complex widgets such as cards or lists)
 * If it contains at least a card, or a list, etc. it returns false
 * @param widget
 * @returns {boolean}
 */
export function hasNoSimpleWidget(widget: Map<any, any>) {
    return !widget.get('widgets', fromJS([])).some(isSimpleTemplateWidget)
}

export function isUppercase(string: string) {
    return string === string.toUpperCase()
}

/**
 * Return true if passed customer data is valid (Immutable Map, etc.)
 * @param data
 * @returns {boolean}
 */
export const isCustomerDataValid = (data: any) => {
    return !!data && utils.isImmutable(data)
}

/**
 * Return true if passed customer data is valid and not empty
 * @param data
 * @returns {boolean}
 */
export const isCustomerDataPresent = (data: any) => {
    return isCustomerDataValid(data) && !data.isEmpty()
}

/**
 * Remove last "[]" from the passed path
 * Ex: ticket.orders[] to ticket.orders
 * @param path
 * @returns {*}
 */
export function stripLastListsFromPath(path?: any[] = []) {
    let newPath = path

    while (_last(newPath) === '[]') {
        newPath = _initial(newPath)
    }

    return newPath
}

/**
 * Return true if passed absolute path is a root source
 * Ex : ticket.customer.data
 * @param group (= absolute path OR 'root')
 * @returns {*}
 */
export function isRootSource(group: string) {
    return group === 'root'
}

/**
 * Guess if a passed string is a date
 * @param string
 * @returns {boolean|*}
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
 * @param string
 * @returns {boolean}
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
 * @param sources
 * @param context
 * @param everySources
 * @returns {*|boolean}
 */
export function areSourcesReady(
    sources: Map<any, any>,
    context: string,
    everySources?: boolean = false
): boolean {
    // for every source
    const currentSource = sources.get(context)

    // get the paths we have to search in
    const sourcePaths = getSourcePathFromContext(context)

    if (!sourcePaths || !currentSource) {
        return false
    }

    const condition = everySources ? 'every' : 'some'

    return sourcePaths[condition]((sourcePath) => {
        // we remove the first property of the source origin path since we are searching directly in the source
        // ex : we transform ticket.customer.data into ['customer', 'data']
        const immutableSourcePath = sourcePath.slice(1)

        const sourceData = currentSource.getIn(immutableSourcePath, fromJS({}))

        return isCustomerDataPresent(sourceData)
    })
}

/**
 * Return true if can display the passed widget according to passed source
 * Passed widget should be a wrapper
 * @param widget
 * @param source
 * @returns {boolean}
 */
export function canDisplayWidget(widget: Map<any, any>, source: Map<any, any>) {
    if (widget.get('type') !== 'wrapper') {
        return false
    }

    const splitPath = widget.get('path', '')

    if (!splitPath.length) {
        return false
    }

    // ex : ticket, customer, etc.
    const initialSourceName = splitPath[0]

    const ready = areSourcesReady(
        fromJS({
            [initialSourceName]: source.get(initialSourceName, fromJS({})),
        }),
        initialSourceName
    )

    return ready && !isWidgetEmpty(widget, source)
}

export function isWidgetEmpty(
    widget: Map<any, any>,
    source: Map<any, any>,
    path?: string[] = []
) {
    switch (widget.get('type')) {
        case 'wrapper': {
            const subPath = widget.get('path')
            return widget
                .get('widgets', [])
                .every((subWidget) => isWidgetEmpty(subWidget, source, subPath))
        }
        case 'card': {
            const subPath = widget.get('path')
                ? [...path, widget.get('path')]
                : path
            return widget
                .get('widgets', [])
                .every((subWidget) => isWidgetEmpty(subWidget, source, subPath))
        }
        case 'list': {
            const subPath = widget.get('path')
                ? [...path, widget.get('path')]
                : path
            const data = source.getIn(subPath, [])

            return data.every((value, index) =>
                widget
                    .get('widgets', [])
                    .every((subWidget) =>
                        isWidgetEmpty(subWidget, source, [...subPath, index])
                    )
            )
        }
        default: {
            const subPath = [...path, widget.get('path')]
            const data = source.getIn(subPath, null)
            return data === null || data === ''
        }
    }
}

export function makeWrapper({
    order,
    context,
    child,
    sourcePath,
    widgetType,
    integrationId,
}: {
    order: number,
    context: string,
    child: Map<any, any>,
    sourcePath: string,
    widgetType: ?string,
    integrationId: ?number,
}) {
    let type = getContextFromSourcePath(sourcePath).type

    if (widgetType) {
        type = widgetType
    }

    let wrapperWidget = fromJS({
        type: 'wrapper',
        widgets: [child],
    })

    // we don't want to display a card around data in wrapper (unnecessary nesting)
    // if there is only a card in the wrapper and no simple widget in this card (ie. only cards or lists) we move those
    // children into the wrapper directly instead of letting them in the card
    const firstWidget = wrapperWidget.get('widgets', fromJS([])).first()
    if (hasNoSimpleWidget(firstWidget)) {
        wrapperWidget = wrapperWidget.set(
            'widgets',
            firstWidget.get('widgets', fromJS([]))
        )
    }

    return fromJS({
        type,
        order,
        context,
        template: wrapperWidget,
        sourcePath,
        integration_id: integrationId,
    })
}

/**
 * Translate json to template configuration for widgets
 * @param value
 * @param key
 * @param isChildOfList
 * @returns {*}
 */
export function jsonToWidget(
    value: any,
    key?: string = '',
    isChildOfList?: boolean = false
) {
    try {
        // if array of objects
        if (isArrayOfObjects(value)) {
            const response: {
                path?: string,
                type: string,
                widgets: Object[],
            } = {
                type: 'list',
                widgets: [jsonToWidget(value[0], key, true)],
            }

            if (!isChildOfList) {
                response.path = key
            }

            return response
        }

        // if object (and not an array, since Array is an Object in JS)
        if (isObject(value)) {
            // remove private keys from source
            const filteredValue = _omitBy(value, (v, k: string) =>
                k.startsWith('_')
            )

            let enhancedValues = {}

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

            const widgets = []
            _forIn(enhancedValues, (v, k) => widgets.push(jsonToWidget(v, k)))

            const response: {
                type: string,
                title: string,
                widgets: Object[],
                path?: string,
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
            type: string,
            title: string,
            path?: string,
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
 * @param json
 * @param context
 * @returns {*}
 */
export function jsonToWidgets(
    json: Object,
    context?: string = 'ticket'
): any[] {
    const defaultResponse = []

    try {
        const sourcePaths = getSourcePathFromContext(context)
        const integrationsPath = sourcePaths.find((path) => {
            return _includes(path, 'integrations')
        })

        const integrationsData = _get(json, integrationsPath, {})

        let typeByPath = fromJS({})

        // Add all `sourcePaths` matching integrations data
        // Transform:
        //  [['customer', 'data'], ['customer', 'integrations']]
        // To:
        //  [['customer', 'data'], ['customer', 'integrations', '1'], ['customer', 'integrations', '2']]
        _forEach(integrationsData, (integrationData, integrationId) => {
            const newPath = integrationsPath.slice()
            newPath.push(integrationId.toString())
            typeByPath = typeByPath.set(
                newPath,
                fromJS({
                    type: integrationData['__integration_type__'],
                    integrationId,
                })
            )
            sourcePaths.push(newPath)
        })

        const idx = sourcePaths.indexOf(integrationsPath)
        sourcePaths.splice(idx, 1)

        const response = sourcePaths.map((sourcePath, i) => {
            let source = _get(json, sourcePath, {})

            // remove private keys from source before we transform it into a template
            source = _omitBy(source, (v, k: string) => k.startsWith('_'))

            if (!source || !_size(source)) {
                return null
            }

            const template = jsonToWidget(source)

            if (!template || !_size(template)) {
                return null
            }

            return makeWrapper({
                order: i,
                context,
                child: template,
                sourcePath,
                widgetType: typeByPath.getIn([sourcePath, 'type']) || null,
                integrationId:
                    typeByPath.getIn([sourcePath, 'integrationId']) || null,
            })
        })

        // remove null widgets
        return _compact(response)
    } catch (err) {
        reportError(err, {
            description:
                'Conversion of json to infobar widgets template failed',
            json,
            context,
        })
        return defaultResponse
    }
}

/**
 * Return true if you can drop something at source path to a card in target path
 * @param group (= absolute path OR 'root')
 * @param targetAbsolutePath
 * @returns {boolean}
 */
export function canDrop(group?: string = '', targetAbsolutePath?: string = '') {
    // root source
    if (isRootSource(group)) {
        return !targetAbsolutePath
    }

    return group === (targetAbsolutePath: any).join('.')
}

/**
 * Format some data from widget before it is display
 * @param template
 * @param source
 * @param parent
 * @returns {{updatedWidget: *, data: *, type: *, path: *}}
 */
export function prepareWidgetToDisplay(
    template?: Map<any, any> = fromJS({}),
    source?: Map<any, any> = fromJS({}),
    parent: Map<any, any>
) {
    // build absolute path of widget
    const parentPath =
        !!parent && parent.get('absolutePath', parent.get('path', ''))
    const ownPath = template.get('path', '')

    let absolutePath = template.get('path')

    if (parentPath) {
        absolutePath = parentPath

        if (ownPath) {
            absolutePath = _concat(absolutePath, ownPath)
        }
    }

    absolutePath = utils.toJS(absolutePath)

    let updatedTemplate = template.set('absolutePath', absolutePath)
    let path = updatedTemplate.get('path', '')

    path = utils.toJS(path)

    if (path && !_isArray(path)) {
        path = [path]
    }

    updatedTemplate = updatedTemplate.set('path', path)

    // get data of widget in shortcuts
    const data = path ? source.getIn(path) : source
    const type = updatedTemplate.get('type', '')

    return {
        updatedTemplate,
        data,
        type,
        path,
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
 * @param data
 * @param type
 * @returns {string}
 */
export function guessFieldValueFromRawData(data: any, type: string) {
    let fieldValue = ''

    if (_isUndefined(data) || _isNull(data)) {
        return fieldValue
    }

    if (_isString(data)) {
        fieldValue = data
    }

    switch (type) {
        case 'text': {
            fieldValue = data
            break
        }
        case 'date': {
            fieldValue = <DatetimeLabel dateTime={data} />
            break
        }
        case 'age': {
            if (moment(data).isValid()) {
                fieldValue = moment().diff(data, 'years')
                fieldValue += ` (${moment(data).format('YYYY-MM-DD')})`
            }
            break
        }
        case 'url': {
            if (utils.isUrl(data)) {
                fieldValue = (
                    <a href={data} target="_blank" rel="noopener noreferrer">
                        {data.length > 60 ? `${data.slice(0, 57)}...` : data}
                    </a>
                )
            }
            break
        }
        case 'email': {
            if (utils.isEmail(data)) {
                fieldValue = (
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

            fieldValue = (
                <Badge pill color={isTrue ? 'success' : 'danger'}>
                    {isTrue ? 'True' : 'False'}
                </Badge>
            )
            break
        }
        case 'array': {
            if (_isArray(data)) {
                fieldValue = data.join(', ')
            }
            break
        }
        case 'sentiment': {
            if (!isNaN(data)) {
                fieldValue = (
                    <>
                        {parseFloat(data) >= SENTIMENT_TYPE_UPPER_BOUND ? (
                            <>
                                <strong>Positive</strong>
                                <span
                                    className={`material-icons ${css.greenThumb}`}
                                >
                                    thumb_up
                                </span>
                            </>
                        ) : parseFloat(data) <= SENTIMENT_TYPE_LOWER_BOUND ? (
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
            fieldValue = <EditableListWidget selectedOptions={data} />
            break
        }
        case 'rating': {
            if (!isNaN(data)) {
                const starRatings = {
                    activeColor: StarRatingColors.activeColor,
                    value: parseFloat(data),
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
                fieldValue = (
                    <>
                        <b>{data}</b>
                        <span className={css.starRatingWrapper}>
                            <ReactStars {...starRatings} />
                        </span>
                    </>
                )
            }
            break
        }
        case 'points': {
            if (!isNaN(data)) {
                fieldValue = (
                    <Badge pill color="primary">
                        {parseFloat(data).toLocaleString()}
                    </Badge>
                )
            }

            break
        }
        case 'percent': {
            if (!isNaN(data)) {
                fieldValue = data.toString() + '%'
            }

            break
        }
        default:
    }

    return fieldValue
}

/**
 * Display a widget field label (before the value)
 * @param label
 * @returns {*}
 */
export const displayLabel = (label: any) => {
    const defaultLabel = '-'

    if (_isUndefined(label)) {
        return defaultLabel
    }

    if (_isNull(label)) {
        return defaultLabel
    }

    if (_isString(label) && !label) {
        return defaultLabel
    }

    return label
}

/**
 * Return the local time in string format, based on the UTC offset value
 * @param timezoneOffset {string} // '+0100' (e.g: for Paris)
 * @returns {string}
 */
export function getLocalTime(timezoneOffset: string) {
    const timezoneDifference = parseInt(timezoneOffset.substring(0, 3))
    const localTime = moment.utc().utcOffset(timezoneDifference)

    return localTime.format('HH:mm')
}

/**
 * Return the prettified last seen on chat string, based on the UTC timestamp received from the chat
 * @param customerLastSeenOnChatUtcDateTimeStamp {string}
 * @param timezone {string}
 * @param referenceDay {datetime || null}
 * @returns {string}
 */
export function getDisplayCustomerLastSeenOnChat(
    customerLastSeenOnChatUtcDateTimeStamp: number,
    timezone: string,
    referenceDay?: any = null
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
