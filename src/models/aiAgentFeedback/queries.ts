import {UseQueryOptions, useMutation, useQuery} from '@tanstack/react-query'
import {MutationOverrides} from 'types/query'
import {
    getAIAgentTicketMessagesFeedback,
    submitAIAgentTicketMessagesFeedback,
    deleteAIAgentTicketMessagesFeedback,
} from './resources'

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

export const useSubmitAIAgentTicketMessagesFeedback = <TContext = unknown>(
    overrides?: MutationOverrides<
        typeof submitAIAgentTicketMessagesFeedback,
        false,
        TContext
    >
) => {
    return useMutation({
        mutationFn: (params) => submitAIAgentTicketMessagesFeedback(...params),
        ...overrides,
    })
}

export const useDeleteAIAgentTicketMessagesFeedback = (
    overrides?: MutationOverrides<typeof deleteAIAgentTicketMessagesFeedback>
) => {
    return useMutation({
        mutationFn: (params) => deleteAIAgentTicketMessagesFeedback(...params),
        ...overrides,
    })
}
