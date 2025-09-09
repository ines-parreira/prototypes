import { useMutation, useQuery, UseQueryOptions } from '@tanstack/react-query'

import useAppSelector from 'hooks/useAppSelector'
import { DATE_FEATURE_AVAILABLE } from 'pages/tickets/detail/components/AIAgentFeedbackBar/constants'
import { getAIAgentMessages } from 'state/ticket/selectors'
import { MutationOverrides } from 'types/query'

import {
    deleteAIAgentTicketMessagesFeedback,
    getAIAgentTicketMessagesFeedback,
    submitAIAgentTicketMessagesFeedback,
} from './resources'

export const aiAgentFeedbackKeys = {
    all: () => ['aiAgentFeedback'] as const,
    details: () => [...aiAgentFeedbackKeys.all(), 'detail'] as const,
    detail: (messageIds: number[]) =>
        [...aiAgentFeedbackKeys.details(), messageIds.join(',')] as const,
}

export const useGetAiAgentFeedback = <
    TData = Awaited<ReturnType<typeof getAIAgentTicketMessagesFeedback>>,
>(
    overrides?: UseQueryOptions<
        Awaited<ReturnType<typeof getAIAgentTicketMessagesFeedback>>,
        unknown,
        TData
    >,
) => {
    const aiMessages = useAppSelector(getAIAgentMessages)
    const messageIds = aiMessages
        .filter(
            (message) =>
                new Date(message.created_datetime) > DATE_FEATURE_AVAILABLE,
        )
        .map((message) => message.id) as number[]

    return useQuery({
        queryKey: aiAgentFeedbackKeys.detail(messageIds),
        queryFn: () => getAIAgentTicketMessagesFeedback(messageIds),
        ...overrides,
        enabled: (overrides?.enabled ?? true) && messageIds.length > 0,
    })
}

export const useSubmitAIAgentTicketMessagesFeedback = <TContext = unknown>(
    overrides?: MutationOverrides<
        typeof submitAIAgentTicketMessagesFeedback,
        false,
        TContext
    >,
) => {
    return useMutation({
        mutationFn: (params) => submitAIAgentTicketMessagesFeedback(...params),
        ...overrides,
    })
}

export const useDeleteAIAgentTicketMessagesFeedback = (
    overrides?: MutationOverrides<typeof deleteAIAgentTicketMessagesFeedback>,
) => {
    return useMutation({
        mutationFn: (params) => deleteAIAgentTicketMessagesFeedback(...params),
        ...overrides,
    })
}
