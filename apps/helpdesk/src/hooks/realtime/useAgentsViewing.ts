import { useMemo } from 'react'

import { FeatureFlagKey, useFlag } from '@repo/feature-flags'

import type { User } from '@gorgias/helpdesk-queries'

import useAppSelector from 'hooks/useAppSelector'
import { useAblyAgentActivity } from 'providers/realtime-ably/hooks/useAblyAgentActivity'
import { getOtherAgentsOnTicket } from 'state/agents/selectors'
import { getCurrentUser } from 'state/currentUser/selectors'

export default function useAgentsViewing(ticketId: number) {
    const isAblyRealtimeEnabled = useFlag(FeatureFlagKey.AblyRealtime)

    const currentUser = useAppSelector(getCurrentUser)
    const agentsOnTicket = useAppSelector(
        getOtherAgentsOnTicket(String(ticketId)),
    )

    const { getTicketActivity } = useAblyAgentActivity()
    const ticketViewingActivity = useMemo(
        () =>
            getTicketActivity(ticketId).viewing.filter(
                (user) => user.id !== currentUser.get('id'),
            ),
        [currentUser, getTicketActivity, ticketId],
    )

    return {
        agentsViewing: isAblyRealtimeEnabled
            ? ticketViewingActivity
            : ((agentsOnTicket.toJS() ?? []) as User[]),
    }
}
