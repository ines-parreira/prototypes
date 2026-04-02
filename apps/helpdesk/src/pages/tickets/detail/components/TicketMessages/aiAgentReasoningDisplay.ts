import { TicketVia } from 'business/types/ticket'

export type AiAgentReasoningDisplayMode =
    | 'hidden'
    | 'reasoning'
    | 'simplified-banner'

type EarliestExecution = {
    reasoningTimestamp?: string | null
} | null

type GetShouldTicketHaveReasoningParams = {
    earliestExecution?: EarliestExecution
    messageCreatedDatetime: string
}

type GetAiAgentReasoningDisplayModeParams = {
    isAIAgentMessage: boolean
    isInternalNote: boolean
    isTicketAfterFeedbackCollectionPeriod: boolean
    shouldTicketHaveReasoning: boolean | null
    showAiReasoning: boolean
    onlyShowReasoningWhileImpersonating: boolean
    isImpersonated: boolean
    messageId?: number | null
    messageVia?: string | null
}

export function getShouldTicketHaveReasoning({
    earliestExecution,
    messageCreatedDatetime,
}: GetShouldTicketHaveReasoningParams): boolean | null {
    if (!earliestExecution) {
        return null
    }

    if (!earliestExecution.reasoningTimestamp) {
        return false
    }

    const messageDate = new Date(messageCreatedDatetime)

    return (
        messageDate.getTime() >
        new Date(earliestExecution.reasoningTimestamp).getTime()
    )
}

export function getAiAgentReasoningDisplayMode({
    isAIAgentMessage,
    isInternalNote,
    isTicketAfterFeedbackCollectionPeriod,
    shouldTicketHaveReasoning,
    showAiReasoning,
    onlyShowReasoningWhileImpersonating,
    isImpersonated,
    messageId,
    messageVia,
}: GetAiAgentReasoningDisplayModeParams): AiAgentReasoningDisplayMode {
    if (!isAIAgentMessage || shouldTicketHaveReasoning === null) {
        return 'hidden'
    }

    if (!isTicketAfterFeedbackCollectionPeriod) {
        return 'simplified-banner'
    }

    const shouldDisplayReasoning =
        showAiReasoning &&
        !!messageId &&
        !isInternalNote &&
        messageVia === TicketVia.Api &&
        shouldTicketHaveReasoning &&
        (isImpersonated || !onlyShowReasoningWhileImpersonating)

    return shouldDisplayReasoning ? 'reasoning' : 'simplified-banner'
}
