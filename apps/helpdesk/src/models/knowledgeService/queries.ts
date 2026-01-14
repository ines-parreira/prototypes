import type { QueryKey, UseQueryOptions } from '@tanstack/react-query'
import { useQueryClient } from '@tanstack/react-query'

import type {
    FindAiReasoningAiReasoningResult,
    FindAllGuidancesKnowledgeResourcesParams,
    FindAllGuidancesKnowledgeResourcesResult,
    FindFeedbackParams,
    FindFeedbackResult,
    GetEarliestExecutionFeedbackResult,
    GetRulesProductRecommendationResult,
} from '@gorgias/knowledge-service-client'
import {
    queryKeys,
    useFindAiReasoningAiReasoning,
    useFindAllGuidancesKnowledgeResources as useFindAllGuidancesKnowledgeResourcesQuery,
    useFindFeedback,
    useGetEarliestExecutionFeedback,
    useGetRulesProductRecommendation as useGetRulesProductRecommendationQuery,
} from '@gorgias/knowledge-service-queries'

export const STALE_TIME_MS = 1 * 60 * 1000 // 1 minutes
export const CACHE_TIME_MS = 2 * 60 * 1000 // 2 minutes
export enum ReasoningResponseType {
    OUTCOME = 'OUTCOME',
    RESPONSE = 'RESPONSE',
    TASK = 'TASK',
}

export const useGetFeedback = (
    params: FindFeedbackParams,
    overrides?: UseQueryOptions<
        FindFeedbackResult,
        any,
        FindFeedbackResult,
        QueryKey
    >,
) => {
    const { data, ...rest } = useFindFeedback(params, {
        query: {
            staleTime: STALE_TIME_MS,
            cacheTime: CACHE_TIME_MS,
            ...overrides,
        },
    })

    return {
        data: data?.data,
        ...rest,
    }
}

export const useFindAllGuidancesKnowledgeResources = (
    params: FindAllGuidancesKnowledgeResourcesParams,
    overrides?: UseQueryOptions<
        FindAllGuidancesKnowledgeResourcesResult,
        any,
        FindAllGuidancesKnowledgeResourcesResult,
        QueryKey
    >,
) => {
    return useFindAllGuidancesKnowledgeResourcesQuery(params, {
        query: { ...overrides },
    })
}

export const useGetEarliestExecution = (
    overrides?: UseQueryOptions<
        GetEarliestExecutionFeedbackResult,
        any,
        GetEarliestExecutionFeedbackResult,
        QueryKey
    >,
) => {
    const { data, ...rest } = useGetEarliestExecutionFeedback({
        query: {
            staleTime: Infinity,
            cacheTime: CACHE_TIME_MS,
            ...overrides,
        },
    })

    return {
        data: data?.data,
        ...rest,
    }
}

export const useGetMessageAiReasoning = (
    params: Parameters<typeof useFindAiReasoningAiReasoning>[0],
    overrides?: UseQueryOptions<
        FindAiReasoningAiReasoningResult,
        any,
        FindAiReasoningAiReasoningResult,
        QueryKey
    >,
) => {
    const { data, ...rest } = useFindAiReasoningAiReasoning(params, {
        query: {
            staleTime: STALE_TIME_MS,
            cacheTime: CACHE_TIME_MS,
            ...overrides,
        },
    })
    return { data: data?.data, ...rest }
}

export const useGetRulesProductRecommendation = (
    integrationId: number,
    overrides?: UseQueryOptions<
        GetRulesProductRecommendationResult,
        any,
        GetRulesProductRecommendationResult,
        QueryKey
    >,
) => {
    const { data, ...rest } = useGetRulesProductRecommendationQuery(
        integrationId,
        {
            query: {
                staleTime: STALE_TIME_MS,
                cacheTime: CACHE_TIME_MS,
                ...overrides,
            },
        },
    )

    return {
        data: data?.data,
        ...rest,
    }
}

/**
 * Hook to check if feedback mutations are in progress for a specific ticket
 * Returns true if any feedback mutation is currently running
 */
export const useIsFeedbackMutating = (params: FindFeedbackParams) => {
    const queryClient = useQueryClient()
    const feedbackQueryKey = queryKeys.feedback.findFeedback(params)
    return queryClient.isMutating({ mutationKey: feedbackQueryKey }) > 0
}
