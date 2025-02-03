import {TimeSeriesDataItem} from 'hooks/reporting/useTimeSeries'
import {formatMetricValue} from 'pages/stats/common/utils'
import {
    CURRENT_PERIOD_LABEL,
    EMPTY_LABEL,
    NOT_AVAILABLE_LABEL,
    PREVIOUS_PERIOD_LABEL,
} from 'services/reporting/constants'
import {createCsv} from 'utils/file'

export type TrendDataWithLabel = {
    label: string
    value: number | null | undefined
    prevValue: number | null | undefined
}

export interface TimeSeriesDataWithLabels {
    label: string
    data?: TimeSeriesDataItem[][]
}

const getTrendDataReport = (data: TrendDataWithLabel[]) => {
    return [
        [EMPTY_LABEL, CURRENT_PERIOD_LABEL, PREVIOUS_PERIOD_LABEL],
        ...data.map((row) => [
            row.label,
            formatMetricValue(row?.value),
            formatMetricValue(row?.prevValue),
        ]),
    ]
}

const getTimeSeriesDataReport = (data: TimeSeriesDataWithLabels[]) => {
    const dates = data[0]?.data?.[0].map((r) => r.dateTime) || []

    return [
        [EMPTY_LABEL, ...data.map((d) => d.label)],
        ...dates.map((date) => [
            date,
            ...data.map(
                (d) =>
                    d.data?.[0].find(({dateTime}) => date === dateTime)
                        ?.value || NOT_AVAILABLE_LABEL
            ),
        ]),
    ]
}

export const createTimeSeriesReport = (
    data: TimeSeriesDataWithLabels[],
    fileName: string
) => {
    if (data.length === 0) {
        return {files: {}}
    }

    const ticketVolumeData = getTimeSeriesDataReport(data)

    return {
        files: {
            [fileName]: createCsv(ticketVolumeData),
        },
    }
}

export const createTrendReport = (
    data: TrendDataWithLabel[],
    fileName: string
) => {
    if (data.length === 0) {
        return {files: {}}
    }
    const reportData = getTrendDataReport(data)

    return {
        files: {
            [fileName]: createCsv(reportData),
        },
    }
}
