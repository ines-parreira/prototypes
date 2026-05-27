import type { ReactNode } from 'react'
import { createContext, createElement, useContext, useMemo } from 'react'

import { useShallow } from 'zustand/react/shallow'

import { getLast28DaysDateRange } from 'domains/reporting/models/queryFactories/knowledge/knowledgeInsightsMetrics'
import type { ResourceMetricsByDay } from 'domains/reporting/models/queryFactories/knowledge/knowledgeInsightsMetrics'
import type { ImpactDateRange } from 'pages/aiAgent/components/KnowledgeEditor/shared/useVersionHistoryBase/useVersionHistoryBase'
import { useGetCustomTicketsFieldsDefinitionData } from 'pages/aiAgent/insights/IntentTableWidget/hooks/useGetCustomTicketsFieldsDefinitionData'
import { useSkillsMetrics } from 'pages/aiAgent/skills/hooks/useSkillsMetrics'
import { useSkillsMetricsByDay } from 'pages/aiAgent/skills/hooks/useSkillsMetricsByDay'
import { useTotalAiAgentTickets } from 'pages/aiAgent/skills/hooks/useTotalAiAgentTickets'
import type { SkillMetrics } from 'pages/aiAgent/skills/types'

import type { KnowledgeRecentTicketsData } from '../../shared/hooks/useKnowledgeRecentTickets'
import { useKnowledgeRecentTickets } from '../../shared/hooks/useKnowledgeRecentTickets'
import { useSkillEditorStore } from '../context'

export type SkillMetricsData = {
    metrics: SkillMetrics | null
    metricsByDay: ResourceMetricsByDay[] | null
    isLoading: boolean
    isMetricsByDayLoading: boolean
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

const SkillPerformanceDataContext = createContext<
    SkillPerformanceData | undefined
>(undefined)

type SkillPerformanceDataProviderProps = {
    children?: ReactNode
    value: SkillPerformanceData
}

export const SkillPerformanceDataProvider = ({
    children,
    value,
}: SkillPerformanceDataProviderProps) =>
    createElement(SkillPerformanceDataContext.Provider, { value }, children)

export const useSkillPerformanceDataContext = (): SkillPerformanceData => {
    const skillPerformanceData = useContext(SkillPerformanceDataContext)

    if (!skillPerformanceData) {
        throw new Error(
            'useSkillPerformanceDataContext must be used within SkillPerformanceDataProvider',
        )
    }

    return skillPerformanceData
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

    const { data: metricsByDayData, isLoading: isMetricsByDayLoading } =
        useSkillsMetricsByDay(
            shopIntegrationId,
            skillArticleId ?? 0,
            helpCenterId,
            !!skillArticleId && !!shopIntegrationId && !!helpCenterId,
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

    const metricsByDay = useMemo<ResourceMetricsByDay[] | null>(() => {
        if (!metricsByDayData || !skillArticleId) return null
        return metricsByDayData
    }, [metricsByDayData, skillArticleId])

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
            metricsByDay,
            isLoading,
            isMetricsByDayLoading,
            resourceSourceId: skillArticleId ?? 0,
            shopIntegrationId,
            dateRange,
            totalAiAgentTickets,
            outcomeCustomFieldId,
            intentCustomFieldId,
        }),
        [
            metrics,
            metricsByDay,
            isLoading,
            isMetricsByDayLoading,
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
