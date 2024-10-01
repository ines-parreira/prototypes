/* istanbul ignore file */
import {useFlag} from 'common/flags'
import {FeatureFlagKey} from 'config/featureFlags'
import useAppSelector from 'hooks/useAppSelector'
import {
    DATE_FEATURE_AVAILABLE,
    TRIAL_MESSAGE_TAG,
} from 'pages/tickets/detail/components/AIAgentFeedbackBar/constants'
import {getAIAgentMessages} from 'state/ticket/selectors'

export default function useHasAIAgent() {
    const isFeedbackToAiAgentEnabled = useFlag<boolean>(
        FeatureFlagKey.FeedbackToAIAgentInTicketViews,
        false
    )

    const aiMessages = useAppSelector(getAIAgentMessages).filter(
        (message) => new Date(message.created_datetime) > DATE_FEATURE_AVAILABLE
    )

    const allAIMessagesOnTrialMode = aiMessages.every(
        (message) =>
            message.body_html &&
            message.body_html.indexOf(TRIAL_MESSAGE_TAG) !== -1
    )

    return (
        aiMessages.length > 0 &&
        isFeedbackToAiAgentEnabled &&
        !allAIMessagesOnTrialMode
    )
}
