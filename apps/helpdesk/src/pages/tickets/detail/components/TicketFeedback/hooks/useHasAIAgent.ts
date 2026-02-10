/* istanbul ignore file */
import useAppSelector from 'hooks/useAppSelector'
import { DATE_FEATURE_AVAILABLE } from 'pages/tickets/detail/components/AIAgentFeedbackBar/constants'
import { getAIAgentMessages } from 'state/ticket/selectors'

export default function useHasAIAgent() {
    const aiMessages = useAppSelector(getAIAgentMessages).filter(
        (message) =>
            new Date(message.created_datetime) > DATE_FEATURE_AVAILABLE,
    )

    return aiMessages.length > 0
}
