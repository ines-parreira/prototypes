import { useCallback, useMemo } from 'react'

import { formatMetricValue } from '@repo/reporting'

import { getCsvFileNameWithDates } from 'domains/reporting/hooks/common/utils'
import { useStatsFilters } from 'domains/reporting/hooks/support-performance/useStatsFilters'
import { createCsv, saveZippedFiles } from 'utils/file'

import { useAutomatedInteractionsMetric } from './useAutomatedInteractionsMetric'
import { useAutomationRateMetric } from './useAutomationRateMetric'
import { useCostSavedMetric } from './useCostSavedMetric'
import { useDownloadAutomationRateByFeatureData } from './useDownloadAutomationRateByFeatureData'
import { useDownloadAutomationRateTimeSeriesData } from './useDownloadAutomationRateTimeSeriesData'
import { useDownloadPerformanceBreakdownData } from './useDownloadPerformanceBreakdownData'
import { useTimeSavedMetric } from './useTimeSavedMetric'

const REPORT_NAME = 'analytics-overview'
const KPI_CARDS_FILE_NAME = 'kpi-cards'

export const useExportAnalyticsOverviewToCSV = () => {
    const { cleanStatsFilters } = useStatsFilters()

    const automationRateMetric = useAutomationRateMetric()
    const automatedInteractionsMetric = useAutomatedInteractionsMetric()
    const timeSavedMetric = useTimeSavedMetric()
    const costSavedMetric = useCostSavedMetric()

    const performanceBreakdownData = useDownloadPerformanceBreakdownData()
    const automationRateByFeatureData = useDownloadAutomationRateByFeatureData()
    const automationRateTimeSeriesData =
        useDownloadAutomationRateTimeSeriesData()

    const isLoading =
        automationRateMetric.isFetching ||
        automatedInteractionsMetric.isFetching ||
        timeSavedMetric.isFetching ||
        costSavedMetric.isFetching ||
        performanceBreakdownData.isLoading ||
        automationRateByFeatureData.isLoading ||
        automationRateTimeSeriesData.isLoading

    const kpiCardsCsv = useMemo(() => {
        const csvData = [
            ['', 'current period', 'previous period'],
            [
                'Overall automation rate',
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
                'Time saved by agents',
                formatMetricValue(timeSavedMetric.data?.value, 'duration'),
                formatMetricValue(timeSavedMetric.data?.prevValue, 'duration'),
            ],
            [
                'Cost saved',
                formatMetricValue(costSavedMetric.data?.value, 'currency'),
                formatMetricValue(costSavedMetric.data?.prevValue, 'currency'),
            ],
        ]
        return createCsv(csvData)
    }, [
        automationRateMetric.data,
        automatedInteractionsMetric.data,
        timeSavedMetric.data,
        costSavedMetric.data,
    ])

    const kpiCardsFileName = getCsvFileNameWithDates(
        cleanStatsFilters.period,
        KPI_CARDS_FILE_NAME,
    )

    const files = useMemo(
        () => ({
            [kpiCardsFileName]: kpiCardsCsv,
            ...performanceBreakdownData.files,
            ...automationRateByFeatureData.files,
            ...automationRateTimeSeriesData.files,
        }),
        [
            kpiCardsFileName,
            kpiCardsCsv,
            performanceBreakdownData.files,
            automationRateByFeatureData.files,
            automationRateTimeSeriesData.files,
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
