import moment from 'moment/moment'

import { Period } from 'models/stat/types'
import { DATE_TIME_FORMAT } from 'services/reporting/constants'

export const getCsvFileNameWithDates = (period: Period, reportName: string) => {
    const export_datetime = moment().format(DATE_TIME_FORMAT)
    const startDate = moment(period.start_datetime).format(DATE_TIME_FORMAT)
    const endDate = moment(period.end_datetime).format(DATE_TIME_FORMAT)
    const periodPrefix = `${startDate}_${endDate}`

    return `${periodPrefix}-${reportName}-${export_datetime}.csv`
}
