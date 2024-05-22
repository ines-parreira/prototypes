import {UseQueryOptions, useQuery} from '@tanstack/react-query'
import {getAIAgentTicketMessagesFeedback} from './resources'

export const aiAgentFeedbackKeys = {
    all: () => ['aiAgentFeedback'] as const,
    details: () => [...aiAgentFeedbackKeys.all(), 'detail'] as const,
    detail: (ticketId: number) =>
        [...aiAgentFeedbackKeys.details(), ticketId] as const,
}

export const useGetAiAgentFeedback = (
    ticketId: number,
    overrides?: UseQueryOptions<
        Awaited<ReturnType<typeof getAIAgentTicketMessagesFeedback>>
    >
) => {
    return useQuery({
        queryKey: aiAgentFeedbackKeys.detail(ticketId),
        queryFn: () => getAIAgentTicketMessagesFeedback(ticketId),
        ...overrides,
    })
}
