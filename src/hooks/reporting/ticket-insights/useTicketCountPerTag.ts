import { useFlags } from 'launchdarkly-react-client-sdk'

import { FeatureFlagKey } from 'config/featureFlags'
import { useStatsFilters } from 'hooks/reporting/support-performance/useStatsFilters'
import { useTagResultsSelection } from 'hooks/reporting/tags/useTagResultsSelection'
import {
    filterTimeDataWithSelectedTags,
    formatAndOrderTagTimeSeries,
    getOverallTicketTotals,
    getTagWiseTicketTotals,
} from 'hooks/reporting/ticket-insights/helpers'
import { useTagsReportContext } from 'hooks/reporting/ticket-insights/useTagsReportContext'
import {
    Entity,
    useTicketTimeReference,
} from 'hooks/reporting/ticket-insights/useTicketTimeReference'
import {
    useTagsTicketCountTimeSeries,
    useTotalTaggedTicketCountTimeSeries,
} from 'hooks/reporting/timeSeries'
import { getPeriodDateTimes } from 'hooks/reporting/useTimeSeries'
import useAppDispatch from 'hooks/useAppDispatch'
import { setOrder } from 'state/ui/stats/tagsReportSlice'
import { getFilterDateRange } from 'utils/reporting'

export const useTicketCountPerTag = () => {
    const featureFlags = useFlags()
    const [tagResultsSelection] = useTagResultsSelection()

    const isReportingFilteringAndCalculationsTagsReportEnabled =
        !!featureFlags[
            FeatureFlagKey.ReportingFilteringAndCalculationsTagsReport
        ]

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
