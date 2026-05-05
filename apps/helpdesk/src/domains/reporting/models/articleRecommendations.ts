import client, { appQueryClient } from '@repo/api-resources'
import type { UseQueryOptions } from '@tanstack/react-query'
import { useQuery } from '@tanstack/react-query'
import type { AxiosResponse } from 'axios'

import { defaultQueryOptions } from 'domains/reporting/models/queries'
import type { FilterGroup } from 'domains/reporting/models/scopes/types'

export const ARTICLE_RECOMMENDATIONS_ENDPOINT =
    '/api/reporting/article-recommendations/'

export type ArticleRecommendationApiItem = [
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
export type ArticleRecommendationsParams = {
    filters: FilterGroup[]
}

const getArticleRecommendations = (params: ArticleRecommendationsParams) =>
    client.post<ArticleRecommendationApiItem>(
        ARTICLE_RECOMMENDATIONS_ENDPOINT,
        params,
    )

export const articleRecommendationsKeys = {
    post: (params: ArticleRecommendationsParams) => [
        'reporting',
        'article-recommendations',
        params,
    ],
}

export const useArticleRecommendations = (
    params: ArticleRecommendationsParams,
    overrides?: UseQueryOptions<
        AxiosResponse<ArticleRecommendationApiItem>,
        unknown,
        ArticleRecommendationApiItem
    >,
) =>
    useQuery({
        queryKey: articleRecommendationsKeys.post(params),
        queryFn: () => getArticleRecommendations(params),
        select: (response) => response.data,
        ...defaultQueryOptions,
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
        queryKey: articleRecommendationsKeys.post(params),
        queryFn: () => getArticleRecommendations(params),
        ...defaultQueryOptions,
        ...overrides,
    })
