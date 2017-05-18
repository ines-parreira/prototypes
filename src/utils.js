import _has from 'lodash/has'
import _upperFirst from 'lodash/upperFirst'
import _isString from 'lodash/isString'
import _isNumber from 'lodash/isNumber'
import _isObject from 'lodash/isObject'
import _filter from 'lodash/filter'
import _get from 'lodash/get'
import _uniq from 'lodash/uniq'
import _compact from 'lodash/compact'
import _trim from 'lodash/trim'
import _ from 'lodash'

import {createSelectorCreator, defaultMemoize} from 'reselect'
import axios from 'axios'
import esprima from 'esprima'
import escodegen from 'escodegen'
import moment from 'moment-timezone'
import linkifyhtml from 'linkifyjs/html'
import sanitizeHtml from 'sanitize-html'
import {Entity, Modifier, EditorState, ContentState} from 'draft-js'
import {convertToHTML as _convertToHTML, convertFromHTML as _convertFromHTML} from 'draft-convert'
import Immutable, {fromJS} from 'immutable'
import md5 from 'md5'
import linkifyIt from 'linkify-it'
import {ACTION_TEMPLATES} from './config'

const notificationSoundData = require('../../private/audio/notification.mp3')

// note that 2 letters tlds are automatically interpreted
const tlds = 'com edu gov ru org net de jp uk br it pl in fr au ir nl info cn es cz kr ca ua eu co gr za ro biz ch se io'.split(' ')
export const linkify = linkifyIt().tlds(tlds)

// monitor if tab is active or not
let activeTab = true
window.onfocus = () => activeTab = true
window.onblur = () => activeTab = false
export const isTabActive = () => activeTab

// play sound notification
export const playNotificationSound = () => {
    const notificationSound = new Audio(notificationSoundData)
    notificationSound.load()
    notificationSound.play()
}

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

    return /^https?:\/\/.+/i.test(string)
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

    return /^[\w\.\-\+]+@[\w\.\-]+\.\w+$/i.test(string)
}

/**
 * Validate if string is a list of emails
 * @param string
 * @param delimiter
 * @returns {boolean}
 */
export function isEmailList(string, delimiter = ',') {
    if (!string) {
        return false
    }

    const addresses = string.trim().split(delimiter)

    // remove the last address if it's empty.
    // it happens if the list of emails ends with a comma.
    if (addresses.slice(-1)[0] === '') {
        addresses.pop()
    }

    return addresses.every(address => isEmail(address.trim()))
}

export function formatDatetime(datetime, timezone, format = 'calendar') {
    try {
        let momentDate = moment(datetime)

        // if the input is a UNIX timestamp, force moment to interpret it as a timestamp (not automatic)
        const unix = moment.unix(datetime)
        if (unix.isValid()) {
            momentDate = unix
        }

        if (timezone) {
            momentDate = momentDate.tz(timezone)
        }

        if (format === 'calendar') {
            return momentDate.calendar()
        }

        return momentDate.format(format)
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

/**
 * Return list of types of messages present in a list of messages
 * @param messages
 * @returns {Array}
 */
export function ticketSourceTypes(messages) {
    let sources = []

    if (!messages) {
        return sources
    }

    if (!messages.length) {
        return sources
    }

    sources = messages.map(message => _get(message, 'source.type'))

    return _uniq(_compact(sources))
}

export function resolvePropertyName(name = '') {
    switch (name) {
        case 'Message':
            return 'TicketMessage'
        default:
            return name
    }
}

/**
 * Find API spec data of the last property of the given field
 *
 * @param {String} field the field path. E.g: ticket.requester.id
 * @param {Object} schemas OpenID Schemas
 * @param {Boolean} alwaysRef always use `$ref` of each property to resolve field
 *     E.g:
 *      true: return properties of `User.id` because `requester` is a `User`
 *      false: return properties of `ticket.requester.id` field
 * @returns {Object} API spec data of the last property
 */
export function findProperty(field, schemas, alwaysRef = false) {
    const parts = field.split('.')
    const firstPart = resolvePropertyName(_upperFirst(parts.shift()))
    const definitions = schemas.get('definitions')
    let def = definitions.get(firstPart)
    let prop

    if (!def) {
        return null
    }

    while (parts.length !== 0) {
        prop = def.getIn(['properties', parts.shift()])

        if (!prop) {
            return null
        }

        prop = prop.toJS()

        // if the current nested property has a `meta` field,
        // then we use it instead of the `meta` of it's definition
        if (parts.length === 1 && !alwaysRef && prop.meta) {
            break
        }

        const subDef = prop.$ref || (prop.items ? prop.items.$ref : null)
        // if we have a ref then we need to redo the whole definition thing
        if (subDef) {
            def = definitions.get(subDef.replace('#/definitions/', ''))
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
            'table', 'thead', 'caption', 'tbody', 'tr', 'th', 'td', 'pre', 'img', 'font', 'span'],
        allowedAttributes: {
            // allow style/src and other meta attributes
            '*': ['align', 'alt', 'bgcolor', 'border', 'class', 'color', 'colspan', 'dir',
                'height', 'href', 'id', 'rel', 'rowspan', 'src', 'style', 'target', 'title', 'width']
        },
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
        .replace(/\//ig, '')
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
    // linkify transforms linkified urls into actual HTML links
    return linkifyhtml(_convertToHTML({
        blockToHTML: {
            unstyled: {
                start: '<div>',
                end: '</div>',
                empty: '<br>' // when we have an empty block (corresponds with a new line, add a line break)
            },
            atomic: {
                start: '<figure>',
                end: '</figure>'
            }
        },
        entityToHTML: (entity, originalText) => {
            if (entity.type === 'link') {
                // keep the start/end way of doing until https://github.com/HubSpot/draft-convert/issues/47 is fixed
                return {
                    start: `<a href="${entity.data.url}" target="_blank">`,
                    end: '</a>',
                }
            }

            if (entity.type === 'img') {
                const width = entity.data.width || 400

                // keep the start/end way of doing until https://github.com/HubSpot/draft-convert/issues/47 is fixed
                return `<img src="${entity.data.src}" width="${width}px" />`
            }

            return originalText
        }
    })(contentState), {
        validate: {
            url(value) {
                return linkify.test(value)
            }
        }
    })
}

/**
 * Single convertFromHTML config for the entire app (same options everywhere if needed)
 * @param html
 */
export function convertFromHTML(html) {
    let converted = _convertFromHTML({
        htmlToBlock: (nodeName) => {
            if (nodeName === 'figure') {
                return 'atomic'
            }
        },
        htmlToEntity: (nodeName, node) => {
            if (nodeName === 'a') {
                return Entity.create(
                    'link',
                    'MUTABLE',
                    {url: node.href}
                )
            }

            if (nodeName === 'img') {
                return Entity.create(
                    'img',
                    'IMMUTABLE',
                    {
                        src: node.src,
                        width: node.width,
                    }
                )
            }
        },
    })(html)

    // remove the default 'a' character in atomic blocks so that text from getPlainText() of this contentState that not
    // carry a 'a' where images are supposed to be displayed
    // see https://github.com/HubSpot/draft-convert/issues/30
    const blocks = converted.getBlocksAsArray().map((block) => {
        if (block.getType() === 'atomic') {
            return block.set('text', '')
        }

        return block
    })

    converted = ContentState.createFromBlockArray(blocks)

    return converted
}

/**
 * Insert text in editorState
 * @param editorState
 * @param text
 * @returns {EditorState}
 */
export function insertText(editorState, text) {
    const selection = editorState.getSelection()
    const contentState = editorState.getCurrentContent()
    const modifier = Modifier.replaceText(contentState, selection, text)
    return EditorState.push(editorState, modifier, 'insert-fragment')
}

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
 * Return a passed object as plain JS (not Immutable)
 * @param object
 */
export const toJS = object => isImmutable(object) ? object.toJS() : object

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
            return isAgent(user)
        case 'admin':
            return isAdmin(user)
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
 * @returns {boolean}
 */
export function hasReachedLimit(limit, tickets, plan) {
    const freeTickets = plan.get('free_tickets', 0)
    return tickets >= plan.getIn(['limits', limit], freeTickets)
}

export function toQueryParams(obj) {
    return Object.keys(obj).map((key) => (
        `${key}=${encodeURIComponent(obj[key])}`
    )).join('&')
}

/**
 * Convert emoji chars to <img/> tags using Twitter Emoji (twemoji).
 * @param {String|Object} emojiContainer string or dom node with emojis
 * @returns {String|Object}
 */
export function emoji(emojiContainer) {
    if (typeof window.twemoji === 'undefined') {
        return emojiContainer
    }

    return window.twemoji.parse(emojiContainer, {
        base: `${window.GORGIAS_ASSETS_URL}/static/emoji/`
    })
}

export function getActionTemplate(actionName) {
    return ACTION_TEMPLATES.find(template => template.name === actionName) || {}
}

export const createImmutableSelector = createSelectorCreator(defaultMemoize, Immutable.is)

export function loadScript(url, callback) {
    const elem = document.createElement('script')
    const script = document.getElementsByTagName('script')[0]
    elem.src = url

    if (callback) {
        elem.addEventListener('load', callback)
    }
    script.parentNode.insertBefore(elem, script)
}

/**
 * Upload file action meant to be used by another action
 * @param files
 * @return {Array} - [{content_type, name, size, url}]
 */
export const uploadFiles = (files) => {
    const formData = new window.FormData()

    for (let i = 0; i < files.length; i++) {
        const file = files[i]
        formData.append(file.name, file)
    }

    return axios.post('/api/upload/', formData)
        .then((json = {}) => json.data)
}

/**
 * Clean error message sent from server before we display it
 * @param text
 */
export const stripErrorMessage = (text) => {
    // Match all tags like [SHOPIFY] [full-refund] [STUFF-FOO-bar]
    const regex = /\[[\w-]+]/g
    text = text.replace(regex, '')
    text = _trim(text, '. ')
    return text
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
 * Compare two values and return order symbol, used in sort for Immutable
 * @param a
 * @param b
 * @returns {number}
 */
export const compare = (a, b) => {
    if (a < b) {
        return -1
    }

    if (a > b) {
        return 1
    }

    return 0
}
