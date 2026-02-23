import { useCallback, useMemo } from 'react'

import { getCsvFileNameWithDates } from 'domains/reporting/hooks/common/utils'
import { useDashboardData } from 'domains/reporting/hooks/dashboards/useDashboardData'
import { useStatsFilters } from 'domains/reporting/hooks/support-performance/useStatsFilters'
import type { DashboardSchema } from 'domains/reporting/pages/dashboards/types'
import { DashboardChildType } from 'domains/reporting/pages/dashboards/types'
import { saveZippedFiles } from 'utils/file'

import { ANALYTICS_AI_AGENT_ALL_AGENTS_LAYOUT } from '../config/aiAgentAllAgentsLayoutConfig'
import { useDownloadAiAgentAutomationRateTimeSeriesData } from './useDownloadAiAgentAutomationRateTimeSeriesData'
import { useDownloadAutomatedInteractionsBySkillData } from './useDownloadAutomatedInteractionsBySkillData'
import { useDownloadChannelPerformanceData } from './useDownloadChannelPerformanceData'
import { useDownloadIntentPerformanceData } from './useDownloadIntentPerformanceData'

const REPORT_NAME = 'ai-agent-all-agents'

const aiAgentAllAgentsDashboard: DashboardSchema = {
    id: -1,
    name: REPORT_NAME,
    analytics_filter_id: null,
    emoji: null,
    children: ANALYTICS_AI_AGENT_ALL_AGENTS_LAYOUT.sections
        .filter((section) => section.type === 'kpis')
        .map((section) => ({
            type: DashboardChildType.Section,
            children: section.items
                .filter((item) => item.visibility)
                .map((item) => ({
                    type: DashboardChildType.Chart,
                    config_id: item.chartId,
                })),
        })),
}

export const useExportAiAgentAllAgentsToCSV = () => {
    const { cleanStatsFilters } = useStatsFilters()

    const { files: trendCardsFiles, isLoading: isKpiLoading } =
        useDashboardData(aiAgentAllAgentsDashboard, true)

    const automatedInteractionsBySkillData =
        useDownloadAutomatedInteractionsBySkillData()
    const automationRateTimeSeriesData =
        useDownloadAiAgentAutomationRateTimeSeriesData()
    const channelPerformanceData = useDownloadChannelPerformanceData()
    const intentPerformanceData = useDownloadIntentPerformanceData()

    const isLoading =
        isKpiLoading ||
        automatedInteractionsBySkillData.isLoading ||
        automationRateTimeSeriesData.isLoading ||
        channelPerformanceData.isLoading ||
        intentPerformanceData.isLoading

    const files = useMemo(
        () => ({
            ...trendCardsFiles,
            ...automatedInteractionsBySkillData.files,
            ...automationRateTimeSeriesData.files,
            ...channelPerformanceData.files,
            ...intentPerformanceData.files,
        }),
        [
            trendCardsFiles,
            automatedInteractionsBySkillData.files,
            automationRateTimeSeriesData.files,
            channelPerformanceData.files,
            intentPerformanceData.files,
        ],
    )

    const triggerDownload = useCallback(async () => {
        const fileName = getCsvFileNameWithDates(
            cleanStatsFilters.period,
            REPORT_NAME,
        ).replace('.csv', '')
        await saveZippedFiles(files, fileName)
    }, [files, cleanStatsFilters.period])

    return {
        triggerDownload,
        isLoading,
    }
}
