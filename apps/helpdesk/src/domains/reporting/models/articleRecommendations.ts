import type { UseQueryOptions } from '@tanstack/react-query'
import { useQuery } from '@tanstack/react-query'
import type { AxiosResponse } from 'axios'

import { appQueryClient } from 'api/queryClient'
import { reportingRetryDelayHandler, reportingRetryHandler } from 'api/utils'
import client from 'models/api/resources'

export const ARTICLE_RECOMMENDATIONS_ENDPOINT =
    '/api/reporting/article-recommendations/'

export type ArticleRecommendationApiItem = {
    data: [
        {
            article_id: string
            article_title: string
            article_url: string
            total_count: number
            automation_rate: number
            successful_count: number
            helpful_count: number
            drop_off_count: number
            handover_count: number
        },
    ]
}

export type ArticleRecommendationsParams = {
    start_datetime: string
    end_datetime: string
    store_integration_id?: number
    channel?: string
}

const defaultOptions = {
    staleTime: 5 * 60 * 1000,
    cacheTime: 10 * 60 * 1000,
    retry: reportingRetryHandler,
    retryDelay: reportingRetryDelayHandler,
} as const

const getArticleRecommendations = (params: ArticleRecommendationsParams) =>
    client.get<ArticleRecommendationApiItem>(ARTICLE_RECOMMENDATIONS_ENDPOINT, {
        params,
    })

export const articleRecommendationsKeys = {
    get: (params: ArticleRecommendationsParams) => [
        'reporting',
        'article-recommendations',
        params,
    ],
}

export const useArticleRecommendations = (
    params: ArticleRecommendationsParams,
    overrides?: UseQueryOptions<
        AxiosResponse<ArticleRecommendationApiItem>,
        unknown
    >,
) =>
    useQuery({
        queryKey: articleRecommendationsKeys.get(params),
        queryFn: () => getArticleRecommendations(params),
        ...defaultOptions,
        ...overrides,
    })

export const fetchArticleRecommendations = (
    params: ArticleRecommendationsParams,
    overrides?: UseQueryOptions<
        AxiosResponse<ArticleRecommendationApiItem>,
        unknown
    >,
) =>
    appQueryClient.fetchQuery({
        queryKey: articleRecommendationsKeys.get(params),
        queryFn: () => getArticleRecommendations(params),
        ...defaultOptions,
        ...overrides,
    })
