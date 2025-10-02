import { useAgentsOnlineStatus } from '@gorgias/realtime-ably'

import { isRealtimeEnabledOnCluster } from '../utils/isRealtimeEnabledOnCluster'

const noopAgentOnlineStatus = () => ({
    onlineAgents: {},
})

export const useAblyAgentsOnlineStatus: typeof useAgentsOnlineStatus =
    isRealtimeEnabledOnCluster ? useAgentsOnlineStatus : noopAgentOnlineStatus
