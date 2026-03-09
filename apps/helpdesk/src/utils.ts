import type {
    MouseEvent as MouseEventReact,
    SyntheticEvent,
    TouchEvent as TouchEventReact,
} from 'react'

import { envVars, isProduction, isStaging } from '@repo/utils'
import crypto from 'crypto'
import { EditorState, Modifier } from 'draft-js'
import escodegen from 'escodegen'
import * as esprima from 'esprima'
import htmlparser from 'htmlparser2'
import type { Iterable, List, Map } from 'immutable'
import Immutable, { fromJS } from 'immutable'
import _filter from 'lodash/filter'
import _get from 'lodash/get'
import _has from 'lodash/has'
import _isNumber from 'lodash/isNumber'
import _isString from 'lodash/isString'
import _isUndefined from 'lodash/isUndefined'
import _last from 'lodash/last'
import _startCase from 'lodash/startCase'
import _trim from 'lodash/trim'
import _upperFirst from 'lodash/upperFirst'
import md5 from 'md5'
import type { Moment } from 'moment-timezone'
import type { Route } from 'react-router-dom'
import type { Selector } from 'reselect'
import { createSelector, createSelectorCreator, defaultMemoize } from 'reselect'
import URLSafeBase64 from 'urlsafe-base64'

import { fromAST, isImmutable, isPrivateAsset } from 'common/utils'
import type { TicketEvent } from 'models/ticket/types'
import type { VoiceCall } from 'models/voiceCall/types'

import { humanize } from './business/format'
import { TicketChannel } from './business/types/ticket'
import { ACTION_TEMPLATES } from './config'
import { UserRole } from './config/types/user'
import { USER_ROLES_ORDERED_BY_PRIVILEGES } from './config/user'
import type { GorgiasApiResponseDataError } from './models/api/types'
import type { AlertNotification } from './state/notifications/types'
import { NotificationStatus } from './state/notifications/types'
import type { RootState } from './state/types'
import type { ViewsState } from './state/views/types'
import type { NonEmptyArray, Schemas } from './types'
import { sanitizeHtmlDefault } from './utils/html'
import { linkify } from './utils/linkify'

export type Message = {
    id: number
    created_datetime: string
}
// Test
type Property = {
    type: string
    format: 'email'
    meta: Record<string, unknown>
    items: { $ref: Record<string, unknown> }
    $ref?: string
}
export type SystemMessage = [NotificationStatus, string]

/**
 * @deprecated
 * @date 2025-12-03
 * @type migration to @repo/utils
 */
export type Datetime = Date | Moment | number | string

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
 * Guess if a passed string is a domain
 */
export function isDomain(string: string): string is string {
    if (!_isString(string)) {
        return false
    }

    return /^(((?!-))(xn--)?[a-z0-9][a-z0-9-_]{0,61}[a-z0-9]{0,1}\.){1,}([a-z]{2,})$/i.test(
        string,
    )
}

/**
 * @deprecated
 * @date 2025-12-03
 * @type migration to @repo/utils
 *
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

export function getAST(code: string): esprima.Program {
    if (!_isString(code)) {
        console.error('Not a string:', code)
    }
    return esprima.parseScript(code, { loc: true })
}

export function getFirstExpressionOfAST(ast: esprima.Program) {
    return (fromAST(ast) as Map<any, any>).getIn([
        'body',
        0,
        'expression',
    ]) as Map<any, any>
}

export function getCode(ast: esprima.Program): string {
    if (!_isString(ast.type)) {
        console.error('Not an AST:', ast)
    }
    return escodegen.generate(ast, {
        format: {
            semicolons: false,
            escapeless: true,
        },
    })
}

/**
 * Return last message from a list of messages
 */
export function getLastMessage(
    messages: Array<Message>,
    options: any = null,
): Maybe<Message> {
    if (!messages || !messages.length) {
        return
    }

    // most recent message sorted to first element of array
    return _filter(messages, options).sort((a, b) =>
        compare(b.created_datetime, a.created_datetime),
    )[0]
}

export function getLastEvent(events: Array<TicketEvent>): Maybe<TicketEvent> {
    if (!events || !events.length) {
        return
    }

    return events.sort((a, b) =>
        compare(b.created_datetime, a.created_datetime),
    )[0]
}

export function isLastItemInTicketAVoiceCall(
    lastMessage: Maybe<Map<any, any>>,
    lastVoiceCall: Maybe<VoiceCall>,
): boolean {
    if (!lastVoiceCall) {
        return false
    }
    if (!lastMessage) {
        return true
    }
    return lastVoiceCall.created_datetime > lastMessage.get('created_datetime')
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
    alwaysRef = false,
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
    schemas: Schemas,
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
            >,
        )

        if (operators.length) {
            if ((prop.meta as Record<string, unknown>).defaultOperator) {
                return operators.find(
                    (operatorName) =>
                        operatorName ===
                        (prop.meta as Record<string, unknown>).defaultOperator,
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
                        'containsAll',
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
    path: string,
): string {
    switch (typeof value) {
        case 'object':
            return resolveLiteral(
                value[path.split('.').reverse()[0]] as any,
                path,
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
        { value: 1e18, symbol: 'E' },
        { value: 1e15, symbol: 'P' },
        { value: 1e12, symbol: 'T' },
        { value: 1e9, symbol: 'G' },
        { value: 1e6, symbol: 'M' },
        { value: 1e3, symbol: 'k' },
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

export const replaceAttachmentURLToExternalSource = (url: string) => {
    const regex = new RegExp(/(.*?)(?:[&?]format.*)?$/i)
    const src = url.match(regex)?.[1] ?? url

    return replaceAttachmentURL(src, undefined, true)
}

/**
 * @deprecated use the @repo/utils version instead
 * @date 2026-03-02
 * @type migration to @repo/utils
 */
export const replaceAttachmentURL = (
    url: string,
    format?: string,
    isInternalSource?: boolean,
) => {
    const ATTACHMENT_PATH = 'api/attachment/download'
    const accountDomain = window.GORGIAS_STATE.currentAccount.domain

    let formatParam = ''
    if (format) {
        if (url.includes('?')) {
            formatParam = `&format=${format}`
        } else {
            formatParam = `?format=${format}`
        }
    }

    if (isProduction()) {
        const hostnameTLD = location.hostname.split('.').pop()
        const tld = hostnameTLD === 'io' ? 'io' : 'com'

        return isInternalSource
            ? url.replace(
                  `//${accountDomain}.gorgias.${tld}/${ATTACHMENT_PATH}`,
                  '//uploads.gorgias.io',
              )
            : url.replace(
                  '//uploads.gorgias.io',
                  `//${accountDomain}.gorgias.${tld}/${ATTACHMENT_PATH}`,
              ) + formatParam
    }

    if (isStaging()) {
        return isInternalSource
            ? url.replace(
                  `//${accountDomain}.gorgias.xyz/${ATTACHMENT_PATH}`,
                  '//uploads.gorgias.xyz',
              )
            : url.replace(
                  '//uploads.gorgias.xyz',
                  `//${accountDomain}.gorgias.xyz/${ATTACHMENT_PATH}`,
              ) + formatParam
    }

    return isInternalSource
        ? url.replace(
              `http://${accountDomain}.gorgias.docker/${ATTACHMENT_PATH}`,
              'https://uploads.gorgi.us/development',
          )
        : url.replace(
              'https://uploads.gorgi.us/development',
              `http://${accountDomain}.gorgias.docker/${ATTACHMENT_PATH}`,
          ) + formatParam
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
                .digest(),
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
 *
 * @deprecated use the @repo/utils version instead
 * @date 2026-03-02
 * @type migration to @repo/utils
 */
export const proxifyURL = (urlStr: string, format = 'cw-1'): string => {
    const url = new URL(urlStr)
    const escapedURL = `${url.origin}${url.pathname}${url.search}`
    return `${window.IMAGE_PROXY_URL}${format},${_proxyImageSignedURL(
        escapedURL,
    )}/${escapedURL}`
}

const proxifyImage = (
    attributes: Record<string, unknown>,
    imageFormat: string,
) => {
    let v: string
    try {
        v = proxifyURL(attributes.src as string, imageFormat)
        return v
    } catch (error) {
        console.error(error)
    }
}

/**
 * Parse media in html according to HTML tag
 * - Append a proxy URL before the images src so we can control their width and protect our agents privacy
 * - Replace Aircall audio src with the new attachment URL
 * - Prefix anchor tags pointing to attachments with a the new attachment URL
 *
 * @deprecated use the @repo/utils version instead
 * @date 2026-03-02
 * @type migration to @repo/utils
 */
export const parseMedia = (html: string, imageFormat = '1000x'): string => {
    const handledTags = ['a', 'audio', 'img']
    if (!handledTags.some((tag) => html.includes(`<${tag} `))) {
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
                    typeof attributes.src === 'string' &&
                    !attributes.src.startsWith('data:image') &&
                    attributes.src.indexOf(window.IMAGE_PROXY_URL) === -1
                ) {
                    if (isPrivateAsset(attributes.src as string)) {
                        v = replaceAttachmentURL(
                            attributes.src as string,
                            imageFormat,
                        )
                    } else {
                        v = proxifyImage(attributes, imageFormat) as string
                    }
                }
                if (name === 'audio' && k === 'src') {
                    v = replaceAttachmentURL(attributes.src as string)
                }
                if (name === 'a' && k === 'href') {
                    v = replaceAttachmentURL(attributes.href as string)
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
        string.toLowerCase().trim().replace(/\//gi, '').replace(/[ ]/g, '-'),
    )
}

/**
 * Insert text in editorState
 */
export function insertText(
    editorState: EditorState,
    text: string,
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
    text?: string,
): EditorState {
    const parsedUrl = linkify.match(url)?.[0]?.url || url

    let contentState = editorState
        .getCurrentContent()
        .createEntity('link', 'MUTABLE', { url: parsedUrl })
    const selection = editorState.getSelection()
    const entityKey = contentState.getLastCreatedEntityKey()

    contentState = Modifier.replaceText(
        contentState,
        selection,
        text || url,
        undefined,
        entityKey,
    )
    return EditorState.push(editorState, contentState, 'apply-entity')
}

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
        | List<any>,
) => (isImmutable(object) ? (object as Iterable<any, any>).toJS() : object) as T

/**
 * Return field path
 */
export const fieldPath = (
    field: Record<string, unknown> | Iterable<any, any> = {},
): string => {
    const formattedField = toJS<Record<string, unknown>>(field)
    return (formattedField.path || formattedField.name) as string
}

/**
 * @deprecated Use isAdmin from @repo/utils package instead
 * @date 2025-11-18
 * @type permissions-migration
 */
export const isAdmin = (user: Map<any, any>): boolean => {
    return hasRole(user, UserRole.Admin)
}

/**
 * @deprecated Use hasAgentPrivileges from @repo/utils package instead
 * @date 2025-11-18
 * @type permissions-migration
 */
export const hasAgentPrivileges = (user: Map<any, any>): boolean => {
    return hasRole(user, UserRole.Agent)
}

/**
 * @deprecated Use isTeamLead from @repo/utils package instead
 * @date 2025-11-18
 * @type permissions-migration
 */
export const isTeamLead = hasAgentPrivileges

/**
 * @deprecated Use hasRole from @repo/utils package instead
 * @date 2025-11-18
 * @type permissions-migration
 */
export function hasRole(user: Map<any, any>, requiredRole: UserRole): boolean {
    const userRole = user.getIn(['role', 'name'])
    return (
        USER_ROLES_ORDERED_BY_PRIVILEGES.indexOf(userRole) >=
        USER_ROLES_ORDERED_BY_PRIVILEGES.indexOf(requiredRole)
    )
}

/**
 * Return true if user is currently on ticket of passed ticket id, based on url
 */
export const isCurrentlyOnTicket = (
    ticketId?: Maybe<string | number>,
): boolean => {
    const { pathname } = window.location
    let matchUrl = '/app/ticket/'

    if (ticketId) {
        matchUrl += ticketId
    }

    if (pathname.startsWith(matchUrl)) {
        return true
    }

    const match = pathname.match(/\/app\/views\/\d+\/(\d+)/)
    if (!match || !match[1]) return false

    const ticketIdParam = parseInt(match[1], 10)
    return ticketId === ticketIdParam
}

/**
 * Return true if user is currently on tickets view of passed view id, based on url
 */
export const isCurrentlyOnView = (
    viewId = '',
    viewsState: ViewsState = fromJS({}),
): boolean => {
    const prefix = ['/app/tickets', '/app/views', '/app/customers']

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
 * Return true if user is currently on a chat campaign details page (edit page) .
 */
export const isCurrentlyOnCampaignDetailsPage = (): boolean => {
    const regex = /^\/app\/convert\/\d+\/campaigns\/.+$/

    return regex.test(window.location.pathname)
}

/**
 * Return true if user is currently on a ticket / views page.
 * It will return true if user is on :
 * - strictly '/app' with nothing after
 * - strictly '/app/tickets' with nothing after
 * - strictly '/app/views' with nothing after
 * - any path starting with and containing '/app/ticket/' or '/app/tickets/'
 * - any path starting with and containing '/app/views/'
 * - it will exclude '/app/ticket/new'
 */
export const isTicketPath = (path: string) => {
    const regex =
        /^\/app(?:\/tickets)?(?:\/views)?(?:\/ticket(?:\/(?!new).*)?|\/tickets\/.*|\/views\/.*)?$/
    return regex.test(path)
}

/**
 * Similar to previous regex
 * except it enforces stricter param validation
 * and allows no sub-paths
 */
export const isStrictTicketPath = (path: string) => {
    const regex =
        /^\/app$|^\/app\/tickets$|^\/app\/views$|^\/app\/ticket\/\d+$|^\/app\/tickets\/\d+$|^\/app\/views\/\d+(\/\d+)?$/
    return regex.test(path)
}

export const isDirectTicketPath = (path: string) => {
    const regex = /^\/app\/ticket\/\d+$/
    return regex.test(path)
}

export const isCurrentlyOnCustomerPage = (customerId: string | number) => {
    return (
        window.location.pathname === `/app/customer/${customerId}` ||
        window.location.pathname.startsWith(`/app/customer/${customerId}/`)
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
    return ACTION_TEMPLATES.find((template) => template.name === actionName)
}

export const createImmutableSelector = createSelectorCreator(
    defaultMemoize,
    Immutable.is,
) as typeof createSelector

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

type ValidationErrors = string | string[] | { [key: string]: ValidationErrors }

function flattenErrors(
    errors: ValidationErrors,
): { key: string; value: string }[] {
    return Object.entries(errors).reduce(
        (acc: { key: string; value: string }[], [key, currentValue]) => {
            if (typeof currentValue === 'string') {
                acc.push({ key, value: currentValue })
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
        [],
    )
}

export const errorToChildren = (incomingError: unknown): string | null => {
    const error = _get(incomingError, 'response.data.error', {}) as
        | GorgiasApiResponseDataError
        | { data: never }
    const { data } = error
    const hasErrors = !!data

    if (!hasErrors) {
        return null
    }

    return `
        <ul className="m-0">
            ${flattenErrors(data as ValidationErrors)
                .map(({ key, value }) =>
                    sanitizeHtmlDefault(
                        `<li>${_startCase(key)}: ${value}</li>`,
                    ),
                )
                .join('')}
        </ul>
    `
}

/**
 * Function that wraps functionality for checking webhook url and return a valid or invalid pattern
 */
export const validateWebhookURLToPattern = (
    val: string,
    allowWebPorts = false,
) => {
    if (validateWebhookURL(val, allowWebPorts)) {
        // Will look for "a" after the end of the string -> impossible
        return '$a'
    }
    return '*'
}

/**
 * Function that wraps functionality for checking webhook urls
 */
export const validateWebhookURL = (
    val: string,
    allowWebPorts = false,
): Maybe<string> => {
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
        allowWebPorts
            ? {
                  test: (url: string) => {
                      try {
                          const parsedUrl = new URL(url)
                          return parsedUrl.port
                              ? !/^(443|8\d|808\d)$/.test(parsedUrl.port)
                              : false
                      } catch {
                          return true
                      }
                  },
                  message: 'Port not allowed',
              }
            : {
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
        error = rules.find((rule) =>
            rule.test instanceof Function
                ? rule.test(url)
                : rule.test.test(url),
        )?.message
    }

    return error || null
}

/**
 * Get the display name of a language from its locale name
 */
export const getLanguageDisplayName = (
    locale: Maybe<string>,
): string | null => {
    if (!locale) {
        return null
    }

    const displayName = new Intl.DisplayNames('en', {
        type: 'language',
        languageDisplay: 'standard',
    }).of(locale)

    return displayName ?? null
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

export const toggleChat = () => {
    if (!window.GorgiasChat) {
        return
    }

    if (window.GorgiasChat.isOpen()) {
        window.GorgiasChat.close()
    } else {
        window.GorgiasChat.open()
    }
}

export const transformSystemMessagesToNotifications = (
    systemMessages: Array<SystemMessage>,
): Array<AlertNotification> => {
    return systemMessages.map((systemMessage) => ({
        status: Object.values(NotificationStatus).includes(systemMessage[0])
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
    selector: Selector<S, Iterable<any, any>>,
) => createSelector(selector, (data: Iterable<any, any>) => data.toJS() as T)

export const getIconFromUrl = (url: string): string => {
    //eslint-disable-next-line  @typescript-eslint/no-var-requires
    return url ? (require(`assets/img/${url}`) as string) : ''
}

export function assetsUrl(filepath: string): string {
    const assetsUrl = envVars.GORGIAS_ASSETS_URL ?? ''
    if (!isUrl(assetsUrl)) {
        return ['/assets', filepath].join('/').replace(/\/{2,}/g, '/')
    }

    const url = new URL(assetsUrl)
    url.pathname = [url.pathname, 'assets', filepath]
        .join('/')
        .replace(/\/{2,}/g, '/')
    return url.toString()
}

/**
 * This function can be called in the default case of some switch
 * statements so that the switch is exhaustive. See (https://stackoverflow.com/a/39419171).
 *
 * This is useful since TS will show and error if we add another option to a type but don't handle
 * it in the switch.
 */
export function unreachable(v: never): never {
    // It's not clear what to return in this case. We could throw an error for example
    return v
}

/**
 * Wrapper around the `Object.keys()` function that returns a correctly typed
 * array of keys instead of just `string[]`
 *
 * @param value An object from which to extract the keys
 */
export function objKeys<T extends object>(value: T): (keyof T)[] {
    return Object.keys(value) as (keyof T)[]
}

/**
 * Type guard that checks if a value is not 'null' or 'undefined'
 * Very convenient when using the 'filter' function on arrays
 */
export function notEmpty<T>(elem: T | null | undefined): elem is T {
    return elem !== null && elem !== undefined
}

/**
 * Type guard that checks if the array is not empty
 */
export function isNotEmptyArray<T>(arr: T[]): arr is NonEmptyArray<T> {
    const truthyElements = arr.filter(notEmpty)
    return truthyElements.length > 0
}

/**
 * Helper to determine if we can add a embedded video to the draftjs editor.
 * It is mainly scoped toward the GorgiasChat integration at the moment.
 * @param newMessageChannel
 * @param isNewMessagePublic
 * @returns
 */
export function canAddVideoPlayer(
    newMessageChannel: TicketChannel,
    isNewMessagePublic: boolean,
): boolean {
    return (
        // If currently writting a chat ticket message.
        newMessageChannel === TicketChannel.Chat ||
        // Or an internal note.
        isNewMessagePublic === false ||
        // Or currently editing a chat campaign content.
        isCurrentlyOnCampaignDetailsPage()
    )
}

/**
 * Convert chat videos from html (HTML produced by draftjs) into hyperlinks or text.
 * `<figure><div class="gorgias-video-container" data-video-src="https://www.youtube.com/watch?v=4sLFpe-xbhk"></figure>` will be replaced by
 * `<div><a href="https://www.youtube.com/watch?v=4sLFpe-xbhk">https://www.youtube.com/watch?v=4sLFpe-xbhk</a></div>
 * or `<div>https://www.youtube.com/watch?v=4sLFpe-xbhk</div>`
 */
export function castGorgiasVideosForUnsupportedSources({
    html,
    hyperlinksSupported: supportHyperLinks,
}: {
    html: string
    hyperlinksSupported: boolean
}) {
    // Captures data-video-src attributes from `<figure><div style=...... class="gorgias-video-container" data-video-src="https://www.youtube.com/watch?v=4sLFpe-xbhk"></figure>`
    const regexVideoDraftJsFigure =
        /<figure[^/]+?div class="gorgias-video-container" data-video-src="(.+?)".+?<\/figure>/g

    // NOTE. <figure> tag must be replaced by a <div> tag because all 'contents' are either in a <figure> or <div> tag in draft.js.
    // NOTE. `class="linkified" target="_blank"` is not necessary here for hyperlinks, draftjs take cares of this.
    return supportHyperLinks
        ? html.replace(
              regexVideoDraftJsFigure,
              '<div><a href="$1">$1</a></div>',
          )
        : html.replace(regexVideoDraftJsFigure, '<div>$1</div>')
}

/**
 * Extract `<div class="gorgias-video-container" data-video-src="https://www.youtube.com/watch?v=4sLFpe-xbhk" width="600"></div>` elements from html, and return `data-video-src` urls separately.
 */
export function extractGorgiasVideoDivFromHtmlContent(html: string): {
    htmlCleaned: string
    videoUrls: string[]
} {
    const regex = new RegExp(
        '<div class="gorgias-video-container" data-video-src="(.+?)".+?></div>',
        'g',
    )

    const urls = []
    let result: RegExpExecArray | null
    while ((result = regex.exec(html)) !== null) {
        urls.push(result[1])
    }

    let htmlCleaned = html.replace(regex, '')

    // Remove the ending `<div><br /></div>` if any when ending with a video content.
    // This is an unwanted extra space produced by draftjs editor because there will be an empty line below the video when content ends by a video.
    if (
        html.match(
            /<div class="gorgias-video-container" data-video-src=".+?".+?>(<\/div><div><br.{0,2}><\/div>)$/,
        )
    ) {
        htmlCleaned = htmlCleaned.replace(/<div><br.{0,2}><\/div>$/, '')
    }

    return {
        htmlCleaned: htmlCleaned,
        videoUrls: urls,
    }
}

export function extractUrlsFromString(string: string) {
    const urlPattern = new RegExp('https?://[^\\s/$.?#].[^\\s]*', 'ig')
    return string.match(urlPattern)
}

/**
 * Adapt video URL to fix some issues found with the lib ReactPlayer.
 *
 * Trim the `playlist` variable from `https://www.dailymotion.com/video/x2m3vyr?playlist=x7juya` for instance so ReactPlayer can play it.
 */
export function fixVideoUrlForReactPlayer(url: string) {
    // Match `https://www.dailymotion.com/video/x2m3vyr?playlist=x7juyaf` to capture leading `?playlist=x7juyaf`.
    if (url.includes('dailymotion.com')) {
        return url.replace(/(\?playlist=\w+$)/, '')
    }
    return url
}

/**
 * Better typed version of the default `Array.includes` function which allows the value
 * to be of a different type than the array and to return a type guard instead of a simple boolean.
 *
 * It's still type-safe.
 */
export function includes<TPossibilities extends TValue, TValue>(
    possibilities: readonly TPossibilities[],
    value: TValue,
): value is TPossibilities {
    // @ts-expect-error - The default `includes` method wants the value to be the exact type as the array
    return possibilities.includes(value)
}

export function isTouchEvent(
    event: MouseEvent | TouchEvent | MouseEventReact | TouchEventReact,
): event is TouchEvent | TouchEventReact {
    return 'touches' in event
}

export function validateJSON(json: string) {
    try {
        JSON.parse(json)
        return true
    } catch {
        return false
    }
}

// c.f. https://github.com/nodejs/node/blob/1b60054fffc0c67a711cdf3efbcc8f44afab0ce2/lib/_http_common.js#L206
const httpHeaderNameCharRegex = /^[\^_`a-zA-Z\-0-9!#$%&'*+.|~]+$/

/**
 * Verifies that the given val is a valid HTTP header name
 */
export function validateHttpHeaderName(header: string) {
    return httpHeaderNameCharRegex.test(header)
}

/**
 * Assert unreachable path a compiler time
 *
 * Example:
 * ```
 * type MessageType = 'text' | 'image' | 'video'
 * // or enum
 * enum MessageType {TEXT = 'text', IMAGE = 'image', VIDEO = 'video'}
 *
 * const messageType: MessageType = 'text' // dynamic type
 *
 * switch (messageType) {
 *    case 'text':
 *     return 'text'
 *    case 'image':
 *     return 'image'
 *    default:
 *      assertUnreachable(messageType) // TS will throw an error here because not all types covered
 * }
 * ```
 * */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function assertUnreachable(_: never): never {
    throw new Error("Didn't expect to get here")
}
