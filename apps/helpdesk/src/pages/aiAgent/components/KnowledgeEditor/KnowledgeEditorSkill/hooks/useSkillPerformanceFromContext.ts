import { useMemo } from 'react'

import { useShallow } from 'zustand/react/shallow'

import { getLast28DaysDateRange } from 'domains/reporting/models/queryFactories/knowledge/knowledgeInsightsMetrics'
import type { ImpactDateRange } from 'pages/aiAgent/components/KnowledgeEditor/shared/useVersionHistoryBase/useVersionHistoryBase'
import { useGetCustomTicketsFieldsDefinitionData } from 'pages/aiAgent/insights/IntentTableWidget/hooks/useGetCustomTicketsFieldsDefinitionData'
import { useSkillsMetrics } from 'pages/aiAgent/skills/hooks/useSkillsMetrics'
import { useTotalAiAgentTickets } from 'pages/aiAgent/skills/hooks/useTotalAiAgentTickets'
import type { SkillMetrics } from 'pages/aiAgent/skills/types'

import type { KnowledgeRecentTicketsData } from '../../shared/hooks/useKnowledgeRecentTickets'
import { useKnowledgeRecentTickets } from '../../shared/hooks/useKnowledgeRecentTickets'
import { useSkillEditorStore } from '../context'

export type SkillMetricsData = {
    metrics: SkillMetrics | null
    isLoading: boolean
    resourceSourceId: number
    shopIntegrationId: number
    dateRange: { start_datetime: string; end_datetime: string }
    totalAiAgentTickets: number
    outcomeCustomFieldId?: number
    intentCustomFieldId?: number
}

export type SkillRecentTicketsData = KnowledgeRecentTicketsData

export type SkillPerformanceData = {
    skillMetrics: SkillMetricsData
    recentTickets: SkillRecentTicketsData | undefined
    isPreview?: boolean
    historicalVersionDateRange?: ImpactDateRange
}

export const useSkillPerformanceFromContext = (): SkillPerformanceData => {
    const {
        skillArticleId,
        shopIntegrationId,
        helpCenterId,
        isPreview,
        historicalVersionDateRange,
    } = useSkillEditorStore(
        useShallow((storeState) => ({
            skillArticleId: storeState.state.skill?.id,
            shopIntegrationId:
                storeState.config.helpCenter.shop_integration_id ?? 0,
            helpCenterId: storeState.config.helpCenter.id,
            isPreview: storeState.config.isPreviewMode,
            historicalVersionDateRange:
                storeState.state.historicalVersion?.impactDateRange,
        })),
    )

    const dateRange = useMemo(
        () => historicalVersionDateRange ?? getLast28DaysDateRange(),
        [historicalVersionDateRange],
    )

    const { data: metricsData, isLoading } = useSkillsMetrics(
        shopIntegrationId,
        !!skillArticleId && !!shopIntegrationId,
        dateRange,
    )

    const metrics = useMemo<SkillMetrics | null>(() => {
        if (!metricsData || !skillArticleId) return null

        const entry = metricsData.find(
            (m) => m.resourceSourceId === skillArticleId,
        )
        if (!entry) return null

        return {
            tickets: entry.tickets,
            handoverTickets: entry.handoverTickets,
            csat: entry.csat,
            resourceSourceSetId: entry.resourceSourceSetId,
        }
    }, [metricsData, skillArticleId])

    const { totalCount: totalAiAgentTickets } = useTotalAiAgentTickets()

    const { outcomeCustomFieldId, intentCustomFieldId } =
        useGetCustomTicketsFieldsDefinitionData()

    const recentTickets = useKnowledgeRecentTickets({
        resourceSourceId: skillArticleId ?? 0,
        resourceSourceSetId: helpCenterId,
        shopIntegrationId,
        enabled: !!skillArticleId,
        dateRange,
    })

    const skillMetrics = useMemo<SkillMetricsData>(
        () => ({
            metrics,
            isLoading,
            resourceSourceId: skillArticleId ?? 0,
            shopIntegrationId,
            dateRange,
            totalAiAgentTickets,
            outcomeCustomFieldId,
            intentCustomFieldId,
        }),
        [
            metrics,
            isLoading,
            skillArticleId,
            shopIntegrationId,
            dateRange,
            totalAiAgentTickets,
            outcomeCustomFieldId,
            intentCustomFieldId,
        ],
    )

    return useMemo(
        () => ({
            skillMetrics,
            recentTickets,
            isPreview,
            historicalVersionDateRange,
        }),
        [skillMetrics, recentTickets, isPreview, historicalVersionDateRange],
    )
}
