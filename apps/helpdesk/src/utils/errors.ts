import type { GorgiasUIEnv } from '@repo/utils'
import { isDevelopment, isProduction, isStaging } from '@repo/utils'
import * as Sentry from '@sentry/react'
import { BrowserTracing } from '@sentry/tracing'
import type { ScopeContext } from '@sentry/types'

import type { User } from 'config/types/user'
import type { Account } from 'state/currentAccount/types'

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

export type InitErrorReporterParams = {
    dsn: string
    clientVersion: string
    serverVersion: string
    environment: GorgiasUIEnv
    currentUser: User
    currentAccount: Account
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

export function reportError(error: unknown, options?: Partial<ScopeContext>) {
    if (isDevelopment() || isStaging()) {
        console.error(error)
        if (options?.extra) {
            console.error(ERROR_EXTRA_CONSOLE_LOG_MESSAGE, options.extra)
        }
    }
    if (isStaging() || isProduction()) {
        Sentry.captureException(error, options)
    }
}
