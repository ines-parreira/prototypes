import moment from 'moment'

import {FormattedDataItem} from 'hooks/reporting/ticket-insights/useTicketCountPerTag'
import {Period} from 'models/stat/types'
import {DATE_TIME_FORMAT} from 'services/reporting/constants'
import {createCsv, saveZippedFiles} from 'utils/file'

const getTagsTabularData = (data: FormattedDataItem[], dateTimes: string[]) => {
    const labelsRow = ['tag', 'total', ...dateTimes]
    const dataRows = data.map((row) => [
        row.tag?.name ?? row.tagId,
        row.total,
        ...row.timeSeries.map((item) => item.value),
    ])

    return [labelsRow, ...dataRows]
}

export const saveReport = async (
    data: FormattedDataItem[],
    dateTimes: string[],
    period: Period
) => {
    const tagsData = getTagsTabularData(data, dateTimes)
    const export_datetime = moment().format(DATE_TIME_FORMAT)
    const startDate = moment(period.start_datetime).format(DATE_TIME_FORMAT)
    const endDate = moment(period.end_datetime).format(DATE_TIME_FORMAT)
    const periodPrefix = `${startDate}_${endDate}`

    return saveZippedFiles(
        {
            [`${periodPrefix}-all-used-tags-${export_datetime}.csv`]:
                createCsv(tagsData),
        },
        `${periodPrefix}-all-used-tags-${export_datetime}`
    )
}
