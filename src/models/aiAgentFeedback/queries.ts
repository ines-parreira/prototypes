import {UseQueryOptions, useMutation, useQuery} from '@tanstack/react-query'
import {MutationOverrides} from 'types/query'
import useAppSelector from 'hooks/useAppSelector'
import {getAIAgentMessages} from 'state/ticket/selectors'
import {
    getAIAgentTicketMessagesFeedback,
    submitAIAgentTicketMessagesFeedback,
    deleteAIAgentTicketMessagesFeedback,
} from './resources'

export const aiAgentFeedbackKeys = {
    all: () => ['aiAgentFeedback'] as const,
    details: () => [...aiAgentFeedbackKeys.all(), 'detail'] as const,
    detail: (messageIds: number[]) =>
        [...aiAgentFeedbackKeys.details(), messageIds.join(',')] as const,
}

export const useGetAiAgentFeedback = (
    overrides?: UseQueryOptions<
        Awaited<ReturnType<typeof getAIAgentTicketMessagesFeedback>>
    >
) => {
    const aiMessages = useAppSelector(getAIAgentMessages)
    const messageIds = aiMessages.map((message) => message.id) as number[]
    return useQuery({
        queryKey: aiAgentFeedbackKeys.detail(messageIds),
        queryFn: () => getAIAgentTicketMessagesFeedback(messageIds),
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
