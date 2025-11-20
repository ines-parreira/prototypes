import type { MetricTrend } from '@repo/reporting'

export const useCostSavedMetric = (): MetricTrend => {
    const currentValue = 2400
    const previousValue = 2353

    return {
        isFetching: false,
        isError: false,
        data: {
            label: 'Cost saved',
            value: currentValue,
            prevValue: previousValue,
        },
    }
}
