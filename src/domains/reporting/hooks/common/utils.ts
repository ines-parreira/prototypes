import moment from 'moment/moment'

import { Period } from 'domains/reporting/models/stat/types'
import { DATE_TIME_FORMAT } from 'domains/reporting/services/constants'

export const getCsvFileNameWithDates = (period: Period, reportName: string) => {
    const export_datetime = moment().format(DATE_TIME_FORMAT)
    const startDate = moment(period.start_datetime).format(DATE_TIME_FORMAT)
    const endDate = moment(period.end_datetime).format(DATE_TIME_FORMAT)
    const periodPrefix = `${startDate}_${endDate}`

    return `${periodPrefix}-${reportName}-${export_datetime}.csv`
}

export const stripEscapedQuotes = (str: string | null) => {
    if (str === null) return null
    return str.replace(/^"/, '').replace(/"$/, '')
}
