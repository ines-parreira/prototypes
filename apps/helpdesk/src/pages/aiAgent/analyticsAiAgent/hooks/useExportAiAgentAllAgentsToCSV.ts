import { useCallback, useMemo } from 'react'

import { formatMetricValue } from '@repo/reporting'

import { getCsvFileNameWithDates } from 'domains/reporting/hooks/common/utils'
import { useStatsFilters } from 'domains/reporting/hooks/support-performance/useStatsFilters'
import { createCsv, saveZippedFiles } from 'utils/file'

import { useAiAgentAutomatedInteractionsMetric } from './useAiAgentAutomatedInteractionsMetric'
import { useAiAgentAutomationRateMetric } from './useAiAgentAutomationRateMetric'
import { useAiAgentTimeSavedMetric } from './useAiAgentTimeSavedMetric'
import { useDownloadAiAgentAutomationRateTimeSeriesData } from './useDownloadAiAgentAutomationRateTimeSeriesData'
import { useDownloadAutomatedInteractionsBySkillData } from './useDownloadAutomatedInteractionsBySkillData'
import { useDownloadChannelPerformanceData } from './useDownloadChannelPerformanceData'
import { useDownloadIntentPerformanceData } from './useDownloadIntentPerformanceData'
import { useTotalSalesMetric } from './useTotalSalesMetric'

const REPORT_NAME = 'ai-agent-all-agents'
const KPI_CARDS_FILE_NAME = 'kpi-cards'

export const useExportAiAgentAllAgentsToCSV = () => {
    const { cleanStatsFilters } = useStatsFilters()

    const automationRateMetric = useAiAgentAutomationRateMetric()
    const automatedInteractionsMetric = useAiAgentAutomatedInteractionsMetric()
    const totalSalesMetric = useTotalSalesMetric()
    const timeSavedMetric = useAiAgentTimeSavedMetric()

    const automatedInteractionsBySkillData =
        useDownloadAutomatedInteractionsBySkillData()
    const automationRateTimeSeriesData =
        useDownloadAiAgentAutomationRateTimeSeriesData()
    const channelPerformanceData = useDownloadChannelPerformanceData()
    const intentPerformanceData = useDownloadIntentPerformanceData()

    const isLoading =
        automationRateMetric.isFetching ||
        automatedInteractionsMetric.isFetching ||
        totalSalesMetric.isFetching ||
        timeSavedMetric.isFetching ||
        automatedInteractionsBySkillData.isLoading ||
        automationRateTimeSeriesData.isLoading ||
        channelPerformanceData.isLoading ||
        intentPerformanceData.isLoading

    const kpiCardsCsv = useMemo(() => {
        const csvData = [
            ['', 'current period', 'previous period'],
            [
                'Automation rate',
                formatMetricValue(
                    automationRateMetric.data?.value,
                    'decimal-to-percent',
                ),
                formatMetricValue(
                    automationRateMetric.data?.prevValue,
                    'decimal-to-percent',
                ),
            ],
            [
                'Automated interactions',
                formatMetricValue(
                    automatedInteractionsMetric.data?.value,
                    'integer',
                ),
                formatMetricValue(
                    automatedInteractionsMetric.data?.prevValue,
                    'integer',
                ),
            ],
            [
                'Total sales',
                formatMetricValue(totalSalesMetric.data?.value, 'currency'),
                formatMetricValue(totalSalesMetric.data?.prevValue, 'currency'),
            ],
            [
                'Time saved by agents',
                formatMetricValue(timeSavedMetric.data?.value, 'duration'),
                formatMetricValue(timeSavedMetric.data?.prevValue, 'duration'),
            ],
        ]
        return createCsv(csvData)
    }, [
        automationRateMetric.data,
        automatedInteractionsMetric.data,
        totalSalesMetric.data,
        timeSavedMetric.data,
    ])

    const kpiCardsFileName = getCsvFileNameWithDates(
        cleanStatsFilters.period,
        KPI_CARDS_FILE_NAME,
    )

    const files = useMemo(
        () => ({
            [kpiCardsFileName]: kpiCardsCsv,
            ...automatedInteractionsBySkillData.files,
            ...automationRateTimeSeriesData.files,
            ...channelPerformanceData.files,
            ...intentPerformanceData.files,
        }),
        [
            kpiCardsFileName,
            kpiCardsCsv,
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
