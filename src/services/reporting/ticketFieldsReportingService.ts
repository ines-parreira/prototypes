import _flatten from 'lodash/flatten'
import _orderBy from 'lodash/orderBy'
import moment from 'moment/moment'

import {TimeSeriesDataItem} from 'hooks/reporting/useTimeSeries'
import {OrderDirection} from 'models/api/types'
import {Period} from 'models/stat/types'
import {createCsv, saveZippedFiles} from 'utils/file'

import {DATE_TIME_FORMAT} from './constants'

const MAX_LEVEL_DEPTH = 5

export const getData = (
    data: Record<string, TimeSeriesDataItem[][]> | undefined,
    dateTimes: string[],
    order?: OrderDirection
) => [
    ['level 1', 'level 2', 'level 3', 'level 4', 'level 5', ...dateTimes],
    ..._orderBy(
        Object.entries(data || {}).map(([key, timeSeries]) => {
            const levels = String(key).split('::')
            const allLevels = new Array<string>(MAX_LEVEL_DEPTH)
                .fill('')
                .map((value, index) => levels[index] || value)

            const timeSeriesValues = timeSeries.map((item) =>
                item.map(({value}) => String(value))
            )

            return _flatten([...allLevels, ...timeSeriesValues])
        }),
        (v) => [v[0], v[1]],
        order
    ),
]

export const saveReport = async (
    data: Record<string, TimeSeriesDataItem[][]> | undefined,
    dateTimes: string[],
    period?: Period,
    order?: OrderDirection
) => {
    const ticketFieldsData = getData(data, dateTimes, order)

    const export_datetime = moment().format(DATE_TIME_FORMAT)
    const startDate = moment(period?.start_datetime).format(DATE_TIME_FORMAT)
    const endDate = moment(period?.end_datetime).format(DATE_TIME_FORMAT)
    const periodPrefix = `${startDate}_${endDate}`

    return saveZippedFiles(
        {
            [`${periodPrefix}-ticket-fields-${export_datetime}.csv`]:
                createCsv(ticketFieldsData),
        },
        `${periodPrefix}-ticket-fields-${export_datetime}`
    )
}
