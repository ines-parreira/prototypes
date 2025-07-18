import { QueryKey, useQuery, UseQueryOptions } from '@tanstack/react-query'

import {
    FindAiReasoningAiReasoningResult,
    FindFeedbackParams,
    FindFeedbackResult,
    GetEarliestExecutionFeedbackResult,
} from '@gorgias/knowledge-service-client'
import {
    useFindAiReasoningAiReasoning,
    useFindFeedback,
    useGetEarliestExecutionFeedback,
} from '@gorgias/knowledge-service-queries'

import { getGorgiasKsApiClient } from 'rest_api/knowledge_service_api/client'
import { Paths } from 'rest_api/knowledge_service_api/client.generated'

export const STALE_TIME_MS = 1 * 60 * 1000 // 1 minutes
export const CACHE_TIME_MS = 2 * 60 * 1000 // 2 minutes
export enum ReasoningResponseType {
    OUTCOME = 'OUTCOME',
    RESPONSE = 'RESPONSE',
    TASK = 'TASK',
}

const KNOWLEDGE_RESOURCES_QUERY_KEY = 'knowledge-resources'

export const knowledgeResourcesDefinitionKeys = {
    all: () => [KNOWLEDGE_RESOURCES_QUERY_KEY] as const,
    lists: () => [...knowledgeResourcesDefinitionKeys.all(), 'list'] as const,
    list: (params: Paths.FindAllGuidancesKnowledgeResources.QueryParameters) =>
        [...knowledgeResourcesDefinitionKeys.lists(), params] as const,
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

export const useFindAllGuidancesKnowledgeResources = <T>(
    params: Paths.FindAllGuidancesKnowledgeResources.QueryParameters,
    overrides?: UseQueryOptions<
        Awaited<Paths.FindAllGuidancesKnowledgeResources.Responses.$200>,
        unknown,
        T
    >,
) => {
    return useQuery({
        queryKey: knowledgeResourcesDefinitionKeys.list(params),
        queryFn: async () => {
            const client = await getGorgiasKsApiClient()
            const response = await client.findAllGuidancesKnowledgeResources(
                params,
                {},
                {
                    paramsSerializer: {
                        indexes: false,
                    },
                },
            )
            return response.data
        },
        staleTime: STALE_TIME_MS,
        cacheTime: CACHE_TIME_MS,
        ...overrides,
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
