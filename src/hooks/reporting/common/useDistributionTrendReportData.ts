import {useEffect, useState} from 'react'

import {MetricPerDimensionFetch} from 'hooks/reporting/distributions'
import {StatsFilters} from 'models/stat/types'

export type LabelledData = {
    label: string
    value: number | null | undefined
}[]

export const formatPerDimensionTrendData = (
    current: LabelledData,
    previous: LabelledData,
    labelPrefix: string
) =>
    current.map((dataPoint) => ({
        label: `${labelPrefix} - ${dataPoint.label}`,
        value: dataPoint.value,
        prevValue: previous.find((row) => row.label === dataPoint.label)?.value,
    }))

export const useDistributionTrendReportData = (
    cleanStatsFilters: StatsFilters,
    userTimezone: string,
    fetchDistributions?: {
        fetchCurrentDistribution: MetricPerDimensionFetch
        fetchPreviousDistribution: MetricPerDimensionFetch
        labelPrefix: string
    }
) => {
    const [perDimensionData, setPerDimensionData] = useState<{
        isFetching: boolean
        data: {
            label: string
            value: number | null | undefined
            prevValue: number | null | undefined
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
                    userTimezone
                ),
                fetchDistributions.fetchPreviousDistribution(
                    cleanStatsFilters,
                    userTimezone
                ),
            ])
                .then(([currentPerDimensionData, previousPerDimensionData]) => {
                    setPerDimensionData({
                        isFetching: false,
                        data: formatPerDimensionTrendData(
                            currentPerDimensionData.data,
                            previousPerDimensionData.data,
                            fetchDistributions.labelPrefix
                        ),
                    })
                })
                .catch(() => setPerDimensionData({isFetching: false, data: []}))
        } else {
            setPerDimensionData({isFetching: false, data: []})
        }
    }, [cleanStatsFilters, fetchDistributions, userTimezone])

    return perDimensionData
}
