// @flow
import crypto from 'crypto'

import axios from 'axios'
import {EditorState, Modifier} from 'draft-js'
import escodegen from 'escodegen'
import esprima from 'esprima'
import htmlparser from 'htmlparser2'
// $FlowFixMe: will be fixed with immutable 4.x
import Immutable, {fromJS, type Iterable, type Map} from 'immutable'
import _ from 'lodash'
import _filter from 'lodash/filter'
import _find from 'lodash/find'
import _flatMapDeep from 'lodash/flatMapDeep'
import _get from 'lodash/get'
import _has from 'lodash/has'
import _isNumber from 'lodash/isNumber'
import _isString from 'lodash/isString'
import _last from 'lodash/last'
import _map from 'lodash/map'
import _trim from 'lodash/trim'
import _upperFirst from 'lodash/upperFirst'
import md5 from 'md5'
import moment from 'moment-timezone'
import {createSelectorCreator, defaultMemoize} from 'reselect'
import URLSafeBase64 from 'urlsafe-base64'

import {ACTION_TEMPLATES} from './config'
import TICKET_LANGUAGES from './config/ticketLanguages'
import {AUTHORIZED_NOTIFICATION_TYPES, type notificationType} from './state/notifications/actions'
import type {viewsStateType} from './state/views/types'
import type {actionTemplateType, esprimaParse, reactRouterRoute, schemasType} from './types'
import {ADMIN_ROLE, USER_ROLES_ORDERED_BY_PRIVILEGES} from './config/user'
import {getHighestRole} from './state/agents/helpers'

type userType = Map<*, *>
type messageType = {
    created_datetime: Date,
    source: { type: string }
}
type propertyType = {
    type: string,
    meta: {},
    items: { $ref: {} }
}
type systemMessage = ['success' | 'error' | 'warning' | 'info' | 'loading', string]

type datetimeType = Date | number | string

// monitor if tab is active or not
let activeTab = true
window.onfocus = () => activeTab = true
window.onblur = () => activeTab = false
export const isTabActive = () => activeTab

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
export const getHashOfObj = (obj: any): string => md5(JSON.stringify(obj))

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

    return addresses.every((address) => isEmail(address.trim()))
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

export function formatDatetime(datetime: datetimeType, timezone: ?string, format: string = 'calendar'): datetimeType {
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

export function getFirstExpressionOfAST(ast: esprimaParse): Map<*, *> {
    return fromJS(ast).getIn(['body', 0, 'expression'])
}

export function getCode(ast: { type: string }): string {
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
 * @param {String} field the field path. E.g: ticket.customer.id
 * @param {Object} schemas OpenID Schemas
 * @param {Boolean} alwaysRef always use `$ref` of each property to resolve field
 *     E.g:
 *      true: return properties of `Customer.id` because `customer` is a `Customer`
 *      false: return properties of `ticket.customer.id` field
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

export function getDefaultOperator(field: string, schemas: schemasType): ?string {
    const prop: ?Object = findProperty(field, schemas)

    if (!prop) {
        return null
    }

    // return the default operator defined in the meta of the field, or the first if there's no default
    if (prop.meta && prop.meta.operators) {
        const operators = Object.keys(prop.meta.operators)

        if (operators.length) {
            if (prop.meta.defaultOperator) {
                return operators.find((operatorName) => operatorName === prop.meta.defaultOperator)
            }
            return operators[0]
        }
    }

    // return an operator based on the type of the field
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

const _proxyImageSignedURL = (url: string): string => {
    if (!window.IMAGE_PROXY_PUBLIC_SIGN_KEY) {
        throw new Error('window.IMAGE_PROXY_PUBLIC_SIGN_KEY is not defined')
    }
    //  The "s{signature}" option specifies an optional base64 encoded HMAC used to sign the remote URL in the request.
    // The HMAC key used to verify signatures is provided to the imageproxy server on startup.
    // https://godoc.org/willnorris.com/go/imageproxy#hdr-Signature
    return 's' + URLSafeBase64.encode(
        crypto.createHmac('sha256', window.IMAGE_PROXY_PUBLIC_SIGN_KEY).update(url).digest()
    )
}

/**
 * Append a proxy URL before an image url, for signing/resizing/cropping.
 *
 * The default format string `cw-1` is a hack for https://github.com/willnorris/imageproxy
 * to maintain the full image width/height, but still parse the image (eg. exif rotation).
 * imageproxy has no explicit option for it.
 * https://godoc.org/willnorris.com/go/imageproxy#ParseOptions
 */
export const proxifyURL = (urlStr: string, format: string = 'cw-1'): string => {
    const url = new URL(urlStr)
    let escapedURL = `${url.origin}${url.pathname}${url.search}`
    return `${window.IMAGE_PROXY_URL}${format},${_proxyImageSignedURL(escapedURL)}/${escapedURL}`
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
                    try {
                        v = proxifyURL(attributes.src, format)
                    } catch (error) {
                        console.error(error)
                    }
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

    return encodeURIComponent(string
        .toLowerCase()
        .trim()
        .replace(/\//ig, '')
        .replace(/[ ]/g, '-'))
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
 * Return true if passed object is immutable (from Immutable JS)
 * @param object
 */
export const isImmutable = (object: {} | Iterable<*, *>): boolean => Immutable.Iterable.isIterable(object)

/**
 * Return a passed object as immutable
 * @param object
 */
export const toImmutable = (object: {} | Iterable<*, *>): any => isImmutable(object) ? object : fromJS(object)

/**
 * Return a passed object as plain JS (not Immutable)
 * @param object
 */
// throws error on missing toJS() for plain object.
// $FlowFixMe
export const toJS = (object: {} | Iterable<*, *> | void): any => isImmutable(object) ? object.toJS() : object

/**
 * Return field path
 * @param field
 * @returns {*|string|string|string}
 */
export const fieldPath = (field: {} | Iterable<*, *> = {}): string => {
    field = toJS(field)
    // $FlowFixMe
    return field.path || field.name
}

/**
 * Test if user is admin
 * @param user
 * @returns {boolean}
 */
export const isAdmin = (user: userType): boolean => {
    return hasRole(user, ADMIN_ROLE)
}

// Check if a user has a role
export function hasRole(user: userType, requiredRole: string): boolean {
    const userRole = getHighestRole(user)
    return USER_ROLES_ORDERED_BY_PRIVILEGES.indexOf(userRole) >= USER_ROLES_ORDERED_BY_PRIVILEGES.indexOf(requiredRole)
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
        '/app/customers',
        // TODO(customers-migration): remove this path when we updated all links in email templates.
        '/app/users',
    ]

    let urls = prefix.map((p) => `${p}/${viewId}`)

    // if no viewId is specified, check root routes to views (without ids)
    // or if current active view is the asked one
    if (!viewId || viewsState.getIn(['active', 'id']) === viewId) {
        urls = urls.concat(prefix)
    }

    const currentUrl = window.location.pathname.split('?')[0]

    // keep this syntax, no urls.some(url => currentUrl.includes(url)) since we want the pathname to be initiated on
    // each call of the parent function
    return urls.some((url) => currentUrl.includes(url)) || ['/app', '/app/'].some((url) => currentUrl.endsWith(url))
}

/**
 * return plural object name of a given view type
 * @param {String} viewType E.g: customer-list, ticket-list
 * @returns {String} plural object name E.g: customers, tickets
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
export function hasReachedLimit(limit: string, tickets: number, plan: Iterable<*, *>): boolean {
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
    return ACTION_TEMPLATES.find((template) => template.name === actionName) || {}
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
 * @param type: the type of file we're uploading
 * @return {Array} - [{content_type, name, size, url}]
 */
export const uploadFiles = (files: FileList | Array<File>, type: string = ''): Promise<*> => {
    const formData = new window.FormData()

    for (let i = 0; i < files.length; i++) {
        const file = files[i]
        formData.append(file.name, file)
    }

    return axios.post(`/api/upload/${type ? `?type=${type}` : ''}`, formData)
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
        .replace(/[-_.\s]+/g, ' ')
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
        //$FlowFixMe
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
export const errorToChildren = (incomingError: { response: { data: { error: { data: {} } } } }): ?string => {
    const error = _get(incomingError, 'response.data.error', {})
    const {data} = error
    const hasErrors = !!data

    if (!hasErrors) {
        return null
    }

    return `
        <ul className="m-0">
            ${
    //$FlowFixMe
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
 * Convert days to hours.
 * @param days number of days
 */
export function daysToHours(days: number = 0): number {
    if (typeof days !== 'number') {
        return 0
    }

    return 24 * days
}


/**
 * Function that wraps functionality for cheking webhook url and return a valid or invalid pattern
 * @param val - url string
 * @returns invalid pattern if there are errors with url
 */
export const validateWebhookURLToPattern = (val: string): ?string => {
    if (validateWebhookURL(val)) {
        // Will look for "a" after the end of the string -> impossible
        return '$a'
    }
    return '*'
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
            message: 'Invalid URL'
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

    const langObj = _find(TICKET_LANGUAGES, (lang) => {
        return lang.localeName === locale
    })

    return langObj ? langObj.displayName : null
}

/**
 * Check if the given string contains unicode characters
 * @param needle: string
 * @returns: bool
 */
export const hasUnicodeChars = (needle: string): boolean => {
    const needleLength = needle.length

    for (let index = 0; index < needleLength; index++) {
        if (needle.charCodeAt(index) > 255) {
            return true
        }
    }

    return false
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

export const transformSystemMessagesToNotifications = (systemMessages: Array<systemMessage>):
    Array<notificationType> => {
    return systemMessages.map((systemMessage) => ({
        status: AUTHORIZED_NOTIFICATION_TYPES.indexOf(systemMessage[0]) > -1 ? systemMessage[0] : 'info',
        message: systemMessage[1],
    }))
}

/**
 * Display experimental features when in development or when a Gorgias staff is logged in
 */
export const shouldDisplayExperiment = (): boolean => {
    return window.DEVELOPMENT ||
        [
            'begummytimbuk2.gorgias.io',
            'darngoodyarn.gorgias.io',
            'esther-co.gorgias.io',
            'gorgias.gorgias.io',
            'love-your-melon.gorgias.io',
            'timbuk2.gorgias.io',
        ].includes(window.location.hostname) ||
        document.cookie.includes('is_gorgias_staff')
}
