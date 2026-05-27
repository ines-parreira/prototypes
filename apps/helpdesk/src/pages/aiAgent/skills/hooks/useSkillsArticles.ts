import { useMemo } from 'react'

import { getLast28DaysDateRange } from 'domains/reporting/models/queryFactories/knowledge/knowledgeInsightsMetrics'
import { useGetHelpCenterArticleList } from 'models/helpCenter/queries'

import type { SkillMetrics, TransformedArticle } from '../types'
import { transformArticleListToSkillsView } from '../utils/transformArticleListToSkillsView'
import { useSkillsMetrics } from './useSkillsMetrics'

export const useSkillsArticles = (
    helpCenterId: number,
    shopIntegrationId: number,
) => {
    const { data, isLoading, isError } = useGetHelpCenterArticleList(
        helpCenterId,
        {
            origin: 'skill',
            version_status: 'latest_draft',
            per_page: 200,
        },
        {
            enabled: !!helpCenterId,
        },
    )

    const {
        data: metricsData,
        isLoading: isMetricsLoading,
        isError: isMetricsError,
    } = useSkillsMetrics(shopIntegrationId, !!shopIntegrationId)

    const articles = useMemo<TransformedArticle[]>(() => {
        if (!data?.data) return []
        return transformArticleListToSkillsView(data.data)
    }, [data])

    const metricsMap = useMemo(() => {
        if (!metricsData) return new Map<string, SkillMetrics>()

        const map = new Map<string, SkillMetrics>()
        metricsData.forEach((metric) => {
            map.set(String(metric.resourceSourceId), {
                tickets: metric.tickets,
                prevTickets: null,
                handoverTickets: metric.handoverTickets,
                prevHandoverTickets: null,
                csat: metric.csat,
                prevCsat: null,
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
