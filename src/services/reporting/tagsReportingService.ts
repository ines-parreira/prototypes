import { useCallback } from 'react'

import { Tag } from '@gorgias/api-queries'

import { logEvent, SegmentEvent } from 'common/segment'
import { getCsvFileNameWithDates } from 'hooks/reporting/common/utils'
import { useStatsFilters } from 'hooks/reporting/support-performance/useStatsFilters'
import { TagSelection } from 'hooks/reporting/tags/useTagResultsSelection'
import {
    formatAndOrderTagTimeSeries,
    getOverallTicketTotals,
    getTagName,
} from 'hooks/reporting/ticket-insights/helpers'
import { useTagsReportContext } from 'hooks/reporting/ticket-insights/useTagsReportContext'
import { filterTimeSeriesWithSelectedTags } from 'hooks/reporting/ticket-insights/useTagsTimeSeries'
import {
    fetchTagsTicketCountTimeSeries,
    fetchTotalTaggedTicketCountTimeSeries,
    useTagsTicketCountTimeSeries,
    useTotalTaggedTicketCountTimeSeries,
} from 'hooks/reporting/timeSeries'
import {
    getPeriodDateTimes,
    TimeSeriesDataItem,
    TimeSeriesPerDimension,
} from 'hooks/reporting/useTimeSeries'
import { ReportingGranularity } from 'models/reporting/types'
import { Period, StatsFilters } from 'models/stat/types'
import {
    getFormattedDelta,
    getFormattedPercentage,
} from 'pages/stats/common/utils'
import { formatDates } from 'pages/stats/utils'
import { TagsTableOrder } from 'state/ui/stats/tagsReportSlice'
import { createCsv, saveZippedFiles } from 'utils/file'
import { getFilterDateRange, getPreviousPeriod } from 'utils/reporting'

export const TAGS_REPORT_FILE_NAME = 'all-used-tags'

type TagsTicketCountTimeSeries = TimeSeriesPerDimension
type TotalTaggedTicketCountTimeSeries = TimeSeriesDataItem[][]

type Context = {
    tags: Record<string, Tag | undefined>
    tagsTableOrder: TagsTableOrder
    isExtendedReportingEnabled: boolean
    tagResultsSelection: TagSelection
}

enum Column {
    Delta = 'delta',
    Percentage = 'percentage',
    Tag = 'tag',
    Total = 'total',
}

const getTimeColumnLabel = (
    granularity: ReportingGranularity,
    dateTime: string,
) => {
    return formatDates(granularity, dateTime)
}

const getTimeColumnLabels = (
    period: Period,
    granularity: ReportingGranularity,
) => {
    const dateTimes = getPeriodDateTimes(
        getFilterDateRange(period),
        granularity,
    )

    return dateTimes.map((date) => getTimeColumnLabel(granularity, date))
}

const processData = (
    currentTagsTicketCountTimeSeries: TagsTicketCountTimeSeries,
    previousTagsTicketCountTimeSeries: TagsTicketCountTimeSeries,
    totalTaggedTicketCountTimeSeries: TotalTaggedTicketCountTimeSeries,
    granularity: ReportingGranularity,
    context: Context,
) => {
    const { grandTotal: totalTaggedTicketCount } = getOverallTicketTotals(
        totalTaggedTicketCountTimeSeries[0],
    )

    const currentFormattedData = formatAndOrderTagTimeSeries(
        currentTagsTicketCountTimeSeries,
        context,
    )

    const previousFormattedData = formatAndOrderTagTimeSeries(
        previousTagsTicketCountTimeSeries,
        context,
    )

    const processedData = currentFormattedData.map((item) => {
        const previousItem = previousFormattedData.find(
            (p) => p.tagId === item.tagId,
        )

        const entry: Record<string, string | number> = {
            [Column.Tag]: getTagName({ name: item.tag?.name, id: item.tagId }),
            [Column.Total]: item.total,
            [Column.Percentage]: getFormattedPercentage(
                item.total,
                totalTaggedTicketCount,
            ),
            [Column.Delta]: getFormattedDelta(item.total, previousItem?.total),
        }

        item.timeSeries.forEach((timeSeries) => {
            const timeColumnLabel = getTimeColumnLabel(
                granularity,
                timeSeries.dateTime,
            )

            entry[timeColumnLabel] = timeSeries.value
        })

        return entry
    })

    return processedData
}

type TableContents = (string | number)[][]

const convertToTable = (
    data: ReturnType<typeof processData>,
    columns: string[],
): TableContents => {
    const rows = data.map((item) => columns.map((column) => item[column]))
    return [columns, ...rows]
}

const createFile = (content: TableContents, fileName: string) => {
    return {
        fileName: fileName,
        files: { [fileName]: createCsv(content) },
    }
}

const createReport = (
    currentTagsTicketCountTimeSeries: TagsTicketCountTimeSeries,
    previousTagsTicketCountTimeSeries: TagsTicketCountTimeSeries,
    totalTaggedTicketCountTimeSeries: TotalTaggedTicketCountTimeSeries,
    statsFilters: StatsFilters,
    granularity: ReportingGranularity,
    context: Context,
) => {
    const currentFilteredTagsTicketCountTimeSeries =
        filterTimeSeriesWithSelectedTags({
            data: currentTagsTicketCountTimeSeries,
            tagResultsSelection: context.tagResultsSelection,
            statsFilters,
        })

    const previousFilteredTagsTicketCountTimeSeries =
        filterTimeSeriesWithSelectedTags({
            data: previousTagsTicketCountTimeSeries,
            tagResultsSelection: context.tagResultsSelection,
            statsFilters,
        })

    const processedData = processData(
        currentFilteredTagsTicketCountTimeSeries,
        previousFilteredTagsTicketCountTimeSeries,
        totalTaggedTicketCountTimeSeries,
        granularity,
        context,
    )

    const staticColumns: string[] = [Column.Tag, Column.Total]

    if (context.isExtendedReportingEnabled) {
        staticColumns.push(Column.Percentage, Column.Delta)
    }

    const timeColumns = getTimeColumnLabels(statsFilters.period, granularity)

    const columns = [...staticColumns, ...timeColumns]

    const fileContents = convertToTable(processedData, columns)

    const fileName = getCsvFileNameWithDates(
        statsFilters.period,
        TAGS_REPORT_FILE_NAME,
    )

    return createFile(fileContents, fileName)
}

const getPreviousStatsFilters = (statsFilters: StatsFilters) => ({
    ...statsFilters,
    period: getPreviousPeriod(statsFilters.period),
})

export const useTagsReportData = () => {
    const statsFilters = useStatsFilters()

    const currentTagsTicketCountTimeSeries = useTagsTicketCountTimeSeries(
        statsFilters.cleanStatsFilters,
        statsFilters.userTimezone,
        statsFilters.granularity,
    )

    const previousTagsTicketCountTimeSeries = useTagsTicketCountTimeSeries(
        getPreviousStatsFilters(statsFilters.cleanStatsFilters),
        statsFilters.userTimezone,
        statsFilters.granularity,
    )

    const totalTaggedTicketCountTimeSeries =
        useTotalTaggedTicketCountTimeSeries(
            statsFilters.cleanStatsFilters,
            statsFilters.userTimezone,
            statsFilters.granularity,
        )

    const context = useTagsReportContext()

    const report = createReport(
        currentTagsTicketCountTimeSeries.data || {},
        previousTagsTicketCountTimeSeries.data || {},
        totalTaggedTicketCountTimeSeries.data || [[]],
        statsFilters.cleanStatsFilters,
        statsFilters.granularity,
        context,
    )

    const isLoading =
        currentTagsTicketCountTimeSeries.isLoading ||
        previousTagsTicketCountTimeSeries.isLoading ||
        totalTaggedTicketCountTimeSeries.isLoading

    return { ...report, isLoading }
}

const fetchData = async (
    statsFilters: StatsFilters,
    userTimezone: string,
    granularity: ReportingGranularity,
) => {
    return await Promise.all([
        fetchTagsTicketCountTimeSeries(statsFilters, userTimezone, granularity),
        fetchTagsTicketCountTimeSeries(
            getPreviousStatsFilters(statsFilters),
            userTimezone,
            granularity,
        ),
        fetchTotalTaggedTicketCountTimeSeries(
            statsFilters,
            userTimezone,
            granularity,
        ),
    ])
}

export const fetchTagsReportData = async (
    statsFilters: StatsFilters,
    userTimezone: string,
    granularity: ReportingGranularity,
    context: {
        tags: Record<string, Tag | undefined>
        tagsTableOrder: TagsTableOrder
        isExtendedReportingEnabled: boolean
        tagResultsSelection: TagSelection
    },
) => {
    const [
        currentTagsTicketCountTimeSeries,
        previousTagsTicketCountTimeSeries,
        totalTaggedTicketCountTimeSeries,
    ] = await fetchData(statsFilters, userTimezone, granularity)

    const report = createReport(
        currentTagsTicketCountTimeSeries,
        previousTagsTicketCountTimeSeries,
        totalTaggedTicketCountTimeSeries,
        statsFilters,
        granularity,
        context,
    )

    return { ...report, isLoading: false }
}

export const useDownloadTagsReportData = () => {
    const { files, fileName, isLoading } = useTagsReportData()

    const download = useCallback(async () => {
        logEvent(SegmentEvent.StatDownloadClicked, {
            name: 'all-metrics',
        })

        await saveZippedFiles(files, fileName)
    }, [files, fileName])

    return { isLoading, download }
}
