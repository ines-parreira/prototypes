import { ReactNode, useCallback, useMemo } from 'react'

import { isObject, isString, toPlainObject } from 'lodash'

import {
    ExponentialRetryPolicy,
    RealtimeLogLevel,
    RealtimeProvider,
    RealtimeStatus,
} from '@gorgias/realtime'

import { AlertBannerTypes, BannerCategories, useBanners } from 'AlertBanners'
import { logEvent, SegmentEvent } from 'common/segment'
import { FeatureFlagKey } from 'config/featureFlags'
import { useFlag } from 'core/flags'
import useUpdateEffect from 'hooks/useUpdateEffect'
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

const RealtimeAppProvider = ({ children }: RealtimeAppProviderProps) => {
    const isCatchPNErrorsEnabled = useFlag(FeatureFlagKey.CatchPNErrors)
    const isRealtimeEnabled = useFlag(FeatureFlagKey.PubNubRealtime)
    const { enabled: isErrorThresholdEnabled, threshold } = useFlag(
        FeatureFlagKey.PubnNubRealtimeErrorThreshold,
        {
            enabled: false,
            threshold: 0,
        },
    )
    const { addBanner, removeBanner } = useBanners()

    const displayRealtimeConnectivityBanner = useCallback(() => {
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
                    logEvent(SegmentEvent.RealtimeConnectivityBannerDocsClicked)
                    window.open(
                        'https://docs.gorgias.com/en-US/common-account-errors-486968#cant-connect-to-real-time-updates',
                        '_blank',
                    )
                },
            },
        })
    }, [addBanner])

    const { incrementErrorCount, resetErrorCount } = useErrorThreshold(
        threshold,
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
        (status: RealtimeStatus) => {
            status.category === 'PNNetworkIssuesCategory' &&
                isRealtimeEnabled &&
                isErrorThresholdEnabled &&
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
                    },
                    extra: { status: toPlainObject(status) },
                })
        },
        [
            isRealtimeEnabled,
            isErrorThresholdEnabled,
            isCatchPNErrorsEnabled,
            incrementErrorCount,
        ],
    )

    const handleReconnectStatus = useCallback(() => {
        removeBanner(
            BannerCategories.REALTIME_CONNECTIVITY,
            REALTIME_CONNECTIVITY_BANNER_INSTANCE_ID,
        )
        resetErrorCount()
    }, [removeBanner, resetErrorCount])

    useUpdateEffect(() => {
        resetErrorCount()
    }, [isRealtimeEnabled, isErrorThresholdEnabled, threshold, resetErrorCount])

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
            onReconnectStatus={handleReconnectStatus}
            logLevel={logLevel as number}
        >
            {children}
        </RealtimeProvider>
    )
}

export default RealtimeAppProvider
