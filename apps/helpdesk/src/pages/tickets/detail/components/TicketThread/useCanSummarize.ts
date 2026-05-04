import { useMemo } from 'react'

const MIN_MESSAGES_TO_SUMMARIZE = 4
const MIN_MESSAGES_AFTER_HANDOVER = 2

type UseCanSummarizeParams = {
    hasHandoverMessage: boolean
    messagesAfterHandover: number
    messageCount: number
    hasInternalMessages: boolean
    hasExternalMessages: boolean
}

export function useCanSummarize({
    hasHandoverMessage,
    messagesAfterHandover,
    messageCount,
    hasInternalMessages,
    hasExternalMessages,
}: UseCanSummarizeParams): boolean {
    return useMemo(() => {
        if (hasHandoverMessage) {
            return messagesAfterHandover >= MIN_MESSAGES_AFTER_HANDOVER
        }
        return (
            messageCount >= MIN_MESSAGES_TO_SUMMARIZE &&
            hasInternalMessages &&
            hasExternalMessages
        )
    }, [
        hasHandoverMessage,
        messagesAfterHandover,
        messageCount,
        hasInternalMessages,
        hasExternalMessages,
    ])
}
