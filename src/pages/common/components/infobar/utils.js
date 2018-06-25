import React from 'react'
import {fromJS} from 'immutable'
import _ from 'lodash'
import moment from 'moment'
import {Badge} from 'reactstrap'

import {DatetimeLabel} from '../../utils/labels'
import * as utils from '../../../../utils'
import {getSourcePathFromContext, getContextFromSourcePath} from '../../../../state/widgets/utils'

const Raven = window.Raven

/**
 * Check if is an array of objects (and no an array of string for example)
 * @param value
 * @returns {*|boolean}
 */
export function isArrayOfObjects(value) {
    return _.isArray(value) && !!value.length && _.isObject(value[0])
}

/**
 * Check if is a real object (since arrays are objects, we just want objects (no arrays) here)
 * @param value
 * @returns {boolean}
 */
export function isObject(value) {
    return !!value && _.isObject(value) && !_.isArray(value)
}

/**
 * Check if a widget is a simple field (not a card or a list)
 * @param widget
 * @returns {boolean}
 */
export function isSimpleTemplateWidget(widget) {
    return !['card', 'list'].includes(widget.get('type'))
}

/**
 * Check if a widget does not contain any simple widget (ie. only complex widgets such as cards or lists)
 * If it contains at least a card, or a list, etc. it returns false
 * @param widget
 * @returns {boolean}
 */
export function hasNoSimpleWidget(widget) {
    return !widget.get('widgets', fromJS([])).some(isSimpleTemplateWidget)
}

export function isUppercase(string) {
    return string === string.toUpperCase()
}

/**
 * Return true if passed customer data is valid (Immutable Map, etc.)
 * @param data
 * @returns {boolean}
 */
export const isCustomerDataValid = (data) => {
    return !!data && utils.isImmutable(data)
}

/**
 * Return true if passed customer data is valid and not empty
 * @param data
 * @returns {boolean}
 */
export const isCustomerDataPresent = (data) => {
    return isCustomerDataValid(data) && !data.isEmpty()
}

/**
 * Remove last "[]" from the passed path
 * Ex: ticket.orders[] to ticket.orders
 * @param path
 * @returns {*}
 */
export function stripLastListsFromPath(path = []) {
    let newPath = path

    while (_.last(newPath) === '[]') {
        newPath = _.initial(newPath)
    }

    return newPath
}

/**
 * Return true if passed absolute path is a root source
 * Ex : ticket.customer.data
 * @param group (= absolute path OR 'root')
 * @returns {*}
 */
export function isRootSource(group) {
    return group === 'root'
}

/**
 * Guess if a passed string is a date
 * @param string
 * @returns {boolean|*}
 */
export function isDate(string) {
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
        'YYYY-MM-DDThh:mm:ss.sTZD'
    ]

    return moment(string, formats, true).isValid()
}

/**
 * Guess if a passed string is a boolean
 * @param string
 * @returns {boolean}
 */
export function isBoolean(string) {
    if (_.isBoolean(string)) {
        return true
    }

    if (_.isString(string)) {
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
export function areSourcesReady(sources, context, everySources = false) {
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
export function canDisplayWidget(widget, source) {
    if (widget.get('type') !== 'wrapper') {
        return false
    }

    const splitPath = widget.get('path', '')

    if (!splitPath.length) {
        return false
    }

    // ex : ticket, user, etc.
    const initialSourceName = splitPath[0]

    return areSourcesReady(fromJS({
        [initialSourceName]: source.get(initialSourceName, fromJS({}))
    }), initialSourceName)
}

export function makeWrapper({order, context, child, sourcePath, widgetType, integrationId}) {
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
        wrapperWidget = wrapperWidget.set('widgets', firstWidget.get('widgets', fromJS([])))
    }

    return fromJS({
        type,
        order,
        context,
        template: wrapperWidget,
        sourcePath,
        integration_id: integrationId
    })
}

/**
 * Translate json to template configuration for widgets
 * @param value
 * @param key
 * @param isChildOfList
 * @returns {*}
 */
export function jsonToWidget(value, key = '', isChildOfList = false) {
    try {
        // if array of objects
        if (isArrayOfObjects(value)) {
            const response = {
                type: 'list',
                widgets: [jsonToWidget(value[0], key, true)]
            }

            if (!isChildOfList) {
                response.path = key
            }

            return response
        }

        // if object (and not an array, since Array is an Object in JS)
        if (isObject(value)) {
            // remove private keys from source
            value = _.omitBy(value, (v, k) => k.startsWith('_'))

            let enhancedValues = {}

            // order keys in alphabetical order
            _.chain(value)
                .keys()
                .sortBy(_.toLower)
                .forEach((v) => {
                    enhancedValues[v] = value[v]
                })
                .value()

            // order keys by simple fields, then objects and finally arrays
            enhancedValues = {
                ..._.pickBy(enhancedValues, (v) => {
                    return !isObject(v) && !isArrayOfObjects(v)
                }),
                ..._.pickBy(enhancedValues, isObject),
                ..._.pickBy(enhancedValues, isArrayOfObjects)
            }

            const widgets = []
            _.forIn(enhancedValues, (v, k) => widgets.push(jsonToWidget(v, k)))

            const response = {
                type: 'card',
                title: utils.humanizeString(key),
                widgets
            }

            if (!isChildOfList) {
                response.path = key
            }

            return response
        }

        // other kind of field
        let type = 'text'

        if (_.isArray(value)) {
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

        const response = {
            type,
            title: isUppercase(key) ? key : utils.humanizeString(key),
        }

        // if is child of list, we do not set its path since the list already has it
        if (!isChildOfList) {
            response.path = key
        }

        return response
    } catch (err) {
        const message = 'Conversion of json to widgets failed'

        console.error(message)

        if (Raven) {
            Raven.captureException(err, {
                extra: {
                    description: message,
                    json: value,
                    key
                }
            })
        } else {
            console.error('Here are some details', value, key)
        }

        return {}
    }
}

/**
 * Transform a json to template configuration and adapt it for infobar display
 * @param json
 * @param context
 * @returns {*}
 */
export function jsonToWidgets(json, context = 'ticket') {
    const defaultResponse = []

    try {
        const sourcePaths = getSourcePathFromContext(context)
        const integrationsPath = sourcePaths.find(path => {
            return _.includes(path, 'integrations')
        })

        const integrationsData = _.get(json, integrationsPath, {})

        let typeByPath = fromJS({})

        // Add all `sourcePaths` matching integrations data
        // Transform:
        //  [['user', 'customer'], ['user', 'integrations']]
        // To:
        //  [['user', 'customer'], ['user', 'integrations', '1'], ['user', 'integrations', '2']]
        _.forEach(integrationsData, (integrationData, integrationId) => {
            const newPath = integrationsPath.slice()
            newPath.push(integrationId.toString())
            typeByPath = typeByPath.set(newPath, fromJS({
                type: integrationData['__integration_type__'],
                integrationId
            }))
            sourcePaths.push(newPath)
        })

        const idx = sourcePaths.indexOf(integrationsPath)
        sourcePaths.splice(idx, 1)

        const response = sourcePaths
            .map((sourcePath, i) => {
                let source = _.get(json, sourcePath, {})

                // remove private keys from source before we transform it into a template
                source = _.omitBy(source, (v, k) => k.startsWith('_'))

                if (!source || !_.size(source)) {
                    return null
                }

                const template = jsonToWidget(source)

                if (!template || !_.size(template)) {
                    return null
                }

                return makeWrapper({
                    order: i,
                    context,
                    child: template,
                    sourcePath,
                    widgetType: typeByPath.getIn([sourcePath, 'type']) || null,
                    integrationId: typeByPath.getIn([sourcePath, 'integrationId']) || null
                })
            })

        // remove null widgets
        return _.compact(response)
    } catch (err) {
        const message = 'Conversion of json to infobar widgets template failed'

        console.error(message)

        if (Raven) {
            Raven.captureException(err, {
                extra: {
                    description: message,
                    json,
                    context
                }
            })
        } else {
            console.error('Here are some details', json, context)
        }

        return defaultResponse
    }
}

/**
 * Return true if you can drop something at source path to a card in target path
 * @param group (= absolute path OR 'root')
 * @param targetAbsolutePath
 * @returns {boolean}
 */
export function canDrop(group = '', targetAbsolutePath = '') {
    // root source
    if (isRootSource(group)) {
        return !targetAbsolutePath
    }

    return group === targetAbsolutePath.join('.')
}

/**
 * Format some data from widget before it is display
 * @param template
 * @param source
 * @param parent
 * @returns {{updatedWidget: *, data: *, type: *, path: *}}
 */
export function prepareWidgetToDisplay(template = fromJS({}), source = fromJS({}), parent) {
    // build absolute path of widget
    const parentPath = !!parent && parent.get('absolutePath', parent.get('path', ''))
    const ownPath = template.get('path', '')

    let absolutePath = template.get('path')

    if (parentPath) {
        absolutePath = parentPath

        if (ownPath) {
            absolutePath = _.concat(absolutePath, ownPath)
        }
    }

    absolutePath = utils.toJS(absolutePath)

    let updatedTemplate = template.set('absolutePath', absolutePath)
    let path = updatedTemplate.get('path', '')

    path = utils.toJS(path)

    if (path && !_.isArray(path)) {
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
        path
    }
}

/**
 * Return a field value based on raw incoming data and a field type
 * @param data
 * @param type
 * @returns {string}
 */
export function guessFieldValueFromRawData(data, type) {
    let fieldValue = ''

    if (!_.isUndefined(data) && !_.isNull(data)) {
        if (_.isString(data)) {
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
                try {
                    fieldValue = moment().diff(data, 'years')
                    fieldValue += ` (${moment(data).format('YYYY-MM-DD')})`
                } catch (e) {
                    fieldValue = data
                }
                break
            }
            case 'url': {
                if (utils.isUrl(data)) {
                    fieldValue = (
                        <a
                            href={data}
                            target="_blank"
                        >
                            {data.length > 60 ? `${data.slice(0, 57)}...` : data}
                        </a>
                    )
                }
                break
            }
            case 'email': {
                if (utils.isEmail(data)) {
                    fieldValue = (
                        <a href={`mailto:${data}`} target="_blank">{data}</a>
                    )
                }
                break
            }
            case 'boolean': {
                let isTrue = true

                if (_.isBoolean(data)) {
                    isTrue = data
                }

                if (_.isString(data)) {
                    isTrue = data === 'true' || data.toString() === '1'
                }

                fieldValue = isTrue
                    ? <Badge color="success">True</Badge>
                    : <Badge color="danger">False</Badge>
                break
            }
            case 'array': {
                if (_.isArray(data)) {
                    fieldValue = data.join(', ')
                }
                break
            }
            default:
        }
    }

    return fieldValue
}

/**
 * Display a widget field label (before the value)
 * @param label
 * @returns {*}
 */
export const displayLabel = (label) => {
    const defaultLabel = '-'

    if (_.isUndefined(label)) {
        return defaultLabel
    }

    if (_.isNull(label)) {
        return defaultLabel
    }

    if (_.isString(label) && !label) {
        return defaultLabel
    }

    return label
}
