import type { GorgiasUIEnv } from '@repo/utils'
import {
    getEnvironment,
    isDevelopment,
    isProduction,
    isStaging,
} from '@repo/utils'
import * as Sentry from '@sentry/react'
import { BrowserTracing } from '@sentry/tracing'
import type { ScopeContext } from '@sentry/types'

import type {
    Account as HelpdeskAccount,
    User as HelpdeskUser,
} from '@gorgias/helpdesk-types'

export const TRACE_SAMPLE_RATE = 0
export const IGNORED_ERRORS = [
    'fb_xd_fragment', // Facebook borked
    'ResizeObserver loop completed with undelivered notifications',
    'TypeError: Failed to fetch', // https://linear.app/gorgias/issue/COR-1014/typeerror-failed-to-fetch
    'TypeError: NetworkError when attempting to fetch resource.', // https://linear.app/gorgias/issue/COR-1014/typeerror-failed-to-fetch
    'Error: Network Error', // https://linear.app/gorgias/issue/COR-1223/ignore-all-axios-network-errors
    /^AxiosError: Request failed with status code (400|401|403|404|419|429)/, // https://linear.app/gorgias/issue/SUPXP-2517/axioserror-request-failed-with-status-code-4xx
    /^Error: timeout of \d+ms exceeded$/, // https://linear.app/gorgias/issue/COR-1223/ignore-all-axios-network-errors
    'ResizeObserver loop limit exceeded', // https://linear.app/gorgias/issue/PLTCO-2300/mute-or-ignore-resizeobserver-warning
    'UnknownError (31000): An unknown error has occurred. See error details for more information.', // https://linear.app/gorgias/issue/PHO-546/unknownerror-unknownerror-31000-an-unknown-error-has-occurred-see
    'TransportError (31009): No transport available to send or receive messages', // https://linear.app/gorgias/issue/PHO-405/transporterror-transporterror-31009-no-transport-available-to-send-or
    'ConnectionError (31005): A connection error occurred during the call', // https://linear.app/gorgias/issue/PHO-404/connectionerror-connectionerror-31005-a-connection-error-occurred
    /AccessTokenExpired.*20104/, // https://linear.app/gorgias/issue/SUPPHO-2117/accesstokenexpired-accesstokenexpired-20104-the-access-token-provided
    /Failed to execute 'removeChild' on 'Node'/, // https://gorgias.sentry.io/issues/6702468115 - Sentry error related to react 18 migration - noop
]
export const DENY_URLS = [
    // Chrome extensions
    /extensions\//i,
    /^chrome:\/\//i,
    /draft-js\/lib/i, // Draft JS errors
    /analytics\.min\.js/i, // https://linear.app/gorgias/issue/PLTCO-1017/typeerror-cannot-read-property-page-of-undefined
]
export const ERROR_EXTRA_CONSOLE_LOG_MESSAGE = 'Error extra:'
export const LANGUAGE_TAG = 'language'
export const LANGUAGE_TAG_VALUE = 'javascript'
export const ACCOUNT_DOMAIN_TAG = 'account.domain'
export const SERVER_VERSION_TAG = 'server.version'

export type ErrorReporterUser = Pick<HelpdeskUser, 'email' | 'id' | 'name'> & {
    email: string
    id: number
    name: string
}

export type ErrorReporterAccount = Pick<HelpdeskAccount, 'domain'> & {
    domain: string
}

export type InitErrorReporterParams = {
    dsn: string
    clientVersion: string
    serverVersion: string
    environment: GorgiasUIEnv
    currentUser: ErrorReporterUser
    currentAccount: ErrorReporterAccount
}

export function initErrorReporter({
    dsn,
    clientVersion,
    serverVersion,
    environment,
    currentUser,
    currentAccount,
}: InitErrorReporterParams) {
    Sentry.init({
        dsn,
        release: clientVersion,
        environment,
        // ignore old browsers and mobile safari
        enabled: !/^(.+Mobile.+Safari.+|.+MSIE 8\.0;.+)$/.test(
            window.navigator.userAgent,
        ),
        integrations: [new BrowserTracing()],
        tracesSampleRate: TRACE_SAMPLE_RATE,
        ignoreErrors: IGNORED_ERRORS,
        denyUrls: DENY_URLS,
    })
    Sentry.setTag(LANGUAGE_TAG, LANGUAGE_TAG_VALUE)
    Sentry.setTag(SERVER_VERSION_TAG, serverVersion)
    Sentry.setTag(ACCOUNT_DOMAIN_TAG, currentAccount.domain)
    Sentry.setUser({
        id: currentUser.id.toString(),
        name: currentUser.name,
        email: currentUser.email,
    })
}

export function reportError(
    error: Error | unknown,
    options?: Partial<ScopeContext>,
    fingerprints?: string[],
) {
    const errorObj = error instanceof Error ? error : new Error(String(error))

    if (isDevelopment() || isStaging()) {
        console.error(errorObj)
        if (options?.extra) {
            console.error(ERROR_EXTRA_CONSOLE_LOG_MESSAGE, options.extra)
        }
    }
    if (isStaging() || isProduction()) {
        Sentry.withScope((scope) => {
            if (fingerprints) scope.setFingerprint(fingerprints)
            Sentry.captureException(
                errorObj,
                getAdditionalErrorInfo(errorObj, options),
            )
        })
    }
}

export function getAdditionalErrorInfo(
    errorObj: Error = new Error(),
    options?: Partial<ScopeContext>,
) {
    try {
        const callerInfo = getCallerInfo(errorObj)
        return {
            ...options,
            extra: {
                ...options?.extra,
                // Collected info below takes precedence over options.extra
                environment: getEnvironment(),
                // Caller information
                caller_function: callerInfo.functionName,
                caller_file: callerInfo.fileName,
                caller_line: callerInfo.lineNumber,
                caller_column: callerInfo.columnNumber,
                // DOM state
                document_ready_state: document.readyState,
                page_visible: document.visibilityState === 'visible',
                page_hidden: document.hidden,
                focused_element: document.activeElement?.tagName,
                focused_element_id: document.activeElement?.id,
                // Browser capabilities
                cookies_enabled: navigator.cookieEnabled,
                // Page info
                url: window.location.href,
                pathname: window.location.pathname,
                search: Object.fromEntries(
                    new URLSearchParams(window.location.search),
                ),
                title: document.title,
                referrer: document.referrer,
            },
        }
    } catch {
        return {
            ...options,
            extra: {
                ...options?.extra,
                info_error: 'Failed to get additional error info',
            },
        }
    }
}

export function getCallerInfo(error: Error = new Error()) {
    const stack = error.stack || ''
    const stackLines = stack.split('\n')

    // Skip first 3 lines (Error, getCallerInfo, reportError)
    const callerLine = stackLines[3]
    // Parse stack trace
    // Chrome: "at functionName (file.js:line:col)"
    // Firefox: "functionName@file.js:line:col"
    const chromeMatch = callerLine.match(/at\s+(.+?)\s+\((.+?):(\d+):(\d+)\)/)
    const firefoxMatch = callerLine.match(/(.+?)@(.+?):(\d+):(\d+)/)

    if (chromeMatch) {
        return {
            functionName: chromeMatch[1].trim(),
            fileName: chromeMatch[2],
            lineNumber: parseInt(chromeMatch[3]),
            columnNumber: parseInt(chromeMatch[4]),
        }
    } else if (firefoxMatch) {
        return {
            functionName: firefoxMatch[1].trim(),
            fileName: firefoxMatch[2],
            lineNumber: parseInt(firefoxMatch[3]),
            columnNumber: parseInt(firefoxMatch[4]),
        }
    }
    return {
        functionName: 'unknown',
        fileName: 'unknown',
        lineNumber: 0,
        columnNumber: 0,
    }
}
