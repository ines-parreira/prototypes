import _flatten from 'lodash/flatten'
import _orderBy from 'lodash/orderBy'

import { logEvent, SegmentEvent } from 'common/segment'
import { getCsvFileNameWithDates } from 'hooks/reporting/common/utils'
import { useStatsFilters } from 'hooks/reporting/support-performance/useStatsFilters'
import {
    fetchCustomFieldsTicketCountTimeSeries,
    useCustomFieldsTicketCountTimeSeries,
} from 'hooks/reporting/timeSeries'
import {
    getPeriodDateTimes,
    TimeSeriesDataItem,
} from 'hooks/reporting/useTimeSeries'
import useAppSelector from 'hooks/useAppSelector'
import { OrderDirection } from 'models/api/types'
import { ReportingGranularity } from 'models/reporting/types'
import { Period, StatsFilters } from 'models/stat/types'
import { formatDates } from 'pages/stats/utils'
import {
    getCustomFieldsOrder,
    TicketInsightsOrder,
} from 'state/ui/stats/ticketInsightsSlice'
import { createCsv, saveZippedFiles } from 'utils/file'
import { getFilterDateRange } from 'utils/reporting'

export const TICKET_FIELDS_DOWNLOAD_FILE_NAME = 'ticket-fields'
export const LEVEL_LABELS = [
    'level 1',
    'level 2',
    'level 3',
    'level 4',
    'level 5',
]
const MAX_LEVEL_DEPTH = 5

const getFormattedDateTimes = (
    period: Period,
    granularity: ReportingGranularity,
) =>
    getPeriodDateTimes(getFilterDateRange(period), granularity).map((item) =>
        formatDates(granularity, item),
    )

export const formatData = (
    data: Record<string, TimeSeriesDataItem[][]> | undefined,
    dateTimes: string[],
    order?: OrderDirection,
) => [
    [...LEVEL_LABELS, ...dateTimes],
    ..._orderBy(
        Object.entries(data || {}).map(([key, timeSeries]) => {
            const levels = String(key).split('::')
            const allLevels = new Array<string>(MAX_LEVEL_DEPTH)
                .fill('')
                .map((value, index) => levels[index] || value)

            const timeSeriesValues = timeSeries.map((item) =>
                item.map(({ value }) => String(value)),
            )

            return _flatten([...allLevels, ...timeSeriesValues])
        }),
        (v) => [v[0], v[1]],
        order,
    ),
]

export const useCustomFieldsReportData = (selectedCustomFieldId: string) => {
    const {
        cleanStatsFilters: statsFilters,
        userTimezone,
        granularity,
    } = useStatsFilters()
    const customFieldsOrder = useAppSelector(getCustomFieldsOrder)

    const { data: timeSeriesData, isLoading } =
        useCustomFieldsTicketCountTimeSeries(
            statsFilters,
            userTimezone,
            granularity,
            String(selectedCustomFieldId),
        )
    const dateTimes = getFormattedDateTimes(statsFilters.period, granularity)

    const ticketFieldsData = formatData(
        timeSeriesData,
        dateTimes,
        customFieldsOrder.direction,
    )

    const fileName = getCsvFileNameWithDates(
        statsFilters.period,
        TICKET_FIELDS_DOWNLOAD_FILE_NAME,
    )

    const files = {
        [fileName]: createCsv(ticketFieldsData),
    }

    const download = async () => {
        logEvent(SegmentEvent.StatDownloadClicked, {
            name: 'all-metrics',
        })

        await saveZippedFiles(files, fileName)
    }

    return {
        download,
        isLoading,
    }
}

export const fetchCustomFieldsReportData = async (
    statsFilters: StatsFilters,
    userTimezone: string,
    granularity: ReportingGranularity,
    context: {
        customFieldsOrder: TicketInsightsOrder
        selectedCustomFieldId: string | null
    },
): Promise<{
    isLoading: boolean
    fileName: string
    files: Record<string, string>
}> => {
    const dateTimes = getFormattedDateTimes(statsFilters.period, granularity)
    const fileName = getCsvFileNameWithDates(
        statsFilters.period,
        TICKET_FIELDS_DOWNLOAD_FILE_NAME,
    )

    if (context.selectedCustomFieldId === null) {
        return Promise.resolve({ isLoading: false, fileName, files: {} })
    }

    return fetchCustomFieldsTicketCountTimeSeries(
        statsFilters,
        userTimezone,
        granularity,
        context.selectedCustomFieldId,
    )
        .then((result) => ({
            isLoading: false,
            fileName,
            files: {
                [fileName]: createCsv(
                    formatData(
                        result,
                        dateTimes,
                        context.customFieldsOrder.direction,
                    ),
                ),
            },
        }))
        .catch(() => ({ isLoading: false, fileName, files: {} }))
}
