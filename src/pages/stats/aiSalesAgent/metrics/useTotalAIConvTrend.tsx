/* eslint-disable @typescript-eslint/no-unused-vars */
import { useQuery } from '@tanstack/react-query'

import { type MetricTrend } from 'hooks/reporting/useMetricTrend'
import { StatsFilters } from 'models/stat/types'
import { getRealisticResponseTime } from 'pages/aiAgent/Overview/getRealisticResponseTime'

const useTotalAIConvTrend = (
    filters: StatsFilters,
    timezone: string,
): MetricTrend => {
    // TODO: replace with Cube hook
    const result = useQuery({
        queryKey: ['useTotalAIConvTrend'],
        queryFn: (): Promise<{ value: number; prevValue: number }> =>
            new Promise((resolve) => {
                setTimeout(() => {
                    resolve({ value: 32.41, prevValue: 24.56 })
                }, getRealisticResponseTime())
            }),
    })

    return {
        // make response compatibile with MetricTrend type
        data: {
            value: result.data?.value || null,
            prevValue: result.data?.prevValue || null,
        },
        isFetching: result.isLoading,
        isError: false,
    }
}

const fetchTotalAIConvTrend = (
    filters: StatsFilters,
    timezone: string,
): Promise<MetricTrend> => {
    return Promise.resolve({
        data: {
            value: 32.41,
            prevValue: 24.56,
        },
        isFetching: false,
        isError: false,
    })
}

export { useTotalAIConvTrend, fetchTotalAIConvTrend }
