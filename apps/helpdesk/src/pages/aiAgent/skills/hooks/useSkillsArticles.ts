import { useMemo } from 'react'

import { getLast28DaysDateRange } from 'domains/reporting/models/queryFactories/knowledge/knowledgeInsightsMetrics'
import { useListIntents } from 'models/helpCenter/queries'

import type { SkillMetrics, TransformedArticle } from '../types'
import { transformToArticleFirstView } from '../utils/transformToArticleFirstView'
import { useSkillsMetrics } from './useSkillsMetrics'

/**
 * Custom hook to fetch and transform skills articles data
 *
 * Fetches intent-first data from the backend and transforms it to article-first view.
 * Each article entry includes all intents linked to it, and if the same article has
 * both published and draft versions, both configurations are stored under the same article.
 * Also enriches articles with metrics data (tickets, handover, CSAT).
 *
 * @param helpCenterId - The help center ID to fetch intents for
 * @param shopIntegrationId - The shop integration ID for fetching metrics
 * @returns Object containing enriched articles array, loading states, error state, and metrics date range
 */
export const useSkillsArticles = (
    helpCenterId: number,
    shopIntegrationId: number,
) => {
    const { data, isLoading, isError } = useListIntents(helpCenterId, {
        enabled: !!helpCenterId,
    })

    const {
        data: metricsData,
        isLoading: isMetricsLoading,
        isError: isMetricsError,
    } = useSkillsMetrics(shopIntegrationId, !!shopIntegrationId)

    const articles = useMemo<TransformedArticle[]>(() => {
        if (!data?.intents) return []
        return transformToArticleFirstView(data.intents)
    }, [data])

    const metricsMap = useMemo(() => {
        if (!metricsData) return new Map<string, SkillMetrics>()

        const map = new Map<string, SkillMetrics>()
        metricsData.forEach((metric) => {
            map.set(String(metric.resourceSourceId), {
                tickets: metric.tickets,
                handoverTickets: metric.handoverTickets,
                csat: metric.csat,
                resourceSourceSetId: metric.resourceSourceSetId,
            })
        })
        return map
    }, [metricsData])

    const enrichedArticles = useMemo(() => {
        return articles.map((article) => ({
            ...article,
            metrics: metricsMap.get(String(article.id)),
        }))
    }, [articles, metricsMap])

    const metricsDateRange = useMemo(() => getLast28DaysDateRange(), [])

    return {
        articles: enrichedArticles,
        isLoading,
        isError,
        isMetricsLoading,
        isMetricsError,
        metricsDateRange,
    }
}
