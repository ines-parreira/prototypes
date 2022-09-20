import * as Sentry from '@sentry/react'
import {BrowserTracing} from '@sentry/tracing'
import {ScopeContext, Transaction, TransactionContext} from '@sentry/types'
import {Metric, onINP} from 'web-vitals'

import {User} from 'config/types/user'
import {Account} from 'state/currentAccount/types'
import {
    GorgiasUIEnv,
    isDevelopment,
    isProduction,
    isStaging,
} from 'utils/environment'

const TRACE_SAMPLE_RATE = 0.003
const IGNORED_ERRORS = [
    'fb_xd_fragment', // Facebook borked
    'ResizeObserver loop completed with undelivered notifications',
    'TypeError: Failed to fetch', // https://linear.app/gorgias/issue/COR-1014/typeerror-failed-to-fetch
    'TypeError: NetworkError when attempting to fetch resource.', // https://linear.app/gorgias/issue/COR-1014/typeerror-failed-to-fetch
    'Error: Network Error', // https://linear.app/gorgias/issue/COR-1223/ignore-all-axios-network-errors
    /^Error: timeout of \d+ms exceeded$/, // https://linear.app/gorgias/issue/COR-1223/ignore-all-axios-network-errors
    'ResizeObserver loop limit exceeded', // https://linear.app/gorgias/issue/PLTCO-2300/mute-or-ignore-resizeobserver-warning
]

export type InitErrorReporterParams = {
    dsn: string
    release: string
    environment: GorgiasUIEnv
    currentUser?: User
    currentAccount?: Account
}

export function initErrorReporter({
    dsn,
    release,
    environment,
    currentUser,
    currentAccount,
}: InitErrorReporterParams) {
    Sentry.init({
        dsn,
        release,
        environment,
        // ignore old browsers and mobile safari
        enabled: !/^(.+Mobile.+Safari.+|.+MSIE 8\.0;.+)$/.test(
            window.navigator.userAgent
        ),
        integrations: [
            withInpMeasurements(
                new BrowserTracing() as unknown as PatchedBrowserTracing
            ),
        ],
        tracesSampleRate: TRACE_SAMPLE_RATE,
        ignoreErrors: IGNORED_ERRORS,
        denyUrls: [
            // Chrome extensions
            /extensions\//i,
            /^chrome:\/\//i,
            /draft-js\/lib/i, // Draft JS errors
            /analytics\.min\.js/i, // https://linear.app/gorgias/issue/PLTCO-1017/typeerror-cannot-read-property-page-of-undefined
        ],
    })
    Sentry.setTag('language', 'javascript')
    if (currentAccount) {
        Sentry.setTag('account.domain', currentAccount.domain)
    }
    if (currentUser) {
        Sentry.setUser({
            id: currentUser.id.toString(),
            name: currentUser.name,
            email: currentUser.email,
        })
    }
}

export function reportError(error: Error, options?: Partial<ScopeContext>) {
    if (isDevelopment() || isStaging()) {
        console.error(error)
        if (options?.extra) {
            console.error('Error extra:', options.extra)
        }
    }
    if (isStaging() || isProduction()) {
        Sentry.captureException(error, options)
    }
}

export interface PatchedBrowserTracing
    extends Omit<BrowserTracing, '_createRouteTransaction'> {
    _createRouteTransaction: (
        context: TransactionContext
    ) => Transaction | undefined
}

export function withInpMeasurements<T extends PatchedBrowserTracing>(
    browserTracing: T
) {
    let inpMetric: Metric | undefined

    onINP(
        (metric) => {
            inpMetric = metric
        },
        {
            reportAllChanges: true,
        }
    )

    const _originalCreateRouteTransaction =
        browserTracing._createRouteTransaction

    browserTracing._createRouteTransaction = (context) => {
        const transaction = _originalCreateRouteTransaction.call(
            browserTracing,
            context
        )

        if (transaction && inpMetric) {
            transaction.setMeasurement('inp', inpMetric.value, 'ms')
            inpMetric = undefined
        }

        return transaction
    }

    return browserTracing
}
