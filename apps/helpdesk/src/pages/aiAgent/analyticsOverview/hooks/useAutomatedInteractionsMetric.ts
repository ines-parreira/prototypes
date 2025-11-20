import type { MetricTrend } from '@repo/reporting'

export const useAutomatedInteractionsMetric = (): MetricTrend => {
    const currentValue = 4800
    const previousValue = 4896

    return {
        isFetching: false,
        isError: false,
        data: {
            label: 'Automated interactions',
            value: currentValue,
            prevValue: previousValue,
        },
    }
}
