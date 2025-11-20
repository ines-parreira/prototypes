import type { MetricTrend } from '@repo/reporting'

export const useTimeSavedMetric = (): MetricTrend => {
    const valueInSeconds = 19800
    const prevValueInSeconds = 19400

    return {
        isFetching: false,
        isError: false,
        data: {
            label: 'Time saved by agents',
            value: valueInSeconds,
            prevValue: prevValueInSeconds,
        },
    }
}
