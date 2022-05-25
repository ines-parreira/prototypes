import crypto from 'crypto'

import {SyntheticEvent} from 'react'
import {EditorState, Modifier} from 'draft-js'
import escodegen from 'escodegen'
import esprima from 'esprima'
import htmlparser from 'htmlparser2'
import Immutable, {fromJS, Iterable, List, Map} from 'immutable'
import _filter from 'lodash/filter'
import _find from 'lodash/find'
import _get from 'lodash/get'
import _has from 'lodash/has'
import _isNumber from 'lodash/isNumber'
import _isString from 'lodash/isString'
import _isUndefined from 'lodash/isUndefined'
import _last from 'lodash/last'
import _trim from 'lodash/trim'
import _upperFirst from 'lodash/upperFirst'
import _startCase from 'lodash/startCase'
import md5 from 'md5'
import moment from 'moment-timezone'
import {
    createSelector,
    createSelectorCreator,
    defaultMemoize,
    Selector,
} from 'reselect'
import {Route} from 'react-router-dom'
import URLSafeBase64 from 'urlsafe-base64'

import {humanize} from './business/format'
import {ACTION_TEMPLATES} from './config'
import TICKET_LANGUAGES from './config/ticketLanguages'
import {AUTHORIZED_NOTIFICATION_TYPES} from './state/notifications/actions'
import {Notification, NotificationStatus} from './state/notifications/types'
import {ViewsState} from './state/views/types'
import {ActionTemplate, Attachment, Schemas} from './types'
import {USER_ROLES_ORDERED_BY_PRIVILEGES} from './config/user'
import {UserRole} from './config/types/user'
import {getHighestRole} from './state/agents/helpers'
import {RootState} from './state/types'
import {sanitizeHtmlDefault} from './utils/html'
import {isProduction} from './utils/environment'
import {linkify} from './utils/editor'
import client from './models/api/resources'
import {GorgiasApiResponseDataError} from './models/api/types'

export type Message = {
    id: number
    created_datetime: string
}
type Property = {
    type: string
    format: 'email'
    meta: Record<string, unknown>
    items: {$ref: Record<string, unknown>}
    $ref?: string
}
export type SystemMessage = [NotificationStatus, string]

type Datetime = Date | number | string

// monitor if tab is active or not
let activeTab = true
window.onfocus = () => (activeTab = true)
window.onblur = () => (activeTab = false)
export const isTabActive = () => activeTab

/**
 * Console log info only on dev environment
 */
export const devLog = (...args: Array<any>) => {
    if (!isProduction()) {
        // eslint-disable-next-line no-console
        console.log(...args)
    }
}

export const defined = (item: any): boolean => {
    return !_isUndefined(item) && item !== null
}

/**
 * Serialize an object and return it's md5 hash.
 */
export const getHashOfObj = (obj: any): string => md5(JSON.stringify(obj))

/**
 * Guess if a passed string is a url
 */
export function isUrl(string: string): string is string {
    if (!_isString(string)) {
        return false
    }

    return /^https?:\/\/.+/i.test(string)
}

/**
 * Guess if a passed string is an email
 */
export function isEmail(string: string): string is string {
    if (!_isString(string)) {
        return false
    }

    return /^[\w\.\-\+]+@[\w\.\-]+\.\w+$/i.test(string)
}

/**
 * Validate if string is a list of emails
 */
export function isEmailList(string?: string | null, delimiter = ','): boolean {
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
 */
export function isGorgiasSupportAddress(address: string): boolean {
    if (!_isString(address)) {
        return false
    }

    return /^support@[a-zA-Z0-9-]+.gorgias.io$/.test(address)
}

export function formatDatetime(
    datetime: Datetime,
    timezone?: string | null,
    format = 'calendar'
): Datetime {
    try {
        let momentDate = moment.utc(datetime)

        // if the input is a UNIX timestamp, force moment to interpret it as a timestamp (not automatic)
        const unix = moment.unix(datetime as any)
        if (unix.isValid()) {
            momentDate = unix
        }

        if (timezone) {
            momentDate = momentDate.tz(timezone)
        }

        if (format === 'calendar') {
            return momentDate.calendar(null, {
                lastWeek: 'dddd', // Tuesday, Friday, etc.. The default is: [Last] dddd
            })
        }

        return momentDate.format(format)
    } catch (e) {
        console.error('Failed to format datetime', e, datetime, timezone)
        return datetime
    }
}

export function getAST(code: string) {
    if (!_isString(code)) {
        console.error('Not a string:', code)
    }
    return esprima.parse(code, {loc: true})
}

export function getFirstExpressionOfAST(ast: ReturnType<typeof esprima.parse>) {
    return (fromJS(ast) as Map<any, any>).getIn([
        'body',
        0,
        'expression',
    ]) as Map<any, any>
}

export function getCode(ast: {type: 'Program'}): string {
    if (!_isString(ast.type)) {
        console.error('Not an AST:', ast)
    }
    return escodegen.generate(ast, {
        format: {
            semicolons: false,
        },
    })
}

/**
 * Return last message from a list of messages
 */
export function getLastMessage(
    messages: Array<Message>,
    options: any = null
): Maybe<Message> {
    if (!messages || !messages.length) {
        return
    }

    // most recent message sorted to first element of array
    return _filter(messages, options).sort((a, b) =>
        compare(b.created_datetime, a.created_datetime)
    )[0]
}

export function resolvePropertyName(name = ''): string {
    switch (name) {
        case 'Message':
            return 'TicketMessage'
        default:
            return name
    }
}

/**
 * Find API spec data of the last property of the given field
 */
export function findProperty(
    field: string,
    schemas: Schemas,
    alwaysRef = false
): Maybe<Property> {
    const parts = field.split('.')
    const firstPart = resolvePropertyName(_upperFirst(parts.shift()))
    const definitions = schemas.get('definitions') as Map<any, any>
    let def = definitions.get(firstPart) as Map<any, any>
    let prop

    if (!def) {
        return null
    }

    while (parts.length !== 0) {
        prop = def.getIn(['properties', parts.shift()]) as Map<any, any>

        if (!prop) {
            return null
        }

        prop = prop.toJS() as Property

        // if the current nested property has a `meta` field,
        // then we use it instead of the `meta` of it's definition
        if (parts.length === 1 && !alwaysRef && prop.meta) {
            break
        }

        const subDef = (prop.$ref ||
            (prop.items ? prop.items.$ref : null)) as Maybe<string>
        // if we have a ref then we need to redo the whole definition thing
        if (subDef) {
            def = definitions.get(subDef.replace('#/definitions/', ''))
        }
    }

    return prop
}

export function getDefaultOperator(
    field: string,
    schemas: Schemas
): Maybe<string> {
    const prop: Maybe<Record<string, unknown>> = findProperty(field, schemas)

    if (!prop) {
        return null
    }

    // return the default operator defined in the meta of the field, or the first if there's no default
    if (prop.meta && (prop.meta as Record<string, unknown>).operators) {
        const operators = Object.keys(
            (prop.meta as Record<string, unknown>).operators as Record<
                string,
                unknown
            >
        )

        if (operators.length) {
            if ((prop.meta as Record<string, unknown>).defaultOperator) {
                return operators.find(
                    (operatorName) =>
                        operatorName ===
                        (prop.meta as Record<string, unknown>).defaultOperator
                )
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
            if (prop.meta && (prop.meta as Record<string, unknown>).operators) {
                if (
                    _has(
                        (prop.meta as Record<string, unknown>).operators,
                        'containsAll'
                    )
                ) {
                    return 'containsAll'
                }
            }
            return 'eq'
        default:
            return 'eq'
    }
}

export function resolveLiteral(
    value: Record<string, unknown> | string,
    path: string
): string {
    switch (typeof value) {
        case 'object':
            return resolveLiteral(
                value[path.split('.').reverse()[0]] as any,
                path
            )
        default:
            return value
    }
}

export function compactInteger(input: number, digits = 0): string {
    if (!_isNumber(input)) {
        return input
    }

    const si = [
        {value: 1e18, symbol: 'E'},
        {value: 1e15, symbol: 'P'},
        {value: 1e12, symbol: 'T'},
        {value: 1e9, symbol: 'G'},
        {value: 1e6, symbol: 'M'},
        {value: 1e3, symbol: 'k'},
    ]
    const rx = /\.0+$|(\.[0-9]*[1-9])0+$/

    let result = input.toFixed(digits).replace(rx, '$1')

    si.reverse().forEach((s) => {
        if (input >= s.value) {
            result =
                (input / s.value).toFixed(digits).replace(rx, '$1') + s.symbol
        }
    })

    return result
}

export function stripHTML(text: string): Maybe<string> {
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
        console.error(`Failed stripHTML: ${e as string}`, text)
        return text
    }
}

const _proxyImageSignedURL = (url: string): string => {
    if (!window.IMAGE_PROXY_SIGN_KEY) {
        throw new Error('window.IMAGE_PROXY_SIGN_KEY is not defined')
    }
    //  The "s{signature}" option specifies an optional base64 encoded HMAC used to sign the remote URL in the request.
    // The HMAC key used to verify signatures is provided to the imageproxy server on startup.
    // https://godoc.org/willnorris.com/go/imageproxy#hdr-Signature
    return (
        's' +
        URLSafeBase64.encode(
            crypto
                .createHmac('sha256', window.IMAGE_PROXY_SIGN_KEY)
                .update(url)
                .digest()
        )
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
export const proxifyURL = (urlStr: string, format = 'cw-1'): string => {
    const url = new URL(urlStr)
    const escapedURL = `${url.origin}${url.pathname}${url.search}`
    return `${window.IMAGE_PROXY_URL}${format},${_proxyImageSignedURL(
        escapedURL
    )}/${escapedURL}`
}

/**
 * Append a proxy URL before the images src so we can control their width and protect our agents privacy
 */
export const proxifyImages = (html: string, format = '1000x'): string => {
    if (html.indexOf('img') === -1) {
        return html
    }

    if (!window.IMAGE_PROXY_URL) {
        throw new Error('window.IMAGE_PROXY_URL is not defined')
    }

    const selfClosing = [
        'img',
        'br',
        'hr',
        'area',
        'base',
        'basefont',
        'input',
        'link',
        'meta',
    ]

    let result = ''
    const parser = new htmlparser.Parser({
        onopentag: (name: string, attributes: Record<string, unknown>) => {
            result += `<${name}`
            const attributesKeys = Object.keys(attributes)
            // Add a space if we have attributes so we have nicely formatted tags: <tag attr="val">
            if (attributesKeys.length) {
                result += ' '
            }

            const attributePairs: string[] = []
            attributesKeys.forEach((k) => {
                let v = attributes[k] as string
                if (
                    name === 'img' &&
                    k === 'src' &&
                    (attributes.src as string).indexOf(
                        window.IMAGE_PROXY_URL
                    ) === -1
                ) {
                    try {
                        v = proxifyURL(attributes.src as string, format)
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
        ontext: (text: string) => {
            result += text
        },
        onclosetag: ((name: string) => {
            if (selfClosing.indexOf(name) === -1) {
                result += `</${name}>`
            }
        }) as any,
    })
    parser.write(html)
    parser.end()
    return result
}

/**
 * Slugify a string
 */
export function slugify(string: string): string {
    if (!_isString(string)) {
        return string
    }

    return encodeURIComponent(
        string.toLowerCase().trim().replace(/\//gi, '').replace(/[ ]/g, '-')
    )
}

/**
 * Insert text in editorState
 */
export function insertText(
    editorState: EditorState,
    text: string
): EditorState {
    const selection = editorState.getSelection()
    const contentState = editorState.getCurrentContent()
    const modifier = Modifier.replaceText(contentState, selection, text)
    return EditorState.push(editorState, modifier, 'insert-fragment')
}

/**
 * Insert link in editorState
 */
export function insertLink(
    editorState: EditorState,
    url: string,
    text?: string
): EditorState {
    const parsedUrl = linkify.match(url)?.[0]?.url || url

    let contentState = editorState
        .getCurrentContent()
        .createEntity('link', 'MUTABLE', {url: parsedUrl})
    const selection = editorState.getSelection()
    const entityKey = contentState.getLastCreatedEntityKey()

    contentState = Modifier.replaceText(
        contentState,
        selection,
        text || url,
        undefined,
        entityKey
    )
    return EditorState.push(editorState, contentState, 'apply-entity')
}

/**
 * Return true if passed object is immutable (from Immutable JS)
 */
export const isImmutable = (value: any): boolean =>
    Immutable.Iterable.isIterable(value)

/**
 * Return a passed object as immutable
 */
export const toImmutable = <T, U = Record<string, unknown>>(
    object: U | Iterable<any, any> | unknown[]
) => (isImmutable(object) ? object : fromJS(object)) as T

/**
 * Return a passed object as plain JS (not Immutable)
 */
// throws error on missing toJS() for plain object.
export const toJS = <T>(
    object:
        | Record<string, unknown>
        | Iterable<any, any>
        | void
        | Map<any, any>
        | List<any>
) => (isImmutable(object) ? (object as Iterable<any, any>).toJS() : object) as T

/**
 * Return field path
 */
export const fieldPath = (
    field: Record<string, unknown> | Iterable<any, any> = {}
): string => {
    const formattedField = toJS<Record<string, unknown>>(field)
    return (formattedField.path || formattedField.name) as string
}

/**
 * Test if user is admin
 */
export const isAdmin = (user: Map<any, any>): boolean => {
    return hasRole(user, UserRole.Admin)
}

// Check if a user has a role
export function hasRole(user: Map<any, any>, requiredRole: UserRole): boolean {
    const userRole = getHighestRole(user) as UserRole
    return (
        USER_ROLES_ORDERED_BY_PRIVILEGES.indexOf(userRole) >=
        USER_ROLES_ORDERED_BY_PRIVILEGES.indexOf(requiredRole)
    )
}

/**
 * Return true if user is currently on ticket of passed ticket id, based on url
 */
export const isCurrentlyOnTicket = (
    ticketId?: Maybe<string | number>
): boolean => {
    let matchUrl = '/app/ticket/'

    if (ticketId) {
        matchUrl += ticketId
    }

    return window.location.pathname.startsWith(matchUrl)
}

/**
 * Return true if user is currently on tickets view of passed view id, based on url
 */
export const isCurrentlyOnView = (
    viewId = '',
    viewsState: ViewsState = fromJS({})
): boolean => {
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
    return (
        urls.some((url) => currentUrl.includes(url)) ||
        ['/app', '/app/'].some((url) => currentUrl.endsWith(url))
    )
}

/**
 * return plural object name of a given view type
 */
export function getPluralObjectName(viewType: string): string {
    return viewType.replace('-list', 's')
}

export function toQueryParams(obj: Record<string, unknown>): string {
    return Object.keys(obj)
        .map((key) => `${key}=${encodeURIComponent(obj[key] as any)}`)
        .join('&')
}

export function getActionTemplate(actionName: string) {
    return ACTION_TEMPLATES.find(
        (template) => template.name === actionName
    ) as Maybe<ActionTemplate>
}

export const createImmutableSelector = createSelectorCreator(
    defaultMemoize,
    Immutable.is
) as typeof createSelector

export function loadScript(url: string, callback: () => void) {
    const elem = document.createElement('script')
    const script = document.getElementsByTagName('script')[0]
    elem.src = url

    if (callback) {
        elem.addEventListener('load', callback)
    }

    script.parentNode?.insertBefore(elem, script)
}

/**
 * Upload file action meant to be used by another action
 */
export const uploadFiles = (
    files: FileList | Array<Attachment> | File[],
    params: Maybe<Record<string, unknown>> = null
): Promise<Attachment[]> => {
    const formData = new window.FormData()

    for (let i = 0; i < files.length; i++) {
        const file = files[i]
        formData.append(file.name, file as any)
    }

    return client
        .post<Attachment[]>('/api/upload/', formData, {params: params || {}})
        .then((json) => json?.data)
}

/**
 * Clean error message sent from server before we display it
 */
export const stripErrorMessage = (text: string): string => {
    // Match all tags like [SHOPIFY] [full-refund] [STUFF-FOO-bar]
    const regex = /\[[\w-]+]/g
    let result = text.replace(regex, '')
    result = _trim(result, '. ')
    return result
}

/**
 * Transform object key to better like 'mainSteps' and 'order_id' to 'Main steps' and 'Order id'
 */
export function humanizeString(text: string): string {
    return humanize(text)
}

/**
 * Compare two values and return order symbol, used in sort for Immutable
 */
export const compare = (a: any, b: any): number => {
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
 */
export const currentRoute = (routes: Array<Route>) => {
    return _last(routes) as Route
}

/**
 * Return subdomain of passed url
 * ex: 'acme' for 'http://acme.shopify.com'
 */
export const subdomain = (url: string): string => {
    if (!url) {
        return url
    }

    // split url on `.` and keep the first member
    const split = url.split('.')[0]

    // split url on `://` and keep the last part
    return _last(split.split('://')) as string
}

type ValidationErrors = string | string[] | {[key: string]: ValidationErrors}

function flattenErrors(
    errors: ValidationErrors
): {key: string; value: string}[] {
    return Object.entries(errors).reduce(
        (acc: {key: string; value: string}[], [key, currentValue]) => {
            if (typeof currentValue === 'string') {
                acc.push({key, value: currentValue})
                return acc
            }

            if (Array.isArray(currentValue)) {
                return [
                    ...acc,
                    ...currentValue.map((error: string) => ({
                        key,
                        value: error,
                    })),
                ]
            }

            return [...acc, ...flattenErrors(currentValue)]
        },
        []
    )
}

export const errorToChildren = (
    incomingError: Record<string, unknown>
): string | null => {
    const error = _get(incomingError, 'response.data.error', {}) as
        | GorgiasApiResponseDataError
        | {data: never}
    const {data} = error
    const hasErrors = !!data

    if (!hasErrors) {
        return null
    }

    return `
        <ul className="m-0">
            ${flattenErrors(data as ValidationErrors)
                .map(({key, value}) =>
                    sanitizeHtmlDefault(`<li>${_startCase(key)}: ${value}</li>`)
                )
                .join('')}
        </ul>
    `
}

/**
 * Convert hours to seconds.
 */
export function hoursToSeconds(hours: number | string = 0): number {
    if (typeof hours !== 'number') {
        return 0
    }

    return 60 * 60 * hours
}

/**
 * Convert days to hours.
 */
export function daysToHours(days = 0): number {
    if (typeof days !== 'number') {
        return 0
    }

    return 24 * days
}

/**
 * Function that wraps functionality for cheking webhook url and return a valid or invalid pattern
 */
export const validateWebhookURLToPattern = (val: string) => {
    if (validateWebhookURL(val)) {
        // Will look for "a" after the end of the string -> impossible
        return '$a'
    }
    return '*'
}

/**
 * Function that wraps functionality for checking webhook urls
 */
export const validateWebhookURL = (val: string): Maybe<string> => {
    const rules = [
        {
            test: /^(?!https:).*:/,
            message: 'Only https protocol is allowed',
        },
        {
            /**
             * Looking for the lack of a ".", except if preceeded by [] which implies an IPv6 address
             * match: https://something
             * no match: https://something.else.com, https://[fe00:4860:4860::8888], https://82.127.10.1
             *  */
            test: /^((?!(\..)|(\[.*?\])).)*$/,
            message: 'Invalid url',
        },
        {
            /**
             * Looking for ":" plus a decimal, except if inside [] which is the IPv6 address notation
             * match: https://something.com:3000, https://[fe00:4860:4860::8888]:3000
             * no match: https://something.else.com, https://[fe00:4860:4860::8888]
             *  */
            test: /(:\d)(?![^\[]*\])/,
            message: 'No port specifications allowed',
        },
        {
            test: /(\.internal(\/.*)?|\.local(\/.*)?)$/,
            message: 'Invalid top level domain',
        },
        {
            test: /^https:\/\/((10\.)|(127\.)|(172\.1[6-9]\.)|(172\.2[0-9]\.)|(172\.3[0-1]\.)|(192\.168\.)|(\[f[cd]))/,
            message: 'You must not specify a private / local address',
        },
    ]

    let error

    if (val) {
        const url = val.toLowerCase().split('?')[0] // query could create false positive in regexp
        error = rules.find((rule) => rule.test.test(url))?.message
    }

    return error || null
}

/**
 * Get the display name of a language from its locale name
 */
export const getLanguageDisplayName = (
    locale: Maybe<string>
): string | null => {
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
 * Open the gorgias chat (if present)
 */
export const openChat = (e: SyntheticEvent) => {
    if (window.GorgiasChat) {
        e.preventDefault()
        window.GorgiasChat.open()
    }
}

export const transformSystemMessagesToNotifications = (
    systemMessages: Array<SystemMessage>
): Array<Notification> => {
    return systemMessages.map((systemMessage) => ({
        status:
            AUTHORIZED_NOTIFICATION_TYPES.indexOf(systemMessage[0]) > -1
                ? systemMessage[0]
                : NotificationStatus.Info,
        message: systemMessage[1],
    }))
}

/*
 * Remove '/' symbols used for escaping in regex.
 */
export const displayRestrictedSymbols = (symbols: Array<string>): string => {
    return symbols.join('').replace(/\\/g, '')
}

/*
 * lighten or darken a color (https://css-tricks.com/snippets/javascript/lighten-darken-color/)
 */
export const lightenDarkenColor = (color: string, amount: number): string => {
    let usePound = false
    let colorString = color

    if (color[0] === '#') {
        colorString = color.slice(1)
        usePound = true
    }

    const colorHex = parseInt(colorString, 16)

    let r = (colorHex >> 16) + amount
    r = r > 255 ? 255 : r < 0 ? 0 : r

    let g = ((colorHex >> 8) & 0x00ff) + amount
    g = g > 255 ? 255 : g < 0 ? 0 : g

    let b = (colorHex & 0x0000ff) + amount
    b = b > 255 ? 255 : b < 0 ? 0 : b

    return (
        (usePound ? '#' : '') +
        (b | (g << 8) | (r << 16)).toString(16).padStart(6, '0')
    )
}

/*
 * get an RGBA triplet from a hexadecimal value
 */
export const toRGBA = (color: string, alpha = 1): string => {
    let colorString = color

    if (color[0] === '#') {
        colorString = color.slice(1)
    }

    const colorHex = parseInt(colorString, 16)

    const r = colorHex >> 16
    const g = (colorHex >> 8) & 0x00ff
    const b = colorHex & 0x0000ff

    return `rgba(${r},${g},${b},${alpha})`
}

export const makeGetPlainJS = <T = unknown, S = RootState>(
    selector: Selector<S, Iterable<any, any>>
) =>
    createSelector<S, T, Iterable<any, any>>(
        selector,
        (data: Iterable<any, any>) => data.toJS() as T
    )

export function createTypeGuard<
    Input,
    Output extends Input,
    Args extends unknown[] = []
>(f: (value: Input, ...args: Args) => Output | undefined) {
    return (value: Input, ...args: Args): value is Output => {
        return f(value, ...args) !== undefined
    }
}

export const getIconFromUrl = (url: string): string => {
    //eslint-disable-next-line  @typescript-eslint/no-var-requires
    return url ? (require(`assets/img/${url}`) as string) : ''
}

// Feature flags
export const isContactFormEnabled = () => {
    return !isProduction()
}
