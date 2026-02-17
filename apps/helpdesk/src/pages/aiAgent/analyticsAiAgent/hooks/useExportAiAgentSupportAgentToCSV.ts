import { useCallback, useMemo } from 'react'

import { formatMetricValue } from '@repo/reporting'
import { createCsv, saveZippedFiles } from '@repo/utils'

import { getCsvFileNameWithDates } from 'domains/reporting/hooks/common/utils'
import { useStatsFilters } from 'domains/reporting/hooks/support-performance/useStatsFilters'
import { useCostSavedMetric } from 'pages/aiAgent/analyticsOverview/hooks/useCostSavedMetric'

import { useAiAgentSupportInteractionsMetric } from './useAiAgentSupportInteractionsMetric'
import { useAiAgentTimeSavedMetric } from './useAiAgentTimeSavedMetric'
import { useDecreaseInFirstResponseTimeMetric } from './useDecreaseInFirstResponseTimeMetric'
import { useDownloadIntentPerformanceData } from './useDownloadIntentPerformanceData'
import { useDownloadSupportAgentChannelPerformanceData } from './useDownloadSupportAgentChannelPerformanceData'
import { useDownloadSupportInteractionsByIntentData } from './useDownloadSupportInteractionsByIntentData'
import { useDownloadSupportInteractionsTimeSeriesData } from './useDownloadSupportInteractionsTimeSeriesData'

const REPORT_NAME = 'ai-agent-support-agent'
const KPI_CARDS_FILE_NAME = 'kpi-cards'

export const useExportAiAgentSupportAgentToCSV = () => {
    const { cleanStatsFilters } = useStatsFilters()

    const timeSavedMetric = useAiAgentTimeSavedMetric()
    const costSavedMetric = useCostSavedMetric()
    const supportInteractionsMetric = useAiAgentSupportInteractionsMetric()
    const decreaseInFRTMetric = useDecreaseInFirstResponseTimeMetric()

    const supportInteractionsByIntentData =
        useDownloadSupportInteractionsByIntentData()
    const supportInteractionsTimeSeriesData =
        useDownloadSupportInteractionsTimeSeriesData()
    const channelPerformanceData =
        useDownloadSupportAgentChannelPerformanceData()
    const intentPerformanceData = useDownloadIntentPerformanceData()

    const isLoading =
        timeSavedMetric.isFetching ||
        costSavedMetric.isFetching ||
        supportInteractionsMetric.isFetching ||
        decreaseInFRTMetric.isFetching ||
        supportInteractionsByIntentData.isLoading ||
        supportInteractionsTimeSeriesData.isLoading ||
        channelPerformanceData.isLoading ||
        intentPerformanceData.isLoading

    const kpiCardsCsv = useMemo(() => {
        const csvData = [
            ['', 'current period', 'previous period'],
            [
                'Time saved by agents',
                formatMetricValue(timeSavedMetric.data?.value, 'duration'),
                formatMetricValue(timeSavedMetric.data?.prevValue, 'duration'),
            ],
            [
                'Cost saved',
                formatMetricValue(
                    costSavedMetric.data?.value,
                    'currency-precision-1',
                ),
                formatMetricValue(
                    costSavedMetric.data?.prevValue,
                    'currency-precision-1',
                ),
            ],
            [
                'Automated interactions',
                formatMetricValue(
                    supportInteractionsMetric.data?.value,
                    'decimal',
                ),
                formatMetricValue(
                    supportInteractionsMetric.data?.prevValue,
                    'decimal',
                ),
            ],
            [
                'Decrease in first response time',
                formatMetricValue(decreaseInFRTMetric.data?.value, 'duration'),
                formatMetricValue(
                    decreaseInFRTMetric.data?.prevValue,
                    'duration',
                ),
            ],
        ]
        return createCsv(csvData)
    }, [
        timeSavedMetric.data,
        costSavedMetric.data,
        supportInteractionsMetric.data,
        decreaseInFRTMetric.data,
    ])

    const kpiCardsFileName = getCsvFileNameWithDates(
        cleanStatsFilters.period,
        KPI_CARDS_FILE_NAME,
    )

    const files = useMemo(
        () => ({
            [kpiCardsFileName]: kpiCardsCsv,
            ...supportInteractionsByIntentData.files,
            ...supportInteractionsTimeSeriesData.files,
            ...channelPerformanceData.files,
            ...intentPerformanceData.files,
        }),
        [
            kpiCardsFileName,
            kpiCardsCsv,
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
