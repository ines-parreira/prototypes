import {fromJS} from 'immutable'
import _ from 'lodash'
import moment from 'moment-timezone'
import {DEFAULT_SOURCE_PATH} from '../../../../../config'

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
    return widget.type !== 'card' && widget.type !== 'list'
}

/**
 * Return the path to which a source path can be dropped
 * Ex: ticket.orders[].hello.world to ticket.orders[].hello
 * @param path
 * @returns {*}
 */
export function droppablePath(path) {
    let newPath = path

    // list and their objects are considered the same thing
    // if we find one or more [] at the end, we remove them
    while (_.endsWith(newPath, '[]')) {
        newPath = newPath.slice(0, -2)
    }

    // build the resulting path
    return _.chain(newPath)
        .split('.')
        .initial()
        .join('.')
        .value()
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
        .replace(/[_\s]+/g, ' ')
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
 * Guess if a passed string is a url
 * @param string
 * @returns {boolean|*}
 */
export function isUrl(string) {
    if (!_.isString(string)) {
        return false
    }

    return !!string.match(new RegExp(/^https?:\/\/.+/i))
}

/**
 * Guess if a passed string is an email
 * @param string
 * @returns {boolean|*}
 */
export function isEmail(string) {
    if (!_.isString(string)) {
        return false
    }

    return !!string.match(new RegExp(/[^@]+@[^@]+/i))
}

/**
 * Guess if a passed string is a boolean
 * @param string
 * @returns {boolean}
 */
export function isBoolean(string) {
    if (_.isBoolean(string)) {
        return string
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
        return ''
    }
}

/**
 * Return true if sources exist and are not empty
 * @param sources
 * @returns {*|boolean}
 */
export function areSourcesReady(sources) {
    // for every source
    return sources.every((source, key) => {
        // get the path we have to search in
        // ex : ticket.requester.customer -> requester.customer (because ticket is already in source)
        const sourcePath = _.get(DEFAULT_SOURCE_PATH, key, '')

        // we remove the first property of the source origin path since we are searching directly in the source
        // ex : we transform ticket.requester.customer into ['requester', 'customer']
        const immutableSourcePath = sourcePath.split('.').slice(1)

        const sourceData = source.getIn(immutableSourcePath, fromJS({}))

        if (!sourceData) {
            return false
        }

        return !sourceData.isEmpty()
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

        if (isDate(value)) {
            type = 'date'
        } else if (isUrl(value)) {
            type = 'url'
        } else if (isEmail(value)) {
            type = 'email'
        } else if (isBoolean(value)) {
            type = 'boolean'
        } else if (key === 'birthday') {
            type = 'age'
        } else if (_.isArray(value)) {
            type = 'array'
        }

        const response = {
            type,
            title: humanizeString(key),
        }

        // if is child of list, we do not set its path since the list already has it
        if (!isChildOfList) {
            response.path = key
        }

        return response
    } catch (err) {
        const message = 'Conversion of json to widgets failed'

        console.error(message)

        Raven.captureException(err, {
            extra: {
                description: message,
                json: value,
                key
            }
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
export function jsonToTemplate(json, context = 'ticket') {
    const defaultResponse = []

    try {
        const sourcePath = _.get(DEFAULT_SOURCE_PATH, context, '')
        const source = _.get(json, sourcePath.split('.'), {})

        let template = jsonToWidget(source)

        if (!template || !_.size(template)) {
            return defaultResponse
        }

        // since the source json is one big object
        // we dont want one big card to wrap thw other widgets
        // so lets keep the first widget children widgets``
        template = template.widgets

        // get simple attributes (like text, url, etc.) at root in separate object
        const simpleWidgets = _.filter(template, isSimpleTemplateWidget)

        // put simple attribute in a separate card
        if (simpleWidgets.length) {
            // remove isolated attributes from json
            template = _.reject(template, isSimpleTemplateWidget)
            // add new object for isolated attributes
            template.unshift({
                type: 'card',
                path: '',
                widgets: simpleWidgets
            })
        }

        if (sourcePath) {
            // prefix the source path to every root widgets
            // ex : path: 'orders' becomes path: 'ticket.requester.customer.orders' in context 'ticket'
            template = template.map((w) => {
                const widget = w
                widget.path = widget.path ? `${sourcePath}.${widget.path}` : sourcePath
                return widget
            })
        }

        return [{
            context,
            template
        }]
    } catch (err) {
        const message = 'Conversion of json to infobar widgets template failed'

        console.error(message)

        Raven.captureException(err, {
            extra: {
                description: message,
                json,
                context
            }
        })

        return defaultResponse
    }
}

/**
 * Return true if you can drop something at source path to a card in target path
 * @param sourceAbsolutePath
 * @param widgets
 * @param targetAbsolutePath
 * @param targetTemplateParent
 * @returns {boolean}
 */
export function canDrop(sourceAbsolutePath, widgets = fromJS([]), targetAbsolutePath, targetTemplateParent) {
    const sourceDroppablePath = droppablePath(sourceAbsolutePath)

    const propertyName = _.chain(sourceAbsolutePath)
        .split('.')
        .last()
        .trim('.[]')
        .value()

    // used to check that the source property does not already exist in the target
    let widgetsList = fromJS([])
    // if no root widget, take all widgets of root properties
    if (_.isUndefined(targetTemplateParent)) {
        widgetsList = widgets
    } else {
        // take widgets from its path
        // Ex: 'customer.child' widgets when moving a 'child' property such as 'name' or 'age'
        widgetsList = widgets
            .getIn(targetTemplateParent.split('.'))
            .get('widgets', fromJS([]))

        // if path of target is root, take root widget + all widgets of root properties
        if (!targetAbsolutePath) {
            widgetsList = widgets.concat(widgetsList)
        }
    }

    /**
     * Ex :
     * sourceAbsolutePath ; 'user.orders[].name'
     * sourceDroppablePath : 'user.orders[]'
     * targetAbsolutePath : 'user.orders[]'
     */

    // source parent object is same object as the target
    return sourceDroppablePath === targetAbsolutePath
        // object can not be dropped to itself (only inside its parent)
        && sourceAbsolutePath !== targetAbsolutePath
        // check that the source object is in the target object
        && sourceAbsolutePath.includes(targetAbsolutePath)
        // check that the dragged property does not already exists in the target
        && !widgetsList.find((child) => {
            return child.get('path', '') === propertyName
        })
}
