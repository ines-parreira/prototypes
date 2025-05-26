import { ReactNode, useCallback, useMemo } from 'react'

import { toPlainObject } from 'lodash'

import {
    ExponentialRetryPolicy,
    RealtimeProvider,
    RealtimeStatus,
} from '@gorgias/realtime'

import { FeatureFlagKey } from 'config/featureFlags'
import { useFlag } from 'core/flags'
import { reportError } from 'utils/errors'

const pubNubWorkerUrl = window.PUBNUB_WORKER_URL

const PNLogVerbosityWhitelistedAccounts = [
    'acme',
    'artemisathletix',
    'yakovishen',
    'walter-test',
]

const realtimeRetryPolicy = ExponentialRetryPolicy({
    minimumDelay: 2,
    maximumDelay: 10,
    maximumRetry: 3,
    excluded: [],
})

type RealtimeAppProviderProps = {
    children: ReactNode
}

const RealtimeAppProvider = ({ children }: RealtimeAppProviderProps) => {
    const isCatchPNErrorsEnabled = useFlag(FeatureFlagKey.CatchPNErrors)

    const pubNubWorkerLogVerbosity = useMemo(
        () =>
            PNLogVerbosityWhitelistedAccounts.includes(
                window.GORGIAS_STATE.currentAccount.domain,
            ),
        [],
    )

    const handleErrorStatus = useCallback(
        (status: RealtimeStatus) => {
            isCatchPNErrorsEnabled &&
                reportError(new Error(`PubNub Status error`), {
                    tags: {
                        operation: status.operation ?? 'unknown',
                        statusCode: status.statusCode ?? 'unknown',
                        category: status.category ?? 'unknown',
                    },
                    extra: { status: toPlainObject(status) },
                })
        },
        [isCatchPNErrorsEnabled],
    )

    return (
        <RealtimeProvider
            publishKey={window.PUBNUB_PUBLISH_KEY}
            subscribeKey={window.PUBNUB_SUBSCRIBE_KEY}
            presenceTimeout={5}
            heartbeatInterval={2}
            subscriptionWorkerUrl={pubNubWorkerUrl}
            subscriptionWorkerUnsubscribeOfflineClients={true}
            subscriptionWorkerOfflineClientsCheckInterval={5}
            subscriptionWorkerLogVerbosity={pubNubWorkerLogVerbosity}
            retryConfiguration={realtimeRetryPolicy}
            onErrorStatus={handleErrorStatus}
        >
            {children}
        </RealtimeProvider>
    )
}

export default RealtimeAppProvider
