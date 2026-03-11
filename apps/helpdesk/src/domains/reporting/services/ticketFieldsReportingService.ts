import { logEvent, SegmentEvent } from '@repo/logging'
import _flatten from 'lodash/flatten'
import _orderBy from 'lodash/orderBy'

import { getCsvFileNameWithDates } from 'domains/reporting/hooks/common/utils'
import { getPeriodDateTimes } from 'domains/reporting/hooks/helpers'
import { useStatsFilters } from 'domains/reporting/hooks/support-performance/useStatsFilters'
import {
    Entity,
    useTicketTimeReference,
} from 'domains/reporting/hooks/ticket-insights/useTicketTimeReference'
import {
    fetchCustomFieldsTicketCountTimeSeries,
    useCustomFieldsTicketCountTimeSeries,
} from 'domains/reporting/hooks/timeSeries'
import type { TimeSeriesDataItem } from 'domains/reporting/hooks/useTimeSeries'
import type {
    Period,
    StatsFilters,
    TicketTimeReference,
} from 'domains/reporting/models/stat/types'
import type { ReportingGranularity } from 'domains/reporting/models/types'
import { formatDates } from 'domains/reporting/pages/utils'
import type { TicketInsightsOrder } from 'domains/reporting/state/ui/stats/ticketInsightsSlice'
import { getCustomFieldsOrder } from 'domains/reporting/state/ui/stats/ticketInsightsSlice'
import { getFilterDateRange } from 'domains/reporting/utils/reporting'
import useAppSelector from 'hooks/useAppSelector'
import type { OrderDirection } from 'models/api/types'
import { createCsv, saveZippedFiles } from 'utils/file'

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
            const allLevels = Array<string>(MAX_LEVEL_DEPTH)
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

export const useCustomFieldsReportData = (selectedCustomFieldId: number) => {
    const {
        cleanStatsFilters: statsFilters,
        userTimezone,
        granularity,
    } = useStatsFilters()
    const customFieldsOrder = useAppSelector(getCustomFieldsOrder)

    const [ticketFieldsTicketTimeReference] = useTicketTimeReference(
        Entity.TicketField,
    )

    const { data: timeSeriesData, isLoading } =
        useCustomFieldsTicketCountTimeSeries(
            statsFilters,
            userTimezone,
            granularity,
            selectedCustomFieldId,
            undefined,
            ticketFieldsTicketTimeReference,
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
        selectedCustomFieldId: number | null
        ticketFieldsTicketTimeReference: TicketTimeReference
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
        undefined,
        context.ticketFieldsTicketTimeReference,
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
