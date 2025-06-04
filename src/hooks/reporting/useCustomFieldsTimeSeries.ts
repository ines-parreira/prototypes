import { useMemo } from 'react'

import _flatten from 'lodash/flatten'
import _fromPairs from 'lodash/fromPairs'
import _sortBy from 'lodash/sortBy'

import {
    useCustomFieldsForProductTicketCount,
    useCustomFieldsTicketCount,
} from 'hooks/reporting/metricsPerCustomField'
import { useStatsFilters } from 'hooks/reporting/support-performance/useStatsFilters'
import {
    useCustomFieldsTicketCountForProductTimeSeries,
    useCustomFieldsTicketCountTimeSeries,
} from 'hooks/reporting/timeSeries'
import { OrderDirection } from 'models/api/types'
import { TicketCustomFieldsDimension } from 'models/reporting/cubes/TicketCustomFieldsCube'
import { TICKET_CUSTOM_FIELDS_API_SEPARATOR } from 'models/reporting/queryFactories/utils'
import { TicketTimeReference } from 'models/stat/types'
import { TICKET_CUSTOM_FIELDS_NEW_SEPARATOR } from 'pages/stats/utils'

const DATASET_VISIBILITY_ITEMS = 3
const DEFAULT_TOP_AMOUNT = 10

export const useCustomFieldsTimeSeries = ({
    selectedCustomFieldId,
    ticketFieldsTicketTimeReference,
    topAmount = DEFAULT_TOP_AMOUNT,
    datasetVisibilityItems = DATASET_VISIBILITY_ITEMS,
}: {
    selectedCustomFieldId: number | null
    ticketFieldsTicketTimeReference?: TicketTimeReference
    topAmount?: number
    datasetVisibilityItems?: number
}) => {
    const { cleanStatsFilters, userTimezone, granularity } = useStatsFilters()

    const { data = {}, isFetching } = useCustomFieldsTicketCountTimeSeries(
        cleanStatsFilters,
        userTimezone,
        granularity,
        String(selectedCustomFieldId),
        OrderDirection.Desc,
        true,
        ticketFieldsTicketTimeReference,
    )

    const customFieldsTicketCount = useCustomFieldsTicketCount(
        cleanStatsFilters,
        userTimezone,
        String(selectedCustomFieldId),
        OrderDirection.Desc,
        ticketFieldsTicketTimeReference,
    )

    const sortedData = _fromPairs(
        _sortBy(Object.entries(data), ([key]) =>
            customFieldsTicketCount.data?.allData
                .map(
                    (v) =>
                        v[
                            TicketCustomFieldsDimension
                                .TicketCustomFieldsValueString
                        ],
                )
                .indexOf(key),
        ),
    )

    const topData = useMemo(
        () => _flatten(Object.values(sortedData)).slice(0, topAmount),
        [sortedData, topAmount],
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
                            TICKET_CUSTOM_FIELDS_API_SEPARATOR,
                        )
                        return subcategories[subcategories.length - 1]
                    })
                    .slice(0, topAmount),
                tooltips: Object.keys(sortedData).map((category) =>
                    category
                        ?.split(TICKET_CUSTOM_FIELDS_API_SEPARATOR)
                        .join(TICKET_CUSTOM_FIELDS_NEW_SEPARATOR),
                ),
            },
            legendDatasetVisibility: _fromPairs(
                topData.map((_, index) => [
                    index,
                    index < datasetVisibilityItems,
                ]),
            ),
        }),
        [
            sortedData,
            granularity,
            isFetching,
            topAmount,
            topData,
            datasetVisibilityItems,
        ],
    )
}

export const useCustomFieldsForProductTimeSeries = ({
    selectedCustomFieldId,
    topAmount = DEFAULT_TOP_AMOUNT,
    datasetVisibilityItems = DATASET_VISIBILITY_ITEMS,
    productId,
}: {
    selectedCustomFieldId: number | null
    topAmount?: number
    datasetVisibilityItems?: number
    productId: string
}) => {
    const { cleanStatsFilters, userTimezone, granularity } = useStatsFilters()

    const { data = {}, isFetching } =
        useCustomFieldsTicketCountForProductTimeSeries(
            cleanStatsFilters,
            userTimezone,
            granularity,
            String(selectedCustomFieldId),
            productId,
            OrderDirection.Desc,
            true,
        )

    const customFieldsTicketCount = useCustomFieldsForProductTicketCount(
        cleanStatsFilters,
        userTimezone,
        String(selectedCustomFieldId),
        productId,
        OrderDirection.Desc,
    )

    const sortedData = _fromPairs(
        _sortBy(Object.entries(data), ([key]) =>
            customFieldsTicketCount.data?.allData
                .map(
                    (v) =>
                        v[
                            TicketCustomFieldsDimension
                                .TicketCustomFieldsValueString
                        ],
                )
                .indexOf(key),
        ),
    )

    const topData = useMemo(
        () => _flatten(Object.values(sortedData)).slice(0, topAmount),
        [sortedData, topAmount],
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
                            TICKET_CUSTOM_FIELDS_API_SEPARATOR,
                        )
                        return subcategories[subcategories.length - 1]
                    })
                    .slice(0, topAmount),
                tooltips: Object.keys(sortedData).map((category) =>
                    category
                        ?.split(TICKET_CUSTOM_FIELDS_API_SEPARATOR)
                        .join(TICKET_CUSTOM_FIELDS_NEW_SEPARATOR),
                ),
            },
            legendDatasetVisibility: _fromPairs(
                topData.map((_, index) => [
                    index,
                    index < datasetVisibilityItems,
                ]),
            ),
        }),
        [
            sortedData,
            granularity,
            isFetching,
            topAmount,
            topData,
            datasetVisibilityItems,
        ],
    )
}
