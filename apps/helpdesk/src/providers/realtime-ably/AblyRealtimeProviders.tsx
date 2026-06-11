import { useCallback, useEffect, useRef } from 'react'
import type { ReactNode } from 'react'

import { FeatureFlagKey, useFlag } from '@repo/feature-flags'
import { reportError } from '@repo/logging'

import { AgentActivityProvider, RealtimeProvider } from '@gorgias/realtime'
import type { RealtimeConnectionStateChange } from '@gorgias/realtime'

import { EmailIntegrationMigrationRealtimeHandler } from './EmailIntegrationMigrationRealtimeHandler'
import { useRealtimeAccountPresenceSubscription } from './hooks/useRealtimeAccountPresenceSubscription'
import { useRealtimeConnectionStateChanges } from './hooks/useRealtimeConnectionStateChanges'
import { UserChannelRealtimeHandler } from './UserChannelRealtimeHandler'

type Props = {
    children: ReactNode
}

// this subscription hook depends on Ably client context, so it must be
// rendered from within `RealtimeProvider`.
const RealtimeSubscriptionsInitializer = () => {
    useRealtimeAccountPresenceSubscription()

    return null
}

const AblyRealtimeProviders = ({ children }: Props) => {
    const isAblyRealtimeLoggingEnabled = useFlag(
        FeatureFlagKey.AblyRealtimeLogging,
    )
    const isAblyRealtimeErrorReportingEnabled = useFlag(
        FeatureFlagKey.AblyErrorReporting,
    )
    const isAblyFailedStateReportingEnabled = useFlag(
        FeatureFlagKey.AblyFailedStateReporting,
    )
    const isEmailIntegrationMigrationToAblyEnabled = useFlag(
        FeatureFlagKey.EmailIntegrationMigrationToAbly,
    )
    const isErrorReportingEnabled = useRef(isAblyRealtimeErrorReportingEnabled)
    const isFailedStateReportingEnabled = useRef(
        isAblyFailedStateReportingEnabled,
    )

    useEffect(() => {
        isErrorReportingEnabled.current = isAblyRealtimeErrorReportingEnabled
    }, [isAblyRealtimeErrorReportingEnabled])

    useEffect(() => {
        isFailedStateReportingEnabled.current =
            isAblyFailedStateReportingEnabled
    }, [isAblyFailedStateReportingEnabled])

    const logHandler = useCallback((message: string) => {
        if (isErrorReportingEnabled.current) {
            reportError(new Error('AblySDKError'), {
                tags: {
                    message,
                },
            })
        }
    }, [])

    const { onRealtimeConnectionStateChange } =
        useRealtimeConnectionStateChanges()

    const onConnectionStateChange = useCallback(
        (stateChange: RealtimeConnectionStateChange) => {
            onRealtimeConnectionStateChange(stateChange)

            if (
                isFailedStateReportingEnabled.current &&
                stateChange.current === 'failed'
            ) {
                reportError(new Error('RealtimeFailedConnectionState'), {
                    tags: {
                        current: stateChange.current,
                        previous: stateChange.previous,
                        message: stateChange.reason?.message,
                        code: stateChange.reason?.code,
                        statusCode: stateChange.reason?.statusCode,
                    },
                })
            }
        },
        [onRealtimeConnectionStateChange],
    )

    return (
        <RealtimeProvider
            enableLogging={isAblyRealtimeLoggingEnabled}
            logHandler={logHandler}
            onConnectionStateChange={onConnectionStateChange}
        >
            <RealtimeSubscriptionsInitializer />
            <AgentActivityProvider>
                {isEmailIntegrationMigrationToAblyEnabled && (
                    <EmailIntegrationMigrationRealtimeHandler />
                )}
                <UserChannelRealtimeHandler />
                {children}
            </AgentActivityProvider>
        </RealtimeProvider>
    )
}

export { AblyRealtimeProviders }
