import { useEffect, useRef } from 'react'

import { logEventWithSampling, SegmentEvent } from '@repo/logging'
import type { TicketThreadAiAgentDraftMessageParams } from '@repo/ticket-thread/legacy-bridge'

import useAppSelector from 'hooks/useAppSelector'
import type { TicketMessage } from 'models/ticket/types'
import { BANNER_TYPE } from 'pages/tickets/detail/components/AIAgentFeedbackBar/constants'
import { AiAgentDraftMessageHelpdeskV2 } from 'pages/tickets/detail/components/TicketMessages/AIAgentDraftMessageHelpdeskV2/AiAgentDraftMessageHelpdeskV2'
import { getCurrentAccountState } from 'state/currentAccount/selectors'
import { getActiveView } from 'state/views/selectors'

export function TicketThreadAiAgentDraftMessage({
    message,
    isTrial,
}: TicketThreadAiAgentDraftMessageParams) {
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
                banner: isTrial ? BANNER_TYPE.TRIAL : BANNER_TYPE.QA_FAILED,
                viewedFrom: viewType,
                userType,
            },
            1,
        )
    }, [accountId, isTrial, ticketId, userType, viewType])

    if (!ticketId) {
        return null
    }

    return (
        <AiAgentDraftMessageHelpdeskV2
            ticketId={ticketId}
            message={legacyMessage}
            isTrial={isTrial}
        />
    )
}
