import {useMemo} from 'react'
import _flatten from 'lodash/flatten'
import _fromPairs from 'lodash/fromPairs'

import useAppSelector from 'hooks/useAppSelector'
import {getCleanStatsFiltersWithTimezone} from 'state/ui/stats/agentPerformanceSlice'
import {getSelectedCustomFieldId} from 'state/ui/stats/ticketInsightsSlice'
import {useCustomFieldsTicketCountTimeSeries} from 'hooks/reporting/timeSeries'
import {OrderDirection} from 'models/api/types'
import {periodToReportingGranularity} from 'utils/reporting'
import {
    TICKET_CUSTOM_FIELDS_NEW_SEPARATOR,
    TICKET_CUSTOM_FIELDS_API_SEPARATOR,
} from 'pages/stats/utils'

const DATASET_VISIBILITY_ITEMS = 3

export const useTicketsFieldTrend = (topAmount = 10) => {
    const {cleanStatsFilters, userTimezone} = useAppSelector(
        getCleanStatsFiltersWithTimezone
    )
    const selectedCustomFieldId = useAppSelector(getSelectedCustomFieldId)
    const granularity = periodToReportingGranularity(cleanStatsFilters.period)

    const {data = {}, isFetching} = useCustomFieldsTicketCountTimeSeries(
        cleanStatsFilters,
        userTimezone,
        granularity,
        String(selectedCustomFieldId),
        OrderDirection.Desc
    )

    const topData = useMemo(
        () => _flatten(Object.values(data)).slice(0, topAmount),
        [data, topAmount]
    )

    return useMemo(
        () => ({
            isFetching,
            granularity,
            data: _flatten(Object.values(data)).slice(0, topAmount),
            legendInfo: {
                labels: Object.keys(data)
                    .map((category) => {
                        const subcategories = String(category).split(
                            TICKET_CUSTOM_FIELDS_API_SEPARATOR
                        )
                        return subcategories[subcategories.length - 1]
                    })
                    .slice(0, topAmount),
                tooltips: Object.keys(data).map((category) =>
                    category
                        ?.split(TICKET_CUSTOM_FIELDS_API_SEPARATOR)
                        .join(TICKET_CUSTOM_FIELDS_NEW_SEPARATOR)
                ),
            },
            legendDatasetVisibility: _fromPairs(
                topData.map((_, index) => [
                    index,
                    index < DATASET_VISIBILITY_ITEMS,
                ])
            ),
        }),
        [data, granularity, isFetching, topAmount, topData]
    )
}
