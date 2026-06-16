import { useMemo } from 'react'

import { getLast28DaysDateRange } from 'domains/reporting/models/queryFactories/knowledge/knowledgeInsightsMetrics'
import { useGetHelpCenterArticleList } from 'models/helpCenter/queries'

import type { SkillMetrics, TransformedArticle } from '../types'
import { transformArticleListToSkillsView } from '../utils/transformArticleListToSkillsView'
import {
    skillKey,
    useSkillsAggregateMetrics,
} from './useSkillsAggregateMetrics'
import { useSkillsSuccessRates } from './useSkillsSuccessRates'

type UseSkillsArticlesOptions = {
    includeSuccessRate?: boolean
}

export const useSkillsArticles = (
    helpCenterId: number,
    shopIntegrationId: number,
    { includeSuccessRate = false }: UseSkillsArticlesOptions = {},
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

    // Success rate is gated by the M3 reporting-layer feature flag — the column
    // it powers is hidden when the flag is off, so we skip the fan-out too.
    const {
        data: successRateMap,
        isLoading: isSuccessRateLoading,
        isError: isSuccessRateError,
    } = useSkillsSuccessRates({
        shopIntegrationId,
        dateRange: metricsDateRange,
        enabled: !!shopIntegrationId && includeSuccessRate,
    })

    const articles = useMemo<TransformedArticle[]>(() => {
        if (!data?.data) return []
        return transformArticleListToSkillsView(data.data)
    }, [data])

    const enrichedArticles = useMemo(() => {
        if (!metricsMap && !successRateMap) return articles
        return articles.map((article) => {
            // Skill identity in the helper cube is the pair
            // (resourceSourceSetId, resourceSourceId), which here corresponds
            // to (helpCenterId, articleId) by construction.
            const key = skillKey(helpCenterId, article.id)
            const aggregate = metricsMap?.get(key)
            const successRateEntry = successRateMap?.get(key)
            if (!aggregate && !successRateEntry) return article

            const metrics: SkillMetrics = {
                tickets: aggregate?.tickets ?? null,
                prevTickets: null,
                handoverTickets: aggregate?.handoverTickets ?? null,
                prevHandoverTickets: null,
                csat: aggregate?.csat ?? null,
                prevCsat: null,
                successRate: successRateEntry?.value ?? null,
                prevSuccessRate: successRateEntry?.prevValue ?? null,
                resourceSourceSetId: helpCenterId,
            }
            return { ...article, metrics }
        })
    }, [articles, metricsMap, successRateMap, helpCenterId])

    return {
        articles: enrichedArticles,
        isLoading,
        isError,
        isMetricsLoading: isMetricsLoading || isSuccessRateLoading,
        isMetricsError: isMetricsError || isSuccessRateError,
        metricsDateRange,
    }
}
