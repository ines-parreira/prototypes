import { useCallback, useEffect, useRef } from 'react'
import type { ReactNode } from 'react'

import { FeatureFlagKey, useFlag } from '@repo/feature-flags'

import {
    AgentActivityProvider,
    AgentOnlineStatusProvider,
    RealtimeProvider,
} from '@gorgias/realtime-ably'

import { reportError } from 'utils/errors'

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

    return (
        <RealtimeProvider
            enableLogging={isAblyRealtimeLoggingEnabled}
            logHandler={logHandler}
        >
            <AgentOnlineStatusProvider>
                <AgentActivityProvider>{children}</AgentActivityProvider>
            </AgentOnlineStatusProvider>
        </RealtimeProvider>
    )
}

export default AblyRealtimeProviders
