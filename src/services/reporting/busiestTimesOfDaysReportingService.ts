import moment from 'moment/moment'
import {Period} from 'models/stat/types'
import {
    DayOfWeek,
    HOUR_COLUMN,
} from 'pages/stats/support-performance/busiest-times-of-days/types'
import {
    BTODData,
    get24Hours,
    hourFromHourIndex,
} from 'pages/stats/support-performance/busiest-times-of-days/utils'
import {createCsv, saveZippedFiles} from 'utils/file'
import {DATE_TIME_FORMAT} from 'services/reporting/constants'

const turnIntoArray = (data: BTODData): unknown[][] => {
    const daysOfWeek: DayOfWeek[] = Object.values(DayOfWeek)
    const hours = get24Hours()
    const columnLabels = [HOUR_COLUMN, ...daysOfWeek]

    const resultData = hours.map((hour) => [
        hourFromHourIndex(hour),
        ...daysOfWeek.map((day) => data[hour][day]),
    ])

    return [[...columnLabels], ...resultData]
}

const BTOD_REPORT_FILENAME = 'busiest-times-of-days'

export const saveReport = async (data: BTODData, period?: Period) => {
    const btodData = turnIntoArray(data)

    const export_datetime = moment().format(DATE_TIME_FORMAT)
    const startDate = moment(period?.start_datetime).format(DATE_TIME_FORMAT)
    const endDate = moment(period?.end_datetime).format(DATE_TIME_FORMAT)
    const periodPrefix = `${startDate}_${endDate}`

    return saveZippedFiles(
        {
            [`${periodPrefix}-${BTOD_REPORT_FILENAME}-${export_datetime}.csv`]:
                createCsv(btodData),
        },
        `${periodPrefix}-${BTOD_REPORT_FILENAME}-${export_datetime}`
    )
}
