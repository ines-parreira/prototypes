import { FeatureFlagKey, useFlag } from '@repo/feature-flags'

import { useStatsFilters } from 'domains/reporting/hooks/support-performance/useStatsFilters'
import { useTagResultsSelection } from 'domains/reporting/hooks/tags/useTagResultsSelection'
import {
    filterTimeDataWithSelectedTags,
    formatAndOrderTagTimeSeries,
    getOverallTicketTotals,
    getTagWiseTicketTotals,
} from 'domains/reporting/hooks/ticket-insights/helpers'
import { useTagsReportContext } from 'domains/reporting/hooks/ticket-insights/useTagsReportContext'
import {
    Entity,
    useTicketTimeReference,
} from 'domains/reporting/hooks/ticket-insights/useTicketTimeReference'
import {
    useTagsTicketCountTimeSeries,
    useTotalTaggedTicketCountTimeSeries,
} from 'domains/reporting/hooks/timeSeries'
import { getPeriodDateTimes } from 'domains/reporting/hooks/useTimeSeries'
import { setOrder } from 'domains/reporting/state/ui/stats/tagsReportSlice'
import { getFilterDateRange } from 'domains/reporting/utils/reporting'
import useAppDispatch from 'hooks/useAppDispatch'

export const useTicketCountPerTag = () => {
    const isReportingFilteringAndCalculationsTagsReportEnabled = useFlag(
        FeatureFlagKey.ReportingFilteringAndCalculationsTagsReport,
    )
    const [tagResultsSelection] = useTagResultsSelection()

    const dispatch = useAppDispatch()

    const { cleanStatsFilters, userTimezone, granularity } = useStatsFilters()

    const tagsReportContext = useTagsReportContext()

    const [tagTicketTimeReference] = useTicketTimeReference(Entity.Tag)

    const totalTaggedTicketCountTimeSeries =
        useTotalTaggedTicketCountTimeSeries(
            cleanStatsFilters,
            userTimezone,
            granularity,
            undefined,
            tagTicketTimeReference,
        )

    const tagsTicketTimeCountTimeSeries = useTagsTicketCountTimeSeries(
        cleanStatsFilters,
        userTimezone,
        granularity,
        undefined,
        tagTicketTimeReference,
    )

    const dateTimes = getPeriodDateTimes(
        getFilterDateRange(cleanStatsFilters.period),
        granularity,
    )

    const formattedTimeData = formatAndOrderTagTimeSeries(
        tagsTicketTimeCountTimeSeries.data,
        tagsReportContext,
    )

    const timeData = filterTimeDataWithSelectedTags({
        data: formattedTimeData,
        statsFilters: cleanStatsFilters,
        tagResultsSelection,
    })

    const totals = isReportingFilteringAndCalculationsTagsReportEnabled
        ? getOverallTicketTotals(
              totalTaggedTicketCountTimeSeries.data?.[0] || [],
          )
        : getTagWiseTicketTotals(timeData)

    const setOrdering = (column: 'tag' | 'total' | number) => {
        dispatch(setOrder({ column }))
    }

    const isLoading =
        tagsTicketTimeCountTimeSeries.isLoading ||
        totalTaggedTicketCountTimeSeries.isLoading

    return {
        data: timeData,
        columnTotals: totals.columnTotals,
        grandTotal: totals.grandTotal,
        dateTimes,
        isLoading,
        order: tagsReportContext.tagsTableOrder,
        setOrdering,
        cleanStatsFilters,
        granularity,
    }
}
