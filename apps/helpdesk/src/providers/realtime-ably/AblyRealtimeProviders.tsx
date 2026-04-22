import { useCallback, useEffect, useRef } from 'react'
import type { ReactNode } from 'react'

import { FeatureFlagKey, useFlag } from '@repo/feature-flags'
import { reportError } from '@repo/logging'

import {
    AgentActivityProvider,
    AgentOnlineStatusProvider,
    RealtimeProvider,
} from '@gorgias/realtime'
import type { RealtimeConnectionStateChange } from '@gorgias/realtime'

type Props = {
    children: ReactNode
}

const AblyRealtimeProviders = ({ children }: Props) => {
    const isAblyRealtimeLoggingEnabled = useFlag(
        FeatureFlagKey.AblyRealtimeLogging,
    )
    const isAblyRealtimeErrorReportingEnabled = useFlag(
        FeatureFlagKey.AblyErrorReporting,
    )

    const isErrorReportingEnabled = useRef(isAblyRealtimeErrorReportingEnabled)

    useEffect(() => {
        isErrorReportingEnabled.current = isAblyRealtimeErrorReportingEnabled
    }, [isAblyRealtimeErrorReportingEnabled])

    const logHandler = useCallback((message: string) => {
        if (isErrorReportingEnabled.current) {
            reportError(new Error('AblySDKError'), {
                tags: {
                    message,
                },
            })
        }
    }, [])

    const onConnectionStateChange = useCallback(
        (stateChange: RealtimeConnectionStateChange) => {
            if (
                isErrorReportingEnabled.current &&
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
        [],
    )

    return (
        <RealtimeProvider
            enableLogging={isAblyRealtimeLoggingEnabled}
            logHandler={logHandler}
            onConnectionStateChange={onConnectionStateChange}
        >
            <AgentOnlineStatusProvider>
                <AgentActivityProvider>{children}</AgentActivityProvider>
            </AgentOnlineStatusProvider>
        </RealtimeProvider>
    )
}

export default AblyRealtimeProviders
