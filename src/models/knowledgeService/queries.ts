import { useQuery, UseQueryOptions } from '@tanstack/react-query'

import { getGorgiasKsApiClient } from 'rest_api/knowledge_service_api/client'
import { Paths } from 'rest_api/knowledge_service_api/client.generated'

export const STALE_TIME_MS = 1 * 60 * 1000 // 1 minutes
export const CACHE_TIME_MS = 2 * 60 * 1000 // 2 minutes

const FEEDBACK_QUERY_KEY = 'feedback'

export const feedbackDefinitionKeys = {
    all: () => [FEEDBACK_QUERY_KEY] as const,
    lists: () => [...feedbackDefinitionKeys.all(), 'list'] as const,
    list: (params: Paths.FindFeedbackFeedback.QueryParameters) =>
        [...feedbackDefinitionKeys.lists(), params] as const,
    get: (id: string) => [FEEDBACK_QUERY_KEY, id] as const,
    earliestExecution: () =>
        [...feedbackDefinitionKeys.all(), 'earliestExecution'] as const,
}

const KNOWLEDGE_RESOURCES_QUERY_KEY = 'knowledge-resources'

export const knowledgeResourcesDefinitionKeys = {
    all: () => [KNOWLEDGE_RESOURCES_QUERY_KEY] as const,
    lists: () => [...knowledgeResourcesDefinitionKeys.all(), 'list'] as const,
    list: (params: Paths.FindAllGuidancesKnowledgeResources.QueryParameters) =>
        [...knowledgeResourcesDefinitionKeys.lists(), params] as const,
}

export const useGetFeedback = (
    params: Paths.FindFeedbackFeedback.QueryParameters,
    overrides?: UseQueryOptions<
        Awaited<Paths.FindFeedbackFeedback.Responses.$200>
    >,
) => {
    return useQuery({
        queryKey: feedbackDefinitionKeys.list(params),
        queryFn: async () => {
            const client = await getGorgiasKsApiClient()
            const response = await client.findFeedbackFeedback(
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
        Awaited<Paths.GetEarliestExecutionFeedback.Responses.$200>
    >,
) => {
    return useQuery({
        queryKey: feedbackDefinitionKeys.earliestExecution(),
        queryFn: async () => {
            const client = await getGorgiasKsApiClient()
            const response = await client.getEarliestExecutionFeedback(
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
