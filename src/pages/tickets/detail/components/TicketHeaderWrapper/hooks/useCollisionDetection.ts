import {User} from '@gorgias/api-queries'

import {useFlag} from 'common/flags'
import {FeatureFlagKey} from 'config/featureFlags'

import useRealtimePresence from './useRealtimePresence'
import useSocketIOPresence from './useSocketIOPresence'

export type TicketPresenceState = {
    agentsViewing: User[]
    agentsViewingNotTyping: User[]
    agentsTyping: User[]
    hasBoth: boolean
}
export default function useCollisionDetection(
    ticketId: number
): TicketPresenceState {
    const isRealtimeEnabled = useFlag(FeatureFlagKey.PubNubRealtime, false)

    const {agentsViewing, agentsViewingNotTyping, agentsTyping, hasBoth} =
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
