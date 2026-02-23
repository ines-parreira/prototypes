import { useCallback, useMemo } from 'react'

import { getCsvFileNameWithDates } from 'domains/reporting/hooks/common/utils'
import { useDashboardData } from 'domains/reporting/hooks/dashboards/useDashboardData'
import { useStatsFilters } from 'domains/reporting/hooks/support-performance/useStatsFilters'
import type { DashboardSchema } from 'domains/reporting/pages/dashboards/types'
import { DashboardChildType } from 'domains/reporting/pages/dashboards/types'
import { saveZippedFiles } from 'utils/file'

import { ANALYTICS_AI_AGENT_SUPPORT_AGENT_LAYOUT } from '../config/aiAgentSupportAgentLayoutConfig'
import { useDownloadIntentPerformanceData } from './useDownloadIntentPerformanceData'
import { useDownloadSupportAgentChannelPerformanceData } from './useDownloadSupportAgentChannelPerformanceData'
import { useDownloadSupportInteractionsByIntentData } from './useDownloadSupportInteractionsByIntentData'
import { useDownloadSupportInteractionsTimeSeriesData } from './useDownloadSupportInteractionsTimeSeriesData'

const REPORT_NAME = 'ai-agent-support-agent'

const aiAgentSupportAgentDashboard: DashboardSchema = {
    id: -1,
    name: REPORT_NAME,
    analytics_filter_id: null,
    emoji: null,
    children: ANALYTICS_AI_AGENT_SUPPORT_AGENT_LAYOUT.sections
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

export const useExportAiAgentSupportAgentToCSV = () => {
    const { cleanStatsFilters } = useStatsFilters()

    const { files: trendCardsFiles, isLoading: isKpiLoading } =
        useDashboardData(aiAgentSupportAgentDashboard, true)

    const supportInteractionsByIntentData =
        useDownloadSupportInteractionsByIntentData()
    const supportInteractionsTimeSeriesData =
        useDownloadSupportInteractionsTimeSeriesData()
    const channelPerformanceData =
        useDownloadSupportAgentChannelPerformanceData()
    const intentPerformanceData = useDownloadIntentPerformanceData()

    const isLoading =
        isKpiLoading ||
        supportInteractionsByIntentData.isLoading ||
        supportInteractionsTimeSeriesData.isLoading ||
        channelPerformanceData.isLoading ||
        intentPerformanceData.isLoading

    const files = useMemo(
        () => ({
            ...trendCardsFiles,
            ...supportInteractionsByIntentData.files,
            ...supportInteractionsTimeSeriesData.files,
            ...channelPerformanceData.files,
            ...intentPerformanceData.files,
        }),
        [
            trendCardsFiles,
            supportInteractionsByIntentData.files,
            supportInteractionsTimeSeriesData.files,
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
