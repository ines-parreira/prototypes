import { useEffect, useRef } from 'react'

import { logEventWithSampling, SegmentEvent } from '@repo/logging'
import type { TicketThreadAiAgentTrialMessageParams } from '@repo/ticket-thread/legacy-bridge'

import useAppSelector from 'hooks/useAppSelector'
import type { TicketMessage } from 'models/ticket/types'
import { BANNER_TYPE } from 'pages/tickets/detail/components/AIAgentFeedbackBar/constants'
import { AiAgentTrialMessageHelpdeskV2 } from 'pages/tickets/detail/components/TicketMessages/AIAgentTrialMessageHelpdeskV2/AiAgentTrialMessageHelpdeskV2'
import { getCurrentAccountState } from 'state/currentAccount/selectors'
import { getActiveView } from 'state/views/selectors'

export function TicketThreadAiAgentTrialMessage({
    message,
}: TicketThreadAiAgentTrialMessageParams) {
    const trackedImpression = useRef(false)
    const currentAccount = useAppSelector(getCurrentAccountState)
    const currentUser = useAppSelector((state) => state.currentUser)
    const activeView = useAppSelector(getActiveView)

    const accountId: number = currentAccount.get('id')
    const userType: string = currentUser.get('role').get('name')
    const viewType: string = activeView.get('slug')
    const ticketId = message.ticket_id
    const legacyMessage = message as unknown as TicketMessage

    useEffect(() => {
        if (trackedImpression.current || !ticketId) {
            return
        }

        trackedImpression.current = true

        logEventWithSampling(
            SegmentEvent.AiAgentTicketViewed,
            {
                accountId,
                banner: BANNER_TYPE.TRIAL,
                viewedFrom: viewType,
                userType,
            },
            1,
        )
    }, [accountId, ticketId, userType, viewType])

    if (!ticketId) {
        return null
    }

    return (
        <AiAgentTrialMessageHelpdeskV2
            ticketId={ticketId}
            message={legacyMessage}
        />
    )
}
