import {useMemo} from 'react'

import {getOtherAgentsOnTicket} from 'state/agents/selectors'
import {agentsViewingMessage} from 'state/views/utils'
import useAppSelector from 'hooks/useAppSelector'

export default function useIsTicketViewed(ticketId: number) {
    const agentsViewing = useAppSelector(
        getOtherAgentsOnTicket(String(ticketId))
    )

    const agentViewingMessage = useMemo(
        () => agentsViewingMessage(agentsViewing),
        [agentsViewing]
    )

    return useMemo(
        () => ({
            isTicketViewed: agentsViewing.size > 0,
            agentViewingMessage,
        }),
        [agentsViewing, agentViewingMessage]
    )
}
