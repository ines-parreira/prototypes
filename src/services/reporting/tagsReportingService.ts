import { useCallback } from 'react'

import { Tag } from '@gorgias/api-queries'

import { logEvent, SegmentEvent } from 'common/segment'
import { getCsvFileNameWithDates } from 'hooks/reporting/common/utils'
import {
    FormattedDataItem,
    getFormattedData,
    useTicketCountPerTag,
} from 'hooks/reporting/ticket-insights/useTicketCountPerTag'
import { fetchTagsTicketCountTimeSeries } from 'hooks/reporting/timeSeries'
import { getPeriodDateTimes } from 'hooks/reporting/useTimeSeries'
import { ReportingGranularity } from 'models/reporting/types'
import { Period, StatsFilters } from 'models/stat/types'
import { getTagName } from 'pages/stats/ticket-insights/tags/helpers'
import { formatDates } from 'pages/stats/utils'
import { TagsTableOrder } from 'state/ui/stats/tagsReportSlice'
import { createCsv, saveZippedFiles } from 'utils/file'
import { getFilterDateRange } from 'utils/reporting'

export const TAGS_REPORT_FILE_NAME = 'all-used-tags'

const getTagsTabularData = (data: FormattedDataItem[], dateTimes: string[]) => {
    const labelsRow = ['tag', 'total', ...dateTimes]
    const dataRows = data.map((row) => [
        getTagName({ name: row.tag?.name, id: row.tagId }),
        row.total,
        ...row.timeSeries.map((item) => item.value),
    ])

    return [labelsRow, ...dataRows]
}

export const createReport = (
    data: FormattedDataItem[],
    dateTimes: string[],
    period: Period,
    granularity: ReportingGranularity,
) => {
    const formattedDateTimes = dateTimes.map((item) =>
        formatDates(granularity, item),
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
        granularity,
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
    },
) => {
    const dateTimes = getPeriodDateTimes(
        getFilterDateRange(statsFilters.period),
        granularity,
    )

    return fetchTagsTicketCountTimeSeries(
        statsFilters,
        userTimezone,
        granularity,
    ).then((result) => ({
        ...createReport(
            getFormattedData(result, context.tags, context.tagsTableOrder),
            dateTimes,
            statsFilters.period,
            granularity,
        ),
        isLoading: false,
    }))
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
