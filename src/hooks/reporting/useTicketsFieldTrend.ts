import _flatten from 'lodash/flatten'
import _fromPairs from 'lodash/fromPairs'
import _sortBy from 'lodash/sortBy'
import {useMemo} from 'react'

import {useCustomFieldsTicketCount} from 'hooks/reporting/metricsPerCustomField'

import {useNewStatsFilters} from 'hooks/reporting/support-performance/useNewStatsFilters'

import {useCustomFieldsTicketCountTimeSeries} from 'hooks/reporting/timeSeries'
import useAppSelector from 'hooks/useAppSelector'
import {OrderDirection} from 'models/api/types'
import {TicketCustomFieldsDimension} from 'models/reporting/cubes/TicketCustomFieldsCube'
import {TICKET_CUSTOM_FIELDS_API_SEPARATOR} from 'models/reporting/queryFactories/utils'
import {TICKET_CUSTOM_FIELDS_NEW_SEPARATOR} from 'pages/stats/utils'

import {getSelectedCustomField} from 'state/ui/stats/ticketInsightsSlice'

const DATASET_VISIBILITY_ITEMS = 3

export const useTicketsFieldTrend = (topAmount = 10) => {
    const {cleanStatsFilters, userTimezone, granularity} = useNewStatsFilters()
    const selectedCustomField = useAppSelector(getSelectedCustomField)

    const {data = {}, isFetching} = useCustomFieldsTicketCountTimeSeries(
        cleanStatsFilters,
        userTimezone,
        granularity,
        String(selectedCustomField.id),
        OrderDirection.Desc
    )

    const customFieldsTicketCount = useCustomFieldsTicketCount(
        cleanStatsFilters,
        userTimezone,
        String(selectedCustomField.id),
        OrderDirection.Desc
    )

    const sortedData = _fromPairs(
        _sortBy(Object.entries(data), ([key]) =>
            customFieldsTicketCount.data?.allData
                .map(
                    (v) =>
                        v[
                            TicketCustomFieldsDimension
                                .TicketCustomFieldsValueString
                        ]
                )
                .indexOf(key)
        )
    )

    const topData = useMemo(
        () => _flatten(Object.values(sortedData)).slice(0, topAmount),
        [sortedData, topAmount]
    )

    return useMemo(
        () => ({
            isFetching,
            granularity,
            data: topData,
            legendInfo: {
                labels: Object.keys(sortedData)
                    .map((category) => {
                        const subcategories = String(category).split(
                            TICKET_CUSTOM_FIELDS_API_SEPARATOR
                        )
                        return subcategories[subcategories.length - 1]
                    })
                    .slice(0, topAmount),
                tooltips: Object.keys(sortedData).map((category) =>
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
        [sortedData, granularity, isFetching, topAmount, topData]
    )
}
