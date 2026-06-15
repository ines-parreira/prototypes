import { useMemo } from 'react'

import { getLast28DaysDateRange } from 'domains/reporting/models/queryFactories/knowledge/knowledgeInsightsMetrics'
import { useGetHelpCenterArticleList } from 'models/helpCenter/queries'

import type { SkillMetrics, TransformedArticle } from '../types'
import { transformArticleListToSkillsView } from '../utils/transformArticleListToSkillsView'
import {
    skillKey,
    useSkillsAggregateMetrics,
} from './useSkillsAggregateMetrics'

export const useSkillsArticles = (
    helpCenterId: number,
    shopIntegrationId: number,
) => {
    const metricsDateRange = useMemo(() => getLast28DaysDateRange(), [])

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
        data: metricsMap,
        isLoading: isMetricsLoading,
        isError: isMetricsError,
    } = useSkillsAggregateMetrics({
        shopIntegrationId,
        dateRange: metricsDateRange,
        enabled: !!shopIntegrationId,
    })

    const articles = useMemo<TransformedArticle[]>(() => {
        if (!data?.data) return []
        return transformArticleListToSkillsView(data.data)
    }, [data])

    const enrichedArticles = useMemo(() => {
        if (!metricsMap) return articles
        return articles.map((article) => {
            // Skill identity in the helper cube is the pair
            // (resourceSourceSetId, resourceSourceId), which here corresponds
            // to (helpCenterId, articleId) by construction.
            const key = skillKey(helpCenterId, article.id)
            const aggregate = metricsMap.get(key)
            if (!aggregate) return article

            const metrics: SkillMetrics = {
                tickets: aggregate.tickets,
                prevTickets: null,
                handoverTickets: aggregate.handoverTickets,
                prevHandoverTickets: null,
                csat: aggregate.csat,
                prevCsat: null,
                resourceSourceSetId: helpCenterId,
            }
            return { ...article, metrics }
        })
    }, [articles, metricsMap, helpCenterId])

    return {
        articles: enrichedArticles,
        isLoading,
        isError,
        isMetricsLoading,
        isMetricsError,
        metricsDateRange,
    }
}
