import type { MetricTrend } from '@repo/reporting'

export const useAutomationRateMetric = (): MetricTrend => {
    const currentRate = 32
    const previousRate = 30

    return {
        isFetching: false,
        isError: false,
        data: {
            label: 'Overall automation rate',
            value: currentRate,
            prevValue: previousRate,
        },
    }
}
