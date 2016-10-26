import {has as _has, upperFirst as _upperFirst, isString as _isString, isNumber as _isNumber} from 'lodash'
import esprima from 'esprima'
import escodegen from 'escodegen'
import moment from 'moment-timezone'
import sanitizeHtml from 'sanitize-html'

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
    return messages.slice().sort((m1, m2) => moment(m2.created_datetime).diff(moment(m1.created_datetime)))[0]
}

export function firstMessage(messages) {
    return messages.slice().sort((m1, m2) => moment(m1.created_datetime).diff(moment(m2.created_datetime)))[0]
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
        default:
            return 'eq'
    }
}

export function resolveLiteral(value, field) {
    switch (typeof value) {
        case 'object':
            return resolveLiteral(value[field.split('.').reverse()[0]], field)
        case 'string':
            return `'${value}'`
        default:
            return value
    }
}

/**
 * Return '⌘' if the user is using a Mac, 'Ctrl' otherwise
 * @returns {string}
 */
export function getModifier() {
    const isMac = navigator.platform.toLowerCase().startsWith('mac')
    return isMac ? '⌘' : 'Ctrl'
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
            'nl', 'li', 'b', 'i', 'strong', 'em', 'strike', 'code', 'hr', 'br', 'div',
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
