import useAppSelector from 'hooks/useAppSelector'
import {useGetAiAgentFeedback} from 'models/aiAgentFeedback/queries'
import {getSelectedAIMessage} from 'state/ui/ticketAIAgentFeedback'

export default function useAiAgentMessageFeedback() {
    const selectedMessage = useAppSelector(getSelectedAIMessage)
    const {data} = useGetAiAgentFeedback({
        refetchOnWindowFocus: false,
    })

    const ticketFeedback = data?.data

    return selectedMessage
        ? ticketFeedback?.messages?.find(
              (messageFeedback) =>
                  messageFeedback.messageId === selectedMessage.id
          ) || null
        : null
}
