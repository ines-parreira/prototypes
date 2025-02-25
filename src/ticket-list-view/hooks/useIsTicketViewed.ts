import { useMemo } from 'react'

import useAgentsViewing from 'hooks/realtime/useAgentsViewing'
import { agentsViewingMessage } from 'state/views/utils'

export default function useIsTicketViewed(ticketId: number) {
    const { agentsViewing } = useAgentsViewing(ticketId)

    const agentViewingMessage = useMemo(
        () => agentsViewingMessage(agentsViewing),
        [agentsViewing],
    )

    return useMemo(
        () => ({
            isTicketViewed: agentsViewing.length > 0,
            agentViewingMessage,
        }),
        [agentsViewing, agentViewingMessage],
    )
}
