import { FeatureFlagKey } from 'config/featureFlags'
import { useFlag } from 'core/flags'
import useAppSelector from 'hooks/useAppSelector'
import { useGetAiAgentFeedback } from 'models/aiAgentFeedback/queries'
import { getTicketState } from 'state/ticket/selectors'

// we want to show feedback only after a given date when we started consuming orchestration events
// reason is that prior to that date we don't have the data we need to gather feedback for resources based on the new design
// so we fallback to the old feedback collection mechanism
export const FIRST_CONSUMED_ORCH_EVENT_DATETIME = new Date(
    '2025-05-23T10:00:00Z',
)
export const NUMBER_OF_MONTHS_TO_SKIP_NEW_FEEDBACK_COLLECTION = 3

export const useTicketIsAfterFeedbackCollectionPeriod = () => {
    const ticket = useAppSelector(getTicketState)
    const ticketDate = !!ticket.get('created_datetime')
        ? new Date(ticket.get('created_datetime'))
        : null
    let targetDate = new Date(FIRST_CONSUMED_ORCH_EVENT_DATETIME)
    const isNewAgenticArchitectureEnabled = useFlag(
        FeatureFlagKey.AiAgentUseNewAgenticArchitecture,
    )

    const { data: aiAgentFeedback, isLoading } = useGetAiAgentFeedback({
        refetchOnWindowFocus: false,
        enabled: isNewAgenticArchitectureEnabled,
    })

    if (!isNewAgenticArchitectureEnabled) return false

    if (!ticketDate || isLoading) return true

    const hasOldFeedback =
        (aiAgentFeedback?.data?.messages?.reduce(
            (acc, message) =>
                acc +
                message.feedbackOnMessage.length +
                message.feedbackOnResource.length,
            0,
        ) ?? 0) > 0

    // if a ticket already received feedback prior to the new feedback collection we should show the old feedback
    // for a given period of time to not upset customers
    if (hasOldFeedback) {
        targetDate.setMonth(
            targetDate.getMonth() +
                NUMBER_OF_MONTHS_TO_SKIP_NEW_FEEDBACK_COLLECTION,
        )
    }

    return ticketDate > targetDate
}
