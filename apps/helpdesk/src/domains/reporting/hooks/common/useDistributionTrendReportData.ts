import { useEffect, useState } from 'react'

import type { MetricPerDimensionFetch } from 'domains/reporting/hooks/distributions'
import type { StatsFilters } from 'domains/reporting/models/stat/types'
import type { MetricTrendFormat } from 'domains/reporting/pages/common/utils'
import { formatMetricValue } from 'domains/reporting/pages/common/utils'

export type LabelledData = {
    label: string
    value: number | null | undefined
}[]

export const formatPerDimensionTrendData = (
    current: LabelledData,
    previous: LabelledData,
    labelPrefix: string,
    metricFormat: MetricTrendFormat,
) =>
    current.map((dataPoint) => ({
        label: `${labelPrefix} - ${dataPoint.label}`,
        value: formatMetricValue(dataPoint.value, metricFormat),
        prevValue: formatMetricValue(
            previous.find((row) => row.label === dataPoint.label)?.value,
            metricFormat,
        ),
    }))

export const useDistributionTrendReportData = (
    cleanStatsFilters: StatsFilters,
    userTimezone: string,
    fetchDistributions?: {
        fetchCurrentDistribution: MetricPerDimensionFetch
        fetchPreviousDistribution: MetricPerDimensionFetch
        labelPrefix: string
        metricFormat: MetricTrendFormat
    },
) => {
    const [perDimensionData, setPerDimensionData] = useState<{
        isFetching: boolean
        data: {
            label: string
            value: string
            prevValue: string
        }[]
    }>({
        isFetching: true,
        data: [],
    })

    useEffect(() => {
        if (fetchDistributions) {
            void Promise.all([
                fetchDistributions.fetchCurrentDistribution(
                    cleanStatsFilters,
                    userTimezone,
                ),
                fetchDistributions.fetchPreviousDistribution(
                    cleanStatsFilters,
                    userTimezone,
                ),
            ])
                .then(([currentPerDimensionData, previousPerDimensionData]) => {
                    setPerDimensionData({
                        isFetching: false,
                        data: formatPerDimensionTrendData(
                            currentPerDimensionData.data,
                            previousPerDimensionData.data,
                            fetchDistributions.labelPrefix,
                            fetchDistributions.metricFormat,
                        ),
                    })
                })
                .catch(() =>
                    setPerDimensionData({ isFetching: false, data: [] }),
                )
        } else {
            setPerDimensionData({ isFetching: false, data: [] })
        }
    }, [cleanStatsFilters, fetchDistributions, userTimezone])

    return perDimensionData
}
