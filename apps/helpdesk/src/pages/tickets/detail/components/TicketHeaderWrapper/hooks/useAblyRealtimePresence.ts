import { useMemo } from 'react'

import { useAgentActivity as useAblyAgentActivity } from '@gorgias/realtime-ably'

import useAppSelector from 'hooks/useAppSelector'
import { getCurrentUser } from 'state/currentUser/selectors'

import type { TicketPresenceState } from './useCollisionDetection'

export default function useAblyRealtimePresence(
    ticketId: number,
): TicketPresenceState {
    const currentUser = useAppSelector(getCurrentUser)
    const { getTicketActivity } = useAblyAgentActivity()
    const ticketActivity = getTicketActivity(ticketId)

    const agentsViewing = useMemo(
        () =>
            ticketActivity.viewing.filter(
                (user) => user.id !== currentUser.get('id'),
            ),
        [currentUser, ticketActivity.viewing],
    )
    const agentsTyping = useMemo(
        () =>
            ticketActivity.typing.filter(
                (user) => user.id !== currentUser.get('id'),
            ),
        [currentUser, ticketActivity.typing],
    )
    const agentsViewingNotTyping = useMemo(
        () =>
            agentsViewing.filter(
                (viewingUser) =>
                    !agentsTyping.some(
                        (typingUser) => typingUser.id === viewingUser.id,
                    ),
            ),
        [agentsViewing, agentsTyping],
    )
    const hasBoth = useMemo(
        () => agentsTyping.length > 0 && agentsViewingNotTyping.length > 0,
        [agentsTyping, agentsViewingNotTyping],
    )

    return useMemo(
        () => ({
            agentsViewing,
            agentsViewingNotTyping,
            agentsTyping,
            hasBoth,
        }),
        [agentsViewing, agentsViewingNotTyping, agentsTyping, hasBoth],
    )
}
