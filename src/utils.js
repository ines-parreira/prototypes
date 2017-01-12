import _has from 'lodash/has'
import _upperFirst from 'lodash/upperFirst'
import _isString from 'lodash/isString'
import _isNumber from 'lodash/isNumber'
import _isObject from 'lodash/isObject'
import _filter from 'lodash/filter'

import esprima from 'esprima'
import escodegen from 'escodegen'
import moment from 'moment-timezone'
import sanitizeHtml from 'sanitize-html'
import {convertToHTML as _convertToHTML} from 'draft-convert'
import Immutable, {fromJS} from 'immutable'
import md5 from 'md5'
import {VIEW_FIELDS} from './config'

/**
 * Serialize an object and return it's md5 hash.
 * @param obj the object of which we want the hash
 */
export const getHashOfObj = obj => md5(JSON.stringify(obj))

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

/**
 * Return last message from a list of messages
 * @param {Array} messages an array of messages
 * @param {Object} options filters to apply on messages
 * @returns {Object|Array}
 */
export function getLastMessage(messages, options) {
    if (!messages || !messages.length) {
        return
    }
    if (options) {
        messages = _filter(messages, options) || []
    }

    return messages.sort((m1, m2) => moment(m2.created_datetime).diff(moment(m1.created_datetime)))[0]
}

export function getFirstMessage(messages) {
    if (!messages) {
        return
    }

    if (!messages.length) {
        return
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
            'nl', 'li', 'b', 'i', 'u', 'strong', 'em', 'ins', 'strike', 'code', 'hr', 'br', 'div',
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
 * Single convertToHTML config for the entire app (same options everywhere if needed)
 * @param contentState
 */
export function convertToHTML(contentState) {
    return _convertToHTML({
        blockToHTML: {
            unstyled: {
                start: '<div>',
                end: '</div>',
                empty: '<br>' // when we have an empty block (correspons with a new line, add a line break)
            }
        }
    })(contentState)
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
 * Return a passed object as immutable
 * @param object
 */
export const toImmutable = object => isImmutable(object) ? object : fromJS(object)

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

/**
 * Test if user is agent
 * @param user
 * @returns {*|Array|boolean}
 */
export const isAgent = (user) => {
    if (isImmutable(user)) {
        user = user.toJS()
    }

    let roles = user.roles || []

    if (roles[0] && _isObject(roles[0])) {
        roles = roles.map(role => role.name)
    }

    return roles.includes('agent')
        || roles.includes('admin')
        || roles.includes('staff')
}

/**
 * Test if user is admin
 * @param user
 * @returns {*|Array|boolean}
 */
export const isAdmin = (user) => {
    if (isImmutable(user)) {
        user = user.toJS()
    }

    let roles = user.roles || []

    if (roles[0] && _isObject(roles[0])) {
        roles = roles.map(role => role.name)
    }

    return roles.includes('admin')
        || roles.includes('staff')
}

// Check if a user has a role
export function hasRole(user, requiredRole) {
    switch (requiredRole) {
        case 'agent':
            return isAgent(user, requiredRole)
        case 'admin':
            return isAdmin(user, requiredRole)
        default:
            return false
    }
}

/**
 * Return true if user is currently on ticket of passed ticket id, based on url
 * @param ticketId
 * @returns {boolean}
 */
export const isCurrentlyOnTicket = (ticketId = '') => {
    if (!ticketId) {
        return false
    }

    const suffix = [
        '',
        '/',
        '/edit-widgets',
    ]

    const objectURL = `/app/ticket/${ticketId}`
    const currentUrl = window.location.pathname.split('?')[0]

    return suffix.some(s => currentUrl.endsWith(`${objectURL}${s}`))
}

/**
 * Return true if user is currently on tickets view of passed view id, based on url
 * @param viewId
 * @param viewsState - state branch "views"
 * @returns {boolean}
 */
export const isCurrentlyOnView = (viewId = '', viewsState = {}) => {
    const prefix = [
        '/app/tickets',
        '/app/users',
    ]

    let urls = prefix.map(p => `${p}/${viewId}`)

    // if no viewId is specified, check root routes to views (without ids)
    // or if current active view is the asked one
    if (!viewId || viewsState.getIn(['_internal', 'currentViewId']) === viewId) {
        urls = urls.concat(prefix)
    }

    const currentUrl = window.location.pathname.split('?')[0]

    // keep this syntax, no urls.some(url => currentUrl.includes(url)) since we want the pathname to be initiated on
    // each call of the parent function
    return urls.some(url => currentUrl.includes(url)) || ['/app', '/app/'].some(url => currentUrl.endsWith(url))
}

/**
 * return plural object name of a given view type
 * @param {String} viewType E.g: user-list, ticket-list
 * @returns {String} plural object name E.g: users, tickets
 */
export function getPluralObjectName(viewType) {
    return viewType.replace('-list', 's')
}

/**
 * Check if user has reach maximum limit of a plan
 * @param limit name fo the limit, E.g: min, default, max
 * @param tickets number of tickets used for a period
 * @param plan A plan in `config.py` - billing section
 * @param signupDate signup date of an account (`created_datetime`)
 * @returns {boolean}
 */
// TODO: remove all code related to effective date of plan
// when all accounts before `effective_date` have a credit card
export function hasReachedLimit(limit, tickets, plan, signupDate = moment()) {
    const effectiveDate = moment(plan.get('effective_date', moment()))
    let date = signupDate

    if ((date instanceof Date || date instanceof String) && moment(date).isValid) {
        date = moment(date)
    } else if (!date.isValid || !date.isValid()) {
        date = moment()
    }

    if (date.isBefore(effectiveDate)) {
        return false
    }

    const freeTickets = plan.get('free_tickets', 0)
    return tickets >= plan.getIn(['limits', limit], freeTickets)
}

export function toQueryParams(obj) {
    return Object.keys(obj).map((key) => (
        `${key}=${encodeURIComponent(obj[key])}`
    )).join('&')
}
