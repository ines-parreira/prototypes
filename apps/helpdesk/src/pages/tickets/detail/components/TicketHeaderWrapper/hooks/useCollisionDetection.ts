import { useMemo } from 'react'

import type { User } from '@gorgias/helpdesk-queries'
import { useAgentActivity } from '@gorgias/realtime'

import useAppSelector from 'hooks/useAppSelector'
import { getCurrentUser } from 'state/currentUser/selectors'

export type TicketPresenceState = {
    agentsViewing: User[]
    agentsViewingNotTyping: User[]
    agentsTyping: User[]
    hasBoth: boolean
}

export default function useCollisionDetection(
    ticketId: number,
): TicketPresenceState {
    const currentUser = useAppSelector(getCurrentUser)
    const { getTicketActivity } = useAgentActivity()
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
