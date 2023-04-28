import moment from 'moment'
import {CUBE_DATETIME_FORMAT} from 'pages/stats/revenue/clients/constants'

export const getDateRange = (startDate: string, endDate: string): string[] => {
    // `parseZone` is used to preserve the timezone offset
    const startDateDayStart = moment
        .parseZone(startDate)
        .startOf('day')
        .utc()
        .format(CUBE_DATETIME_FORMAT)
    const endDateDayEnd = moment
        .parseZone(endDate)
        .endOf('day')
        .utc()
        .format(CUBE_DATETIME_FORMAT)

    return [startDateDayStart, endDateDayEnd]
}
