import { User } from '@gorgias/helpdesk-queries'

import { FeatureFlagKey } from 'config/featureFlags'
import { useFlag } from 'core/flags'

import useRealtimePresence from './useRealtimePresence'
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
    const isRealtimeEnabled = useFlag(FeatureFlagKey.PubNubRealtime)

    const { agentsViewing, agentsViewingNotTyping, agentsTyping, hasBoth } =
        useSocketIOPresence()
    const {
        agentsViewing: realtime_agentsViewing,
        agentsViewingNotTyping: realtime_agentsViewingNotTyping,
        agentsTyping: realtime_agentsTyping,
        hasBoth: realtime_hasBoth,
    } = useRealtimePresence(ticketId)

    return isRealtimeEnabled
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
