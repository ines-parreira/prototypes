import { useMemo } from 'react'

import { useAgentActivity } from '@gorgias/realtime-ably'

import useAppSelector from 'hooks/useAppSelector'
import { getCurrentUser } from 'state/currentUser/selectors'

export default function useAgentsViewing(ticketId: number) {
    const currentUser = useAppSelector(getCurrentUser)

    const { getTicketActivity } = useAgentActivity()
    const ticketViewingActivity = useMemo(
        () =>
            getTicketActivity(ticketId).viewing.filter(
                (user) => user.id !== currentUser.get('id'),
            ),
        [currentUser, getTicketActivity, ticketId],
    )

    return {
        agentsViewing: ticketViewingActivity,
    }
}
