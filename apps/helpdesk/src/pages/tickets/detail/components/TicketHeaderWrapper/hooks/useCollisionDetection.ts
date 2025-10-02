import { FeatureFlagKey } from '@repo/feature-flags'

import { User } from '@gorgias/helpdesk-queries'

import { useFlag } from 'core/flags'

import useAblyRealtimePresence from './useAblyRealtimePresence'
import useSocketIOPresence from './useSocketIOPresence'

export type TicketPresenceState = {
    agentsViewing: User[]
    agentsViewingNotTyping: User[]
    agentsTyping: User[]
    hasBoth: boolean
}
export default function useCollisionDetection(
    ticketId: number,
): TicketPresenceState {
    const isAblyRealtimeEnabled = useFlag(FeatureFlagKey.AblyRealtime)

    const { agentsViewing, agentsViewingNotTyping, agentsTyping, hasBoth } =
        useSocketIOPresence()
    const {
        agentsViewing: realtime_agentsViewing,
        agentsViewingNotTyping: realtime_agentsViewingNotTyping,
        agentsTyping: realtime_agentsTyping,
        hasBoth: realtime_hasBoth,
    } = useAblyRealtimePresence(ticketId)

    return isAblyRealtimeEnabled
        ? {
              agentsViewing: realtime_agentsViewing,
              agentsViewingNotTyping: realtime_agentsViewingNotTyping,
              agentsTyping: realtime_agentsTyping,
              hasBoth: realtime_hasBoth,
          }
        : {
              agentsViewing,
              agentsViewingNotTyping,
              agentsTyping,
              hasBoth,
          }
}
