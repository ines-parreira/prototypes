// @flow
import _has from 'lodash/has'
import _map from 'lodash/map'
import _upperFirst from 'lodash/upperFirst'
import _isString from 'lodash/isString'
import _isNumber from 'lodash/isNumber'
import _isObject from 'lodash/isObject'
import _filter from 'lodash/filter'
import _get from 'lodash/get'
import _uniq from 'lodash/uniq'
import _compact from 'lodash/compact'
import _trim from 'lodash/trim'
import _find from 'lodash/find'
import _last from 'lodash/last'
import _ from 'lodash'
import _flatMapDeep from 'lodash/flatMapDeep'

import {createSelectorCreator, defaultMemoize} from 'reselect'
import axios from 'axios'
import esprima from 'esprima'
import escodegen from 'escodegen'
import moment from 'moment-timezone'
import linkifyhtml from 'linkifyjs/html'
import sanitizeHtml from 'sanitize-html'
import {Entity, Modifier, EditorState, ContentState} from 'draft-js'
import {convertToHTML as _convertToHTML, convertFromHTML as _convertFromHTML} from 'draft-convert'
// $FlowFixMe: will be fixed with immutable 4.x
import Immutable, {fromJS} from 'immutable'
import md5 from 'md5'
import linkifyIt from 'linkify-it'
import htmlparser from 'htmlparser2'
import TICKET_LANGUAGES from './config/ticketLanguages'

import {ACTION_TEMPLATES} from './config'
import {availableVariables} from './config/rules'

const notificationSoundData = require('../../private/audio/notification.mp3')

// types
import type {Map, Iterable} from 'immutable'
import type {viewsStateType} from './state/views/types'
import type {
    actionTemplateType,
    attachmentType,
    schemasType,
    esprimaParse,
    reactRouterRoute
} from './types'
type userType = {roles: Array<string | {name:string}>} | Map<*,*>
type messageType = {
    created_datetime: Date,
    source: {type: string}
}
type propertyType = {
    type: string,
    meta: {},
    items: {$ref:{}}
}
type equalityOperatorType = 'eq' | 'contains'


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
    // $FlowFixMe
    const notificationSound = new Audio(notificationSoundData)
    notificationSound.load()
    notificationSound.play()
}

/**
 * Console log info only on dev environment
 * @param args
 */
export const devLog = (...args: Array<any>) => {
    if (window.DEVELOPMENT || window.STAGING) {
        console.log(...args)
    }
}

export const defined = (item: any): boolean => {
    return !_.isUndefined(item) && item !== null
}

/**
 * Serialize an object and return it's md5 hash.
 * @param obj the object of which we want the hash
 */
export const getHashOfObj = (obj: {}): string => md5(JSON.stringify(obj))

/**
 * Guess if a passed string is a url
 * @param string
 * @returns {boolean|*}
 */
export function isUrl(string: string): boolean {
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
export function isEmail(string: string): boolean {
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
export function isEmailList(string: string, delimiter: string = ','): boolean {
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

/**
 * check if an email integration is our base email integration
 * @param address
 * @return {boolean}
 */
export function isGorgiasSupportAddress(address: string): boolean {
    if (!_isString(address)) {
        return false
    }

    return /^support@[a-zA-Z0-9-]+.gorgias.io$/.test(address)
}

export function formatDatetime(datetime: Date | number, timezone: string, format: string = 'calendar'): Date | number {
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
            return momentDate.calendar(null, {
                lastWeek: 'dddd' // Tuesday, Friday, etc.. The default is: [Last] dddd
            })
        }

        return momentDate.format(format)
    } catch (e) {
        console.error('Failed to format datetime', e, datetime, timezone)
        return datetime
    }
}

export function getAST(code: string): esprimaParse {
    if (!_isString(code)) {
        console.error('Not a string:', code)
    }
    return esprima.parse(code, {loc: true})
}

export function getCode(ast: {type: string}): string {
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
export function getLastMessage(messages: Array<messageType>, options: any = null): ?messageType {
    if (!messages || !messages.length) {
        return
    }
    if (options) {
        messages = _filter(messages, options) || []
    }

    // most recent message sorted to first element of array
    return messages.sort((a, b) => compare(b.created_datetime, a.created_datetime))[0]
}

/**
 * Return list of types of messages present in a list of messages
 * @param messages
 * @returns {Array}
 */
export function ticketSourceTypes(messages: Array<messageType>): Array<{}> {
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

export function resolvePropertyName(name: string = ''): string {
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
export function findProperty(field: string, schemas: schemasType, alwaysRef: boolean = false): ?propertyType {
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

export function equalityOperator(field: string, schemas: schemasType): ?equalityOperatorType {
    const prop = findProperty(field, schemas)
    if (!prop) {
        return null
    }

    switch (prop.type) {
        case 'integer':
            return 'eq'
        case 'array':
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

export function resolveLiteral(value: {} | string, path: string): string {
    switch (typeof value) {
        case 'object':
            return resolveLiteral(value[path.split('.').reverse()[0]], path)
        default:
            return value
    }
}


export function compactInteger(input: number, digits: number = 0): string {
    if (!_isNumber(input)) {
        // $FlowFixMe
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

export function stripHTML(text: string): ?string {
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
export function sanitizeHtmlDefault(html: string): string {
    return sanitizeHtml(html, {
        allowedTags: ['h3', 'h4', 'h5', 'h6', 'blockquote', 'p', 'a', 'ul', 'ol',
            'nl', 'li', 'b', 'i', 'u', 'strong', 'em', 'ins', 'strike', 'code', 'hr', 'br', 'div',
            'table', 'thead', 'caption', 'tbody', 'tr', 'th', 'td', 'pre', 'img', 'font', 'span', 'audio'],
        allowedAttributes: {
            // allow style/src and other meta attributes
            '*': ['align', 'alt', 'bgcolor', 'border', 'class', 'color', 'colspan', 'dir',
                'height', 'href', 'id', 'rel', 'rowspan', 'src', 'style', 'target', 'title', 'width', 'controls']
        },
        nonTextTags: ['style', 'script', 'textarea', 'noscript', 'title'],
        transformTags: {
            'a': sanitizeHtml.simpleTransform('a', {target: '_blank'})
        }
    })
}

/**
 * Append a proxy URL before the images src so we can control their width and protect our agents privacy
 *
 * @param html - the html body that contains the images
 * @param format
 */
export const proxifyImages = (html: string, format: string = '1000x'): string => {
    if (html.indexOf('img') === -1) {
        return html
    }

    if (!window.IMAGE_PROXY_URL) {
        throw new Error('window.IMAGE_PROXY_URL is not defined')
    }

    const selfClosing = ['img', 'br', 'hr', 'area', 'base', 'basefont', 'input', 'link', 'meta']

    let result = ''
    const parser = new htmlparser.Parser({
        onopentag: (name, attributes) => {
            result += `<${name}`
            const attributesKeys = Object.keys(attributes)
            // Add a space if we have attributes so we have nicely formatted tags: <tag attr="val">
            if (attributesKeys.length) {
                result += ' '
            }

            const attributePairs = []
            attributesKeys.forEach((k) => {
                let v = attributes[k]
                if (name === 'img' && k === 'src') {
                    v = `${window.IMAGE_PROXY_URL}${format}/${attributes.src}`
                }
                attributePairs.push(`${k}="${v}"`)
            })
            result += attributePairs.join(' ')

            if (selfClosing.indexOf(name) !== -1) {
                result += '/>'
            } else {
                result += '>'
            }
        },
        ontext: (text) => {
            result += text
        },
        onclosetag: (name) => {
            if (selfClosing.indexOf(name) === -1) {
                result += `</${name}>`
            }
        }
    })
    parser.write(html)
    parser.end()
    return result
}

/**
 * Convert camelCase text to Title Case text
 */
export const camelCaseToTitleCase = (text: string): string => (
    text.replace(/^[a-z]|[A-Z]/g, (value, index) => {
        return index === 0 ? value.toUpperCase() : ` ${value.toUpperCase()}`
    })
)


/**
 * Slugify a string
 * @param string
 * @returns {*}
 */
export function slugify(string: string): string {
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
 * Single convertToHTML config for the entire app (same options everywhere if needed)
 * @param contentState
 */
export function convertToHTML(contentState: ContentState): string {
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

            if (entity.type === 'mention') {
                return {
                    start: '<span class="gorgias-mention">',
                    end: '</span>'
                }
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
export function convertFromHTML(html: string): ContentState {
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
                    {url: unescapeTemplateVars(node.href)}
                )
            }

            if (nodeName === 'img') {
                return Entity.create(
                    'img',
                    'MUTABLE',
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
            return block.set('text', ' ')
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
export function insertText(editorState: EditorState, text: string): EditorState {
    const selection = editorState.getSelection()
    const contentState = editorState.getCurrentContent()
    const modifier = Modifier.replaceText(contentState, selection, text)
    return EditorState.push(editorState, modifier, 'insert-fragment')
}

/**
 * Remove mentions from editor state
 * @param editorState
 * @param value
 * @returns {EditorState}
 */
export function removeMentions(editorState: EditorState, value: {text: string, html: string}): EditorState {

    // use convertFromHTML/fromText to create a new content state w/o mention
    // because mentions are not present in the html/text of the body
    let contentState = ContentState.createFromText('')
    if (value.html) {
        contentState = convertFromHTML(value.html)
    } else if (value.text) {
        contentState = ContentState.createFromText(value.text)
    }

    return EditorState.push(editorState, contentState)
}

/**
 * Return true if passed object is immutable (from Immutable JS)
 * @param object
 */
export const isImmutable = (object: {} | Iterable<*,*>): boolean => Immutable.Iterable.isIterable(object)

/**
 * Return a passed object as immutable
 * @param object
 */
export const toImmutable = (object: {} | Iterable<*,*>): any => isImmutable(object) ? object : fromJS(object)

/**
 * Return a passed object as plain JS (not Immutable)
 * @param object
 */
// throws error on missing toJS() for plain object.
// $FlowFixMe
export const toJS = (object: {} | Iterable<*,*>): any => isImmutable(object) ? object.toJS() : object

/**
 * Return field path
 * @param field
 * @returns {*|string|string|string}
 */
export const fieldPath = (field: {} | Iterable<*,*> = {}): string => {
    field = toJS(field)
    // $FlowFixMe
    return field.path || field.name
}

/**
 * Test if user is agent
 * @param user
 * @returns {boolean}
 */
export const isAgent = (user: userType): boolean => {
    if (isImmutable(user)) {
        // $FlowFixMe
        user = user.toJS()
    }

    // flow has issues with changing var type
    // user.roles = List to user.roles = Array<{}>
    let roles = user.roles || []

    // $FlowFixMe
    if (roles[0] && _isObject(roles[0])) {
        // $FlowFixMe
        roles = roles.map(role => role.name)
    }

    // $FlowFixMe
    return roles.includes('agent')
        // $FlowFixMe
        || roles.includes('admin')
        // $FlowFixMe
        || roles.includes('staff')
}

/**
 * Test if user is admin
 * @param user
 * @returns {boolean}
 */
export const isAdmin = (user: userType): boolean => {
    if (isImmutable(user)) {
        // $FlowFixMe
        user = user.toJS()
    }

    let roles = user.roles || []

    // $FlowFixMe
    if (roles[0] && _isObject(roles[0])) {
        // $FlowFixMe
        roles = roles.map(role => role.name)
    }

    // $FlowFixMe
    return roles.includes('admin')
        // $FlowFixMe
        || roles.includes('staff')
}

// Check if a user has a role
export function hasRole(user: userType, requiredRole: string): boolean {
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
export const isCurrentlyOnTicket = (ticketId: ?string): boolean => {
    let matchUrl = '/app/ticket/'

    if (ticketId) {
        matchUrl += ticketId
    }

    return window.location.pathname.startsWith(matchUrl)
}

/**
 * Return true if user is currently on tickets view of passed view id, based on url
 * @param viewId
 * @param viewsState - state branch "views"
 * @returns {boolean}
 */
export const isCurrentlyOnView = (viewId: string = '', viewsState: viewsStateType = fromJS({})): boolean => {
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
export function getPluralObjectName(viewType: string): string {
    return viewType.replace('-list', 's')
}

/**
 * Check if user has reach maximum limit of a plan
 * @param limit name fo the limit, E.g: min, default, max
 * @param tickets number of tickets used for a period
 * @param plan A plan in `config.py` - billing section
 * @returns {boolean}
 */
export function hasReachedLimit(limit: string, tickets: number, plan: Iterable<*,*>): boolean {
    const freeTickets = plan.get('free_tickets', 0)
    return tickets >= plan.getIn(['limits', limit], freeTickets)
}

export function toQueryParams(obj: {}): string {
    return Object.keys(obj).map((key) => (
        `${key}=${encodeURIComponent(obj[key])}`
    )).join('&')
}

/**
 * Convert emoji chars to <img/> tags using Twitter Emoji (twemoji).
 * @param {String|Object} emojiContainer string or dom node with emojis
 * @returns {String|Object}
 */
export function emoji(emojiContainer: string | {}): string | {} {
    if (typeof window.twemoji === 'undefined') {
        return emojiContainer
    }

    return window.twemoji.parse(emojiContainer, {
        base: `${window.GORGIAS_ASSETS_URL}/static/emoji/`
    })
}

export function getActionTemplate(actionName: string): actionTemplateType {
    return ACTION_TEMPLATES.find(template => template.name === actionName) || {}
}

export const createImmutableSelector = createSelectorCreator(defaultMemoize, Immutable.is)

export function loadScript(url: string, callback: () => void) {
    const elem = document.createElement('script')
    const script = document.getElementsByTagName('script')[0]
    elem.src = url

    if (callback) {
        elem.addEventListener('load', callback)
    }

    // $FlowFixMe
    script.parentNode.insertBefore(elem, script)
}

/**
 * Upload file action meant to be used by another action
 * @param files
 * @return {Array} - [{content_type, name, size, url}]
 */
export const uploadFiles = (files: Array<attachmentType>): Promise<*> => {
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
export const stripErrorMessage = (text: string): string => {
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
export function humanizeString(text: string): string {
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
export const compare = (a: *, b: *): number => {
    if (a < b) {
        return -1
    }

    if (a > b) {
        return 1
    }

    return 0
}

/**
 * Return current route object from routes config
 * @param routes (this.props.routes in a component)
 */
export const currentRoute = (routes: Array<reactRouterRoute>): reactRouterRoute => {
    return _last(routes)
}

/**
 * Return subdomain of passed url
 * ex: 'acme' for 'http://acme.shopify.com'
 * @param url (full url, part of url, subdomain (without url))
 */
export const subdomain = (url: string): string => {
    if (!url) {
        return url
    }

    // split url on `.` and keep the first member
    const split = url.split('.')[0]

    // split url on `://` and keep the last part
    return _last(split.split('://'))
}

/**
 * Deep flatten object, keeping only values.
 */
const _valuesDeep = (obj: {}): {} => {
    if (typeof obj === 'object' && !obj.hasOwnProperty('length')) {
        return _flatMapDeep(obj, _valuesDeep)
    }

    return obj
}

/**
 * Add form errors coming from server to error.msg
 * This is used to display form errors in error notification
 * Ex: error: {msg: 'Failed to add message', data: {hello: ['world'], receiver: ['Missing data', 'Invalid value']}}
 * will return the same error with error.msg as:
 * "
 * Failed to add message
 *
 * - hello: world
 * - receiver: Missing data
 * - receiver: Invalid value
 * "
 * @param incomingError server error
 */
export const errorToChildren = (incomingError: {response: {data: {error:{data:{}}}}}): ?string => {
    const error = _get(incomingError, 'response.data.error', {})
    const {data} = error
    const hasErrors = !!data

    if (!hasErrors) {
        return null
    }

    return `
        <ul className="m-0">
            ${
        _map(data, (fieldErrors, fieldName) => {
            // $FlowFixMe
            return _valuesDeep(fieldErrors).map((fieldError) => {
                return `<li>${fieldName}: ${fieldError}</li>`
            }).join('')
        }).join('')
        }
        </ul>
    `
}

/**
 * Convert hours to seconds.
 * @param hours number of hours
 */
export function hoursToSeconds(hours: number = 0): number {
    if (typeof hours !== 'number') {
        return 0
    }

    return 60 * 60 * hours
}

/**
 * Function that wraps functionality for checking webhook urls
 * @param val - url string
 * @returns string of error messages if there are errors with url
 */
export const validateWebhookURL = (val: string): ?string => {
    const rules = [
        {
            test: /^((?!(\..)).)*$/,
            message: 'Invlalid URL'
        },
        {
            test: /^(?!https:).*:/,
            message: 'Only https protocol allowed'
        },
        {
            test: /(\.internal(\/.*)?|\.local(\/.*)?)$/,
            message: 'Invalid top level domain'
        },
        {
            test: /:\d/,
            message: 'No port specifications allowed'
        },
    ]

    const errors = []

    if (val) {
        const url = val.toLowerCase()

        rules.forEach((rule) => {
            if (rule.test.test(url)) {
                errors.push(rule.message)
            }
        })
    }

    if (errors.length === 0) {
        return null
    }

    return errors.join(' + ')
}

/**
 * Get the display name of a language from its locale name
 * @param locale: string
 * @returns: displayName: string
 */
export const getLanguageDisplayName = (locale: string): ?string => {

    if (!locale) {
        return null
    }

    const langObj = _find(TICKET_LANGUAGES, lang => {
        return lang.localeName === locale
    })

    return langObj ? langObj.displayName : null
}

/**
 * Open the smooch chat (if present)
 */
export const openChat = (e: Event) => {
    if (window.Smooch) {
        e.preventDefault()
        window.Smooch.open()
    }
}

/**
 * Unescape template variables from a string
 *
 * Input: `send email to %7B%7Bticket.requester.email%7D%7D`
 * Output: `send email to {{ticket.requester.email}}`
 */
export function unescapeTemplateVars(string: string): string {
    // `%7B%7B` : {{
    // `(?:${availableVariables.join('|')})` : variable needs to start by one of the available variable names in rules
    // `[\w\.\[\]` : followed by alphanumeric, dot or square bracket characters
    // `%7D%7D` : }}
    const reg = new RegExp(`%7B%7B((?:${availableVariables.join('|')})[\\w\\.\\[\\]]*?)%7D%7D`, 'g')
    return string.replace(reg, (_, match) => {
        return `{{${match}}}`
    })
}
