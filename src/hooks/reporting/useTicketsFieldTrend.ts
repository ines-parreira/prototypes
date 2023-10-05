import _flatten from 'lodash/flatten'
import _fromPairs from 'lodash/fromPairs'
import {useMemo} from 'react'
import {useCustomFieldsTicketCountTimeSeries} from 'hooks/reporting/timeSeries'

import useAppSelector from 'hooks/useAppSelector'
import {OrderDirection} from 'models/api/types'
import {
    TICKET_CUSTOM_FIELDS_API_SEPARATOR,
    TICKET_CUSTOM_FIELDS_NEW_SEPARATOR,
} from 'pages/stats/utils'
import {getCleanStatsFiltersWithTimezone} from 'state/ui/stats/agentPerformanceSlice'
import {getSelectedCustomField} from 'state/ui/stats/ticketInsightsSlice'
import {periodToReportingGranularity} from 'utils/reporting'

const DATASET_VISIBILITY_ITEMS = 3

export const useTicketsFieldTrend = (topAmount = 10) => {
    const {cleanStatsFilters, userTimezone} = useAppSelector(
        getCleanStatsFiltersWithTimezone
    )
    const selectedCustomField = useAppSelector(getSelectedCustomField)
    const granularity = periodToReportingGranularity(cleanStatsFilters.period)

    const {data = {}, isFetching} = useCustomFieldsTicketCountTimeSeries(
        cleanStatsFilters,
        userTimezone,
        granularity,
        String(selectedCustomField.id),
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
