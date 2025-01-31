import {Tag} from '@gorgias/api-queries'

import {getCsvFileNameWithDates} from 'hooks/reporting/support-performance/overview/useDownloadOverviewData'

import {
    FormattedDataItem,
    getFormattedDataWithTotals,
    useTicketCountPerTag,
} from 'hooks/reporting/ticket-insights/useTicketCountPerTag'
import {fetchTagsTicketCountTimeSeries} from 'hooks/reporting/timeSeries'
import {getPeriodDateTimes} from 'hooks/reporting/useTimeSeries'
import {ReportingGranularity} from 'models/reporting/types'
import {Period, StatsFilters} from 'models/stat/types'
import {formatDates} from 'pages/stats/utils'
import {TagsTableOrder} from 'state/ui/stats/tagsReportSlice'
import {createCsv} from 'utils/file'
import {getFilterDateRange} from 'utils/reporting'

export const TAGS_REPORT_FILE_NAME = 'all-used-tags'

const getTagsTabularData = (data: FormattedDataItem[], dateTimes: string[]) => {
    const labelsRow = ['tag', 'total', ...dateTimes]
    const dataRows = data.map((row) => [
        row.tag?.name ?? row.tagId,
        row.total,
        ...row.timeSeries.map((item) => item.value),
    ])

    return [labelsRow, ...dataRows]
}

export const createReport = (
    data: FormattedDataItem[],
    dateTimes: string[],
    period: Period,
    granularity: ReportingGranularity
) => {
    const formattedDateTimes = dateTimes.map((item) =>
        formatDates(granularity, item)
    )
    const tagsData = getTagsTabularData(data, formattedDateTimes)
    const fileName = getCsvFileNameWithDates(period, TAGS_REPORT_FILE_NAME)

    return {
        files: {
            [fileName]: createCsv(tagsData),
        },
        fileName: fileName,
    }
}

export const useTagsReportData = () => {
    const {
        data: ticketCountPerTagData,
        dateTimes,
        isLoading,
        cleanStatsFilters,
        granularity,
    } = useTicketCountPerTag()

    const report = createReport(
        ticketCountPerTagData,
        dateTimes,
        cleanStatsFilters.period,
        granularity
    )

    return {
        ...report,
        isLoading,
    }
}

export const fetchTagsReportData = async (
    statsFilters: StatsFilters,
    userTimezone: string,
    granularity: ReportingGranularity,
    context: {
        tags: Record<string, Tag | undefined>
        tagsTableOrder: TagsTableOrder
    }
) => {
    const dateTimes = getPeriodDateTimes(
        getFilterDateRange(statsFilters.period),
        granularity
    )

    return fetchTagsTicketCountTimeSeries(
        statsFilters,
        userTimezone,
        granularity
    ).then((result) => ({
        ...createReport(
            getFormattedDataWithTotals(
                result,
                context.tags,
                context.tagsTableOrder
            ).data,
            dateTimes,
            statsFilters.period,
            granularity
        ),
        isLoading: false,
    }))
}
