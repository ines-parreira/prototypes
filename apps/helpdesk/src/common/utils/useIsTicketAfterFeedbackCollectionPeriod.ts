import { useMemo } from 'react'

import { FeatureFlagKey } from '@repo/feature-flags'

import { useFlag } from 'core/flags'
import useAppSelector from 'hooks/useAppSelector'
import { useGetAiAgentFeedback } from 'models/aiAgentFeedback/queries'
import { useGetEarliestExecution } from 'models/knowledgeService/queries'
import { getTicketState } from 'state/ticket/selectors'

// we want to show feedback only after a given date when we started consuming orchestration events
// reason is that prior to that date we don't have the data we need to gather feedback for resources based on the new design
// so we fallback to the old feedback collection mechanism
export const FIRST_CONSUMED_ORCH_EVENT_DATETIME = new Date(
    '2025-05-23T10:00:00Z',
)

export const NUMBER_OF_MONTHS_TO_SKIP_NEW_FEEDBACK_COLLECTION = 3
const CACHE_TIME = 1000 * 60 * 60 * 1 // 1 hour
const STALE_TIME = 1000 * 60 * 60 * 1 // 1 hour

export const useTicketIsAfterFeedbackCollectionPeriod = () => {
    const ticket = useAppSelector(getTicketState)
    const createdDatetime = ticket.get('created_datetime')
    const isNewAgenticArchitectureEnabled = useFlag(
        FeatureFlagKey.AiAgentUseNewAgenticArchitecture,
    )

    const { data: aiAgentFeedback } = useGetAiAgentFeedback({
        refetchOnWindowFocus: false,
        cacheTime: CACHE_TIME,
        staleTime: STALE_TIME,
        enabled: isNewAgenticArchitectureEnabled,
    })

    const { data: earliestExecution } = useGetEarliestExecution({
        refetchOnWindowFocus: false,
        cacheTime: CACHE_TIME,
        staleTime: Infinity, // The earliest execution is not updated so getting it once is enough.
        enabled:
            isNewAgenticArchitectureEnabled &&
            createdDatetime &&
            new Date(createdDatetime).getTime() >
                FIRST_CONSUMED_ORCH_EVENT_DATETIME.getTime(),
    })

    return useMemo(() => {
        if (!isNewAgenticArchitectureEnabled || !earliestExecution) return false

        const ticketDate = createdDatetime ? new Date(createdDatetime) : null
        if (!ticketDate) return true

        const hasOldFeedback =
            (aiAgentFeedback?.data?.messages?.reduce(
                (acc, message) =>
                    acc +
                    message.feedbackOnMessage.length +
                    message.feedbackOnResource.length,
                0,
            ) ?? 0) > 0

        const targetDate = new Date(earliestExecution.timestamp)
        // if a ticket already received feedback prior to the new feedback collection we should show the old feedback
        // for a given period of time to not upset customers
        if (hasOldFeedback) {
            targetDate.setMonth(
                targetDate.getMonth() +
                    NUMBER_OF_MONTHS_TO_SKIP_NEW_FEEDBACK_COLLECTION,
            )
        }

        return ticketDate > targetDate
    }, [
        createdDatetime,
        aiAgentFeedback?.data?.messages,
        isNewAgenticArchitectureEnabled,
        earliestExecution,
    ])
}
