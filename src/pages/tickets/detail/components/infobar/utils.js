import {fromJS} from 'immutable'
import _ from 'lodash'
import moment from 'moment-timezone'
import {isUrl, isEmail} from '../../../../../utils'
import {DEFAULT_SOURCE_PATHS} from '../../../../../config'

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

export function isUppercase(string) {
    return string === string.toUpperCase()
}

/**
 * Remove last "[]" from the passed path
 * Ex: ticket.orders[] to ticket.orders
 * @param path
 * @returns {*}
 */
export function stripLastListsFromPath(path = '') {
    let newPath = path

    while (_.endsWith(newPath, '[]')) {
        newPath = newPath.slice(0, -2)
    }

    return newPath
}

/**
 * Return true if passed absolute path is a root source
 * Ex : ticket.requester.customer
 * @param group (= absolute path OR 'root')
 * @returns {*}
 */
export function isRootSource(group) {
    return group === 'root'
}

/**
 * Transform object key to better like 'mainSteps' and 'order_id' to 'Main steps' and 'Order id'
 * @param text
 * @returns {*}
 */
export function humanizeString(text) {
    return _.chain(text)
        .trim('.-_')
        .replace(/([A-Z])/g, ' $1')
        .replace(/[_.\s]+/g, ' ')
        .toLower()
        .upperFirst()
        .value()
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
 * Render template like 'Order {id}' to 'Order 134'
 * @param text
 * @param context
 * @returns {*}
 */
export function renderTemplate(text, context = {}) {
    try {
        return _.template(text, {
            interpolate: /{([\s\S]+?)}/g
        })(context)
    } catch (e) {
        return text
    }
}

/**
 * Return true if sources exist and are not empty
 * @param sources
 * @param everySources
 * @returns {*|boolean}
 */
export function areSourcesReady(sources, everySources = true) {
    // for every source
    return sources.every((source, key) => {
        // get the path we have to search in
        // ex : ticket.requester.customer -> requester.customer (because ticket is already in source)
        const sourcePaths = _.get(DEFAULT_SOURCE_PATHS, key)

        if (!sourcePaths) {
            return false
        }

        const condition = everySources ? 'every' : 'some'

        return sourcePaths[condition]((sourcePath) => {
            // we remove the first property of the source origin path since we are searching directly in the source
            // ex : we transform ticket.requester.customer into ['requester', 'customer']
            const immutableSourcePath = sourcePath.split('.').slice(1)

            const sourceData = source.getIn(immutableSourcePath, fromJS({}))

            if (!sourceData) {
                return false
            }

            return !sourceData.isEmpty()
        })
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

    const splitPath = widget.get('path', '').split('.')

    if (!splitPath.length) {
        return false
    }

    // ex : ticket, user, etc.
    const initialSourceName = splitPath[0]

    return areSourcesReady(fromJS({
        [initialSourceName]: source.get(initialSourceName, fromJS({}))
    }))
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
                title: humanizeString(key),
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
        } else if (isEmail(value)) {
            type = 'email'
        } else if (isUrl(value)) {
            type = 'url'
        } else if (isDate(value)) {
            type = 'date'
        }

        const response = {
            type,
            title: isUppercase(key) ? key : humanizeString(key),
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
        const sourcePaths = _.get(DEFAULT_SOURCE_PATHS, context, '')

        const response = sourcePaths
            .map((sourcePath, i) => {
                const source = _.get(json, sourcePath.split('.'), {})

                let template = jsonToWidget(source)

                if (!template || !_.size(template)) {
                    return null
                }

                // set each widget in a wrapper
                template = {
                    type: 'wrapper',
                    title: humanizeString(sourcePath),
                    path: sourcePath,
                    widgets: [template]
                }

                return {
                    type: 'custom',
                    order: i,
                    context,
                    template
                }
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

    return group === targetAbsolutePath
}

/**
 * Format some data from widget before it is display
 * @param widget
 * @param source
 * @param parent
 * @returns {{updatedWidget: *, data: *, type: *, path: *}}
 */
export function prepareWidgetToDisplay(widget = fromJS({}), source = fromJS({}), parent) {
    // build absolute path of widget
    const parentPath = !!parent && parent.get('absolutePath', parent.get('path', ''))
    const ownPath = widget.get('path', '')
    const absolutePath = parentPath ? `${parentPath}${ownPath ? `.${ownPath}` : ''}` : widget.get('path')
    const updatedWidget = widget.set('absolutePath', absolutePath)

    // get data of widget in shortcuts
    const path = updatedWidget.get('path', '')
    const data = path ? source.getIn(path.split('.')) : source
    const type = updatedWidget.get('type', '')

    return {
        updatedWidget,
        data,
        type,
        path
    }
}
