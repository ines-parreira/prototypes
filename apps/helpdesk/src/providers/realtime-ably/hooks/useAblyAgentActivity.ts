import noop from 'lodash/noop'

import { useAgentActivity } from '@gorgias/realtime-ably'

import { isRealtimeEnabledOnCluster } from '../utils/isRealtimeEnabledOnCluster'

const noopAgentActivity = () => ({
    joinTicket: noop,
    leaveTicket: noop,
    startTyping: async () => Promise.resolve(),
    stopTyping: async () => Promise.resolve(),
    viewTickets: noop,
    getTicketActivity: () => ({
        viewing: [],
        typing: [],
    }),
})

export const useAblyAgentActivity: typeof useAgentActivity =
    isRealtimeEnabledOnCluster ? useAgentActivity : noopAgentActivity
