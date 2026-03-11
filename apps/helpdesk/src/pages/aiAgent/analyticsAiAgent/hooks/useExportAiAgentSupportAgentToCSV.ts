import { useCallback, useMemo } from 'react'

import { FeatureFlagKey, useFlag } from '@repo/feature-flags'

import { getCsvFileNameWithDates } from 'domains/reporting/hooks/common/utils'
import { useDashboardData } from 'domains/reporting/hooks/dashboards/useDashboardData'
import { useStatsFilters } from 'domains/reporting/hooks/support-performance/useStatsFilters'
import { AnalyticsAiAgentSupportAgentReportConfig } from 'pages/aiAgent/analyticsAiAgent/AnalyticsAiAgentSupportAgentReportConfig'
import { buildCustomDashboard } from 'pages/aiAgent/analyticsOverview/utils/buildCustomDashboard'
import { saveZippedFiles } from 'utils/file'

import { ANALYTICS_AI_AGENT_SUPPORT_AGENT_LAYOUT } from '../config/aiAgentSupportAgentLayoutConfig'
import { useDownloadIntentPerformanceData } from './useDownloadIntentPerformanceData'
import { useDownloadSupportAgentChannelPerformanceData } from './useDownloadSupportAgentChannelPerformanceData'
import { useDownloadSupportInteractionsByIntentData } from './useDownloadSupportInteractionsByIntentData'
import { useDownloadSupportInteractionsTimeSeriesData } from './useDownloadSupportInteractionsTimeSeriesData'

const REPORT_NAME = 'ai-agent-support-agent'

export const useExportAiAgentSupportAgentToCSV = () => {
    const isAnalyticsDashboardsTrendCardsEnabled = useFlag(
        FeatureFlagKey.AiAgentAnalyticsDashboardsTrendCards,
    )
    const { cleanStatsFilters } = useStatsFilters()

    const supportAgentDashboard = useMemo(
        () =>
            buildCustomDashboard(
                REPORT_NAME,
                ANALYTICS_AI_AGENT_SUPPORT_AGENT_LAYOUT,
                isAnalyticsDashboardsTrendCardsEnabled,
            ),
        [isAnalyticsDashboardsTrendCardsEnabled],
    )

    const { files: trendCardsFiles, isLoading: isKpiLoading } =
        useDashboardData(
            supportAgentDashboard,
            true,
            AnalyticsAiAgentSupportAgentReportConfig.charts,
        )

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
