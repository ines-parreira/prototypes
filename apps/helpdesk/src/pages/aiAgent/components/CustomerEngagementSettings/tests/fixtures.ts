import type { TimeSeriesDataItem } from 'domains/reporting/hooks/useTimeSeries'

// First data point is 2025-04-10, so 25 days ago
// Multiplier -> 365 / 25 = 14.6
// Estimated influenced yearly GMV ->  701 * 0.03 * 14.6 = ~307.04
// Lower impact -> 307.04 * 0.8 = ~245.63 (rounded to 250)
// Upper impact -> 307.04 * 1.2 = ~368.45 (rounded to 370)
export const monthlyData: TimeSeriesDataItem[] = [
    {
        dateTime: '2025-04-07T00:00:00.000',
        value: 0,
    },
    {
        dateTime: '2025-04-08T00:00:00.000',
        value: 0,
    },
    {
        dateTime: '2025-04-09T00:00:00.000',
        value: 0,
    },
    {
        dateTime: '2025-04-10T00:00:00.000',
        value: 160,
    },
    {
        dateTime: '2025-04-11T00:00:00.000',
        value: 58,
    },
    {
        dateTime: '2025-04-12T00:00:00.000',
        value: 10,
    },
    {
        dateTime: '2025-04-13T00:00:00.000',
        value: 0,
    },
    {
        dateTime: '2025-04-14T00:00:00.000',
        value: 58,
    },
    {
        dateTime: '2025-04-15T00:00:00.000',
        value: 0,
    },
    {
        dateTime: '2025-04-16T00:00:00.000',
        value: 0,
    },
    {
        dateTime: '2025-04-17T00:00:00.000',
        value: 0,
    },
    {
        dateTime: '2025-04-18T00:00:00.000',
        value: 85,
    },
    {
        dateTime: '2025-04-19T00:00:00.000',
        value: 0,
    },
    {
        dateTime: '2025-04-20T00:00:00.000',
        value: 0,
    },
    {
        dateTime: '2025-04-21T00:00:00.000',
        value: 58,
    },
    {
        dateTime: '2025-04-22T00:00:00.000',
        value: 0,
    },
    {
        dateTime: '2025-04-23T00:00:00.000',
        value: 0,
    },
    {
        dateTime: '2025-04-24T00:00:00.000',
        value: 44,
    },
    {
        dateTime: '2025-04-25T00:00:00.000',
        value: 160,
    },
    {
        dateTime: '2025-04-26T00:00:00.000',
        value: 0,
    },
    {
        dateTime: '2025-04-27T00:00:00.000',
        value: 10,
    },
    {
        dateTime: '2025-04-28T00:00:00.000',
        value: 10,
    },
    {
        dateTime: '2025-04-29T00:00:00.000',
        value: 0,
    },
    {
        dateTime: '2025-04-30T00:00:00.000',
        value: 0,
    },
    {
        dateTime: '2025-05-01T00:00:00.000',
        value: 48,
    },
    {
        dateTime: '2025-05-02T00:00:00.000',
        value: 0,
    },
    {
        dateTime: '2025-05-03T00:00:00.000',
        value: 0,
    },
    {
        dateTime: '2025-05-04T00:00:00.000',
        value: 0,
    },
    {
        dateTime: '2025-05-05T00:00:00.000',
        value: 0,
    },
]

export const zeroData: TimeSeriesDataItem[] = [
    {
        dateTime: '2025-04-28T00:00:00.000',
        value: 0,
    },
    {
        dateTime: '2025-04-29T00:00:00.000',
        value: 0,
    },
    {
        dateTime: '2025-04-30T00:00:00.000',
        value: 0,
    },
    {
        dateTime: '2025-05-01T00:00:00.000',
        value: 0,
    },
    {
        dateTime: '2025-05-02T00:00:00.000',
        value: 0,
    },
    {
        dateTime: '2025-05-03T00:00:00.000',
        value: 0,
    },
    {
        dateTime: '2025-05-04T00:00:00.000',
        value: 0,
    },
    {
        dateTime: '2025-05-05T00:00:00.000',
        value: 0,
    },
]

export const nearZeroData: TimeSeriesDataItem[] = [
    {
        dateTime: '2025-04-28T00:00:00.000',
        value: 0,
    },
    {
        dateTime: '2025-04-29T00:00:00.000',
        value: 0,
    },
    {
        dateTime: '2025-04-30T00:00:00.000',
        value: 0,
    },
    {
        dateTime: '2025-05-01T00:00:00.000',
        value: 10,
    },
    {
        dateTime: '2025-05-02T00:00:00.000',
        value: 0,
    },
    {
        dateTime: '2025-05-03T00:00:00.000',
        value: 0,
    },
    {
        dateTime: '2025-05-04T00:00:00.000',
        value: 0,
    },
    {
        dateTime: '2025-05-05T00:00:00.000',
        value: 0,
    },
]

export const lessThanAWeekData: TimeSeriesDataItem[] = [
    {
        dateTime: '2025-04-28T00:00:00.000',
        value: 0,
    },
    {
        dateTime: '2025-04-29T00:00:00.000',
        value: 158,
    },
    {
        dateTime: '2025-04-30T00:00:00.000',
        value: 0,
    },
    {
        dateTime: '2025-05-01T00:00:00.000',
        value: 0,
    },
    {
        dateTime: '2025-05-02T00:00:00.000',
        value: 0,
    },
    {
        dateTime: '2025-05-03T00:00:00.000',
        value: 0,
    },
    {
        dateTime: '2025-05-04T00:00:00.000',
        value: 0,
    },
    {
        dateTime: '2025-05-05T00:00:00.000',
        value: 10,
    },
]
