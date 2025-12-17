import { FeatureFlagKey, useFlag } from '@repo/feature-flags'

import {
    AgentActivityProvider,
    AgentOnlineStatusProvider,
    RealtimeProvider,
} from '@gorgias/realtime-ably'

import { isRealtimeEnabledOnCluster } from './utils/isRealtimeEnabledOnCluster'

type Props = {
    children: React.ReactNode
}

const AblyRealtimeProviders = ({ children }: Props) => {
    const isAblyRealtimeLoggingEnabled = useFlag(
        FeatureFlagKey.AblyRealtimeLogging,
    )
    if (isRealtimeEnabledOnCluster) {
        return (
            <RealtimeProvider enableLogging={isAblyRealtimeLoggingEnabled}>
                <AgentOnlineStatusProvider>
                    <AgentActivityProvider>{children}</AgentActivityProvider>
                </AgentOnlineStatusProvider>
            </RealtimeProvider>
        )
    }

    return <>{children}</>
}

export default AblyRealtimeProviders
