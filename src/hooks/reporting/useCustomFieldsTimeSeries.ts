import { useMemo } from 'react'

import { Dictionary } from 'lodash'
import _flatten from 'lodash/flatten'
import _fromPairs from 'lodash/fromPairs'
import _sortBy from 'lodash/sortBy'

import { transformCategoriesSeparator } from 'hooks/reporting/helpers'
import {
    useCustomFieldsForProductTicketCount,
    useCustomFieldsTicketCount,
} from 'hooks/reporting/metricsPerCustomField'
import { useStatsFilters } from 'hooks/reporting/support-performance/useStatsFilters'
import {
    useCustomFieldsTicketCountForProductTimeSeries,
    useCustomFieldsTicketCountTimeSeries,
    useSentimentsCustomFieldsTicketCountTimeSeries,
} from 'hooks/reporting/timeSeries'
import { Sentiments } from 'hooks/reporting/types'
import { TimeSeriesDataItem } from 'hooks/reporting/useTimeSeries'
import { OrderDirection } from 'models/api/types'
import { TicketCustomFieldsDimension } from 'models/reporting/cubes/TicketCustomFieldsCube'
import { TICKET_CUSTOM_FIELDS_API_SEPARATOR } from 'models/reporting/queryFactories/utils'
import { TicketTimeReference } from 'models/stat/types'
import { formatTimeSeries, getFormat } from 'pages/stats/common/utils'
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

    const sortedData: Dictionary<TimeSeriesDataItem[][]> = _fromPairs(
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
                tooltips: transformCategoriesSeparator(Object.keys(sortedData)),
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

export const useSentimentsCustomFieldsTimeSeries = ({
    sentimentCustomFieldId,
    sentimentValueStrings,
}: {
    sentimentCustomFieldId: number | null
    sentimentValueStrings: Sentiments[]
}) => {
    const { cleanStatsFilters, userTimezone, granularity } = useStatsFilters()

    const {
        data = {},
        isFetching,
        isError,
    } = useSentimentsCustomFieldsTicketCountTimeSeries(
        cleanStatsFilters,
        userTimezone,
        granularity,
        String(sentimentCustomFieldId),
        sentimentValueStrings,
        OrderDirection.Desc,
        true,
    )

    const format = getFormat(granularity)

    const formattedData = useMemo(() => {
        return Object.keys(data).length
            ? sentimentValueStrings.map((sentiment) => {
                  const items: TimeSeriesDataItem[] = _flatten(data[sentiment])
                  return formatTimeSeries(sentiment, items, format)
              })
            : []
    }, [data, format, sentimentValueStrings])

    return {
        isFetching,
        isError,
        data: formattedData,
    }
}
