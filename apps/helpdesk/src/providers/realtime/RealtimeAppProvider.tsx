import type { ReactNode } from 'react'
import { useCallback, useMemo, useState } from 'react'

import { FeatureFlagKey } from '@repo/feature-flags'
import { useUpdateEffect } from '@repo/hooks'
import { logEvent, SegmentEvent } from '@repo/logging'
import { isObject, isString, toPlainObject } from 'lodash'

import type { RealtimeStatus } from '@gorgias/realtime'
import {
    ExponentialRetryPolicy,
    RealtimeLogLevel,
    RealtimeProvider,
} from '@gorgias/realtime'

import { AlertBannerTypes, BannerCategories, useBanners } from 'AlertBanners'
import { useFlag } from 'core/flags'
import { reportError } from 'utils/errors'

import { useErrorThreshold } from './hooks/useErrorThreshold'

const pubNubWorkerUrl = window.PUBNUB_WORKER_URL

const LoggingEnabledAccounts = ['yakovishen']

const realtimeRetryPolicy = ExponentialRetryPolicy({
    minimumDelay: 2,
    maximumDelay: 10,
    maximumRetry: 3,
    excluded: [],
})

type RealtimeAppProviderProps = {
    children: ReactNode
}

const REALTIME_CONNECTIVITY_BANNER_INSTANCE_ID = 'realtime-connectivity-banner'

const REALTIME_ERROR_THRESHOLD = 20

const RealtimeAppProvider = ({ children }: RealtimeAppProviderProps) => {
    const isCatchPNErrorsEnabled = useFlag(FeatureFlagKey.CatchPNErrors)
    const isRealtimeEnabled = useFlag(FeatureFlagKey.PubNubRealtime)
    const [isPNNetworkUp, setIsPNNetworkUp] = useState(true)

    const { addBanner, removeBanner } = useBanners()

    const displayRealtimeConnectivityBanner = useCallback(
        (shouldLogEvent: boolean = true) => {
            shouldLogEvent &&
                logEvent(SegmentEvent.RealtimeConnectivityBannerDisplayed)
            addBanner({
                category: BannerCategories.REALTIME_CONNECTIVITY,
                type: AlertBannerTypes.Critical,
                message: `Can't connect to realtime updates. Please consult the debugging guide.`,
                instanceId: REALTIME_CONNECTIVITY_BANNER_INSTANCE_ID,
                CTA: {
                    type: 'action',
                    text: 'View debugging guide',
                    onClick: () => {
                        logEvent(
                            SegmentEvent.RealtimeConnectivityBannerDocsClicked,
                        )
                        window.open(
                            'https://docs.gorgias.com/en-US/common-account-errors-486968#cant-connect-to-real-time-updates',
                            '_blank',
                        )
                    },
                },
            })
        },
        [addBanner],
    )

    const { incrementErrorCount, resetErrorCount } = useErrorThreshold(
        REALTIME_ERROR_THRESHOLD,
        displayRealtimeConnectivityBanner,
    )

    const isLoggingEnabled = useMemo(
        () =>
            LoggingEnabledAccounts.includes(
                window.GORGIAS_STATE.currentAccount.domain,
            ),
        [],
    )

    const logLevel = useMemo(() => {
        return isLoggingEnabled ? RealtimeLogLevel.Trace : RealtimeLogLevel.None
    }, [isLoggingEnabled])

    const handleErrorStatus = useCallback(
        (status: RealtimeStatus, pnSdkVersion?: string) => {
            status.category === 'PNNetworkIssuesCategory' &&
                isRealtimeEnabled &&
                isPNNetworkUp &&
                incrementErrorCount()

            let message: undefined | string
            if (
                status.category === 'PNAccessDeniedCategory' &&
                status.errorData &&
                isObject(status.errorData) &&
                'message' in status.errorData &&
                isString(status.errorData.message)
            ) {
                message = status.errorData.message
            }

            isCatchPNErrorsEnabled &&
                reportError(new Error(`PubNub Status error`), {
                    tags: {
                        operation: status.operation ?? 'unknown',
                        statusCode: status.statusCode ?? 'unknown',
                        category: status.category ?? 'unknown',
                        ...(message && { message }),
                        ...(pnSdkVersion && { pnSdkVersion }),
                    },
                    extra: { status: toPlainObject(status) },
                })
        },
        [
            isRealtimeEnabled,
            isCatchPNErrorsEnabled,
            incrementErrorCount,
            isPNNetworkUp,
        ],
    )

    const resetErrorCountAndRemoveBanner = useCallback(() => {
        removeBanner(
            BannerCategories.REALTIME_CONNECTIVITY,
            REALTIME_CONNECTIVITY_BANNER_INSTANCE_ID,
        )
        resetErrorCount()
    }, [removeBanner, resetErrorCount])

    useUpdateEffect(() => {
        resetErrorCount()
    }, [isRealtimeEnabled, resetErrorCount])

    const handleNetworkUp = useCallback(() => {
        if (isRealtimeEnabled) {
            setIsPNNetworkUp(true)
            resetErrorCountAndRemoveBanner()
        }
    }, [isRealtimeEnabled, resetErrorCountAndRemoveBanner])

    const handleNetworkDown = useCallback(() => {
        if (isRealtimeEnabled) {
            setIsPNNetworkUp(false)
            resetErrorCount()
            displayRealtimeConnectivityBanner(false)
        }
    }, [displayRealtimeConnectivityBanner, isRealtimeEnabled, resetErrorCount])

    return (
        <RealtimeProvider
            publishKey={window.PUBNUB_PUBLISH_KEY}
            subscribeKey={window.PUBNUB_SUBSCRIBE_KEY}
            presenceTimeout={15}
            heartbeatInterval={3.5}
            subscriptionWorkerUrl={pubNubWorkerUrl}
            subscriptionWorkerUnsubscribeOfflineClients={true}
            subscriptionWorkerOfflineClientsCheckInterval={5}
            subscriptionWorkerLogVerbosity={isLoggingEnabled}
            retryConfiguration={realtimeRetryPolicy}
            onErrorStatus={handleErrorStatus}
            onReconnectStatus={resetErrorCountAndRemoveBanner}
            onNetworkUp={handleNetworkUp}
            onNetworkDown={handleNetworkDown}
            logLevel={logLevel as number}
        >
            {children}
        </RealtimeProvider>
    )
}

export default RealtimeAppProvider
