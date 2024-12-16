import moment from 'moment/moment'

import {TimeSeriesDataItem} from 'hooks/reporting/useTimeSeries'
import {Period} from 'models/stat/types'
import {
    CURRENT_PERIOD_LABEL,
    DATE_TIME_FORMAT,
    EMPTY_LABEL,
    NOT_AVAILABLE_LABEL,
    PREVIOUS_PERIOD_LABEL,
} from 'services/reporting/constants'
import {createCsv} from 'utils/file'

type TrendDataWithLabel = {
    label: string
    value: number | string | null | undefined
    prevValue: number | string | null | undefined
}

export interface TimeSeriesDataWithLabels {
    label: string
    data?: TimeSeriesDataItem[][]
}

const getTrendDataReport = (data: TrendDataWithLabel[]) => {
    return [
        [EMPTY_LABEL, CURRENT_PERIOD_LABEL, PREVIOUS_PERIOD_LABEL],
        ...data.map((row) => [row.label, row?.value, row?.prevValue]),
    ]
}

const getTicketVolumeData = (data: TimeSeriesDataWithLabels[]) => {
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

export const getFileNameWithDates = (period: Period, reportName: string) => {
    const export_datetime = moment().format(DATE_TIME_FORMAT)
    const startDate = moment(period.start_datetime).format(DATE_TIME_FORMAT)
    const endDate = moment(period.end_datetime).format(DATE_TIME_FORMAT)
    const periodPrefix = `${startDate}_${endDate}`

    return `${periodPrefix}-${reportName}-${export_datetime}`
}

export const createTimeSeriesReport = (
    timeSeriesData: TimeSeriesDataWithLabels[],
    period: Period,
    fileSuffix: string
) => {
    const ticketVolumeData = getTicketVolumeData(timeSeriesData)

    return {
        files: {
            [`${getFileNameWithDates(period, fileSuffix)}.csv`]:
                createCsv(ticketVolumeData),
        },
    }
}

export const createTrendReport = (
    data: TrendDataWithLabel[],
    period: Period,
    fileSuffix: string
) => {
    const reportData = getTrendDataReport(data)

    return {
        files: {
            [`${getFileNameWithDates(period, fileSuffix)}.csv`]:
                createCsv(reportData),
        },
    }
}
