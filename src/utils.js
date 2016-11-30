import {has as _has, upperFirst as _upperFirst, isString as _isString, isNumber as _isNumber} from 'lodash'
import esprima from 'esprima'
import escodegen from 'escodegen'
import moment from 'moment-timezone'
import sanitizeHtml from 'sanitize-html'
import {stateToHTML as _stateToHTML} from 'draft-js-export-html'
import Immutable, {fromJS} from 'immutable'
import {VIEW_FIELDS} from './config'

/**
 * Guess if a passed string is a url
 * @param string
 * @returns {boolean|*}
 */
export function isUrl(string) {
    if (!_isString(string)) {
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
    if (!_isString(string)) {
        return false
    }

    return !!string.match(new RegExp(/[^@]+@[^@]+/i))
}

export function formatDatetime(datetime, timezone, format = 'calendar') {
    try {
        // Note the timezone should be set when the user first logs in.
        const raw = timezone ? moment(datetime).tz(timezone) : moment(datetime)

        if (format === 'calendar') {
            return raw.calendar()
        }

        return raw.format(format)
    } catch (e) {
        console.error('Failed to format datetime', e, datetime, timezone)
        return datetime
    }
}

export function getAST(code) {
    if (!_isString(code)) {
        console.error('Not a string:', code)
    }
    return esprima.parse(code, {loc: true})
}

export function getCode(ast) {
    if (!_isString(ast.type)) {
        console.error('Not an AST:', ast)
    }
    return escodegen.generate(ast, {
        format: {
            semicolons: false
        }
    })
}

export function lastMessage(messages) {
    if (!messages) {
        return {}
    }

    if (!messages.length) {
        return {}
    }

    return messages.sort((m1, m2) => moment(m2.created_datetime).diff(moment(m1.created_datetime)))[0]
}

export function firstMessage(messages) {
    if (!messages) {
        return {}
    }

    if (!messages.length) {
        return {}
    }

    return messages.sort((m1, m2) => moment(m1.created_datetime).diff(moment(m2.created_datetime)))[0]
}

// given a field path. Ex: ticket.requester.id and OpenID schemas => resolve the last property
export function findProperty(field, schemas) {
    const parts = field.split('.')

    let def = schemas.getIn(['definitions', _upperFirst(parts.shift())])
    let prop

    while (parts.length !== 0) {
        prop = def.getIn(['properties', parts.shift()])

        if (!prop) {
            return null
        }

        prop = prop.toJS()

        // if the current nested property has a `meta` field,
        // then we use it instead of the `meta` of it's definition
        if (prop.meta) {
            break
        }
        // if we have a ref then we need to redo the whole definition thing
        if (typeof prop.$ref !== 'undefined') {
            def = schemas.getIn(['definitions', prop.$ref.replace('#/definitions/', '')])
        } else if (prop.type === 'array') {
            if (typeof prop.items.$ref !== 'undefined') {
                def = schemas.getIn(['definitions', prop.items.$ref.replace('#/definitions/', '')])
            }
        }
    }

    return prop
}

export function equalityOperator(field, schemas) {
    const prop = findProperty(field, schemas)
    switch (prop.type) {
        case 'integer':
            return 'eq'
        case 'string':
            if (prop.meta && prop.meta.operators) {
                if (_has(prop.meta.operators, 'contains')) {
                    return 'contains'
                }
            }
            return 'eq'
        case 'array':
            return 'contains'
        default:
            return 'eq'
    }
}

export function resolveLiteral(value, path) {
    switch (typeof value) {
        case 'object':
            return resolveLiteral(value[path.split('.').reverse()[0]], path)
        case 'string':
            return `'${value}'`
        default:
            return value
    }
}

/**
 * Return '⌘' if the user is using a Mac, Ctrl/Meta otherwise
 * @returns {string}
 */
export function getModifier(defaultKey = 'Ctrl') {
    const isMac = navigator.platform.toLowerCase().startsWith('mac')
    return isMac ? '⌘' : defaultKey
}

export function compactInteger(input, digits = 0) {
    if (!_isNumber(input)) {
        return input
    }

    const si = [
        {value: 1E18, symbol: 'E'},
        {value: 1E15, symbol: 'P'},
        {value: 1E12, symbol: 'T'},
        {value: 1E9, symbol: 'G'},
        {value: 1E6, symbol: 'M'},
        {value: 1E3, symbol: 'k'}
    ]
    const rx = /\.0+$|(\.[0-9]*[1-9])0+$/

    let result = input
        .toFixed(digits)
        .replace(rx, '$1')

    si.reverse().forEach((s) => {
        if (input >= s.value) {
            result = (input / s.value)
                    .toFixed(digits)
                    .replace(rx, '$1') + s.symbol
        }
    })

    return result
}

export function stripHTML(text) {
    try {
        const doc = document.implementation.createHTMLDocument()
        const body = doc.createElement('div')
        body.innerHTML = text

        const removeElements = body.querySelectorAll('style,script')
        const n = removeElements.length
        for (let i = 0; i < n; i++) {
            removeElements[i].remove()
        }
        return body.textContent || body.innerText
    } catch (e) {
        console.error(`Failed stripHTML: ${e}`, text)
        return text
    }
}

/** sanitizeHtml with a sensible config. */
export function sanitizeHtmlDefault(html) {
    return sanitizeHtml(html, {
        allowedTags: ['h3', 'h4', 'h5', 'h6', 'blockquote', 'p', 'a', 'ul', 'ol',
            'nl', 'li', 'b', 'i', 'strong', 'em', 'ins', 'strike', 'code', 'hr', 'br', 'div',
            'table', 'thead', 'caption', 'tbody', 'tr', 'th', 'td', 'pre'],
        allowedAttributes: false,
        nonTextTags: ['style', 'script', 'textarea', 'noscript', 'title']
    })
}

/**
 * Convert camelCase text to Title Case text
 */
export const camelCaseToTitleCase = (text) => (
    text.replace(/^[a-z]|[A-Z]/g, (value, index) => {
        return index === 0 ? value.toUpperCase() : ` ${value.toUpperCase()}`
    })
)

/**
 * Slugify a string
 * @param string
 * @returns {*}
 */
export function slugify(string) {
    if (!_isString(string)) {
        return string
    }

    return string
        .toLowerCase()
        .trim()
        .replace(/[ ]/g, '-')
}

/**
 * Check if element is editable (form elements, contentEditable)
 */
export function isEditable(element) {
    return element.tagName === 'INPUT'
        || element.tagName === 'SELECT'
        || element.tagName === 'TEXTAREA'
        || (
            !!element.contentEditable
            && element.contentEditable === 'true'
        )
}

/**
 * Find the closest parent that matches the selector
 */
export function closest(element, selector) {
    let $matches
    let $elem = element

    // loop through parents
    while ($elem && $elem !== document) {
        if ($elem.parentNode) {
            // find all siblings that match the selector
            $matches = $elem.parentNode.querySelectorAll(selector)
            // check if our element is matched (poor-man's Element.matches())
            if ([].indexOf.call($matches, $elem) !== -1) {
                return $elem
            }

            // go up the tree
            $elem = $elem.parentNode
        } else {
            return null
        }
    }

    return null
}

/**
 * Single stateToHTML config for the entire app (same options everywhere if needed)
 * @param contentState
 */
export function stateToHTML(contentState) {
    // allows to set options to stateToHTML rendering library that will apply on the entire app
    const options = {}
    return _stateToHTML(contentState, options)
}

/**
 * Return view fields for a specific view type
 * @param viewType
 */
export const viewFields = (viewType) => fromJS(VIEW_FIELDS).get(viewType, fromJS([]))

/**
 * Return true if passed object is immutable (from Immutable JS)
 * @param object
 */
export const isImmutable = object => Immutable.Iterable.isIterable(object)

/**
 * Return field path
 * @param field
 * @returns {*|string|string|string}
 */
export const fieldPath = (field = {}) => {
    if (isImmutable(field)) {
        field = field.toJS()
    }

    return field.path || field.name
}
