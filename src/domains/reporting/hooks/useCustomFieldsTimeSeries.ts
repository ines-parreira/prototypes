import { useMemo } from 'react'

import { Dictionary } from 'lodash'
import _flatten from 'lodash/flatten'
import _fromPairs from 'lodash/fromPairs'
import _sortBy from 'lodash/sortBy'

import { transformCategoriesSeparator } from 'domains/reporting/hooks/helpers'
import {
    useCustomFieldsForProductTicketCount,
    useCustomFieldsTicketCount,
} from 'domains/reporting/hooks/metricsPerCustomField'
import { useStatsFilters } from 'domains/reporting/hooks/support-performance/useStatsFilters'
import {
    useAIIntentCustomFieldsTicketCountTimeSeries,
    useCustomFieldsTicketCountForProductTimeSeries,
    useCustomFieldsTicketCountTimeSeries,
    useSentimentsCustomFieldsTicketCountTimeSeries,
} from 'domains/reporting/hooks/timeSeries'
import { MetricWithDecile } from 'domains/reporting/hooks/useMetricPerDimension'
import { TimeSeriesDataItem } from 'domains/reporting/hooks/useTimeSeries'
import { TicketCustomFieldsDimension } from 'domains/reporting/models/cubes/TicketCustomFieldsCube'
import { TICKET_CUSTOM_FIELDS_API_SEPARATOR } from 'domains/reporting/models/queryFactories/utils'
import {
    Sentiment,
    TicketTimeReference,
} from 'domains/reporting/models/stat/types'
import {
    formatTimeSeries,
    getFormat,
} from 'domains/reporting/pages/common/utils'
import { TICKET_CUSTOM_FIELDS_NEW_SEPARATOR } from 'domains/reporting/pages/utils'
import { OrderDirection } from 'models/api/types'

const DATASET_VISIBILITY_ITEMS = 3
const DEFAULT_TOP_AMOUNT = 10

type CustomFieldsTimeSeriesProps = {
    selectedCustomFieldId: number
    ticketFieldsTicketTimeReference?: TicketTimeReference
    topAmount?: number
    datasetVisibilityItems?: number
}

const formatCustomFieldsTimeSeries = (
    data: Record<string, TimeSeriesDataItem[][]>,
    customFieldsTicketCount: MetricWithDecile,
    topAmount: number,
    datasetVisibilityItems: number,
) => {
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

    const topData = _flatten(Object.values(sortedData)).slice(0, topAmount)

    return {
        topData,
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
            topData.map((_, index) => [index, index < datasetVisibilityItems]),
        ),
    }
}

export const useCustomFieldsTimeSeries = ({
    selectedCustomFieldId,
    ticketFieldsTicketTimeReference,
    topAmount = DEFAULT_TOP_AMOUNT,
    datasetVisibilityItems = DATASET_VISIBILITY_ITEMS,
}: CustomFieldsTimeSeriesProps) => {
    const { cleanStatsFilters, userTimezone, granularity } = useStatsFilters()

    const { data = {}, isFetching } = useCustomFieldsTicketCountTimeSeries(
        cleanStatsFilters,
        userTimezone,
        granularity,
        selectedCustomFieldId,
        OrderDirection.Desc,
        ticketFieldsTicketTimeReference,
    )

    const customFieldsTicketCount = useCustomFieldsTicketCount(
        cleanStatsFilters,
        userTimezone,
        selectedCustomFieldId,
        OrderDirection.Desc,
        ticketFieldsTicketTimeReference,
    )

    const { topData, legendInfo, legendDatasetVisibility } = useMemo(
        () =>
            formatCustomFieldsTimeSeries(
                data,
                customFieldsTicketCount,
                topAmount,
                datasetVisibilityItems,
            ),
        [data, customFieldsTicketCount, topAmount, datasetVisibilityItems],
    )

    return useMemo(
        () => ({
            isFetching,
            granularity,
            data: topData,
            legendInfo,
            legendDatasetVisibility,
        }),
        [granularity, isFetching, topData, legendInfo, legendDatasetVisibility],
    )
}

export const useAIIntentCustomFieldsTimeSeries = ({
    selectedCustomFieldId,
    ticketFieldsTicketTimeReference,
    topAmount = DEFAULT_TOP_AMOUNT,
    datasetVisibilityItems = DATASET_VISIBILITY_ITEMS,
}: CustomFieldsTimeSeriesProps) => {
    const { cleanStatsFilters, userTimezone, granularity } = useStatsFilters()

    const { data = {}, isFetching } =
        useAIIntentCustomFieldsTicketCountTimeSeries(
            cleanStatsFilters,
            userTimezone,
            granularity,
            selectedCustomFieldId,
            OrderDirection.Desc,
        )

    const customFieldsTicketCount = useCustomFieldsTicketCount(
        cleanStatsFilters,
        userTimezone,
        selectedCustomFieldId,
        OrderDirection.Desc,
        ticketFieldsTicketTimeReference,
    )

    const { topData, legendInfo, legendDatasetVisibility } = useMemo(
        () =>
            formatCustomFieldsTimeSeries(
                data,
                customFieldsTicketCount,
                topAmount,
                datasetVisibilityItems,
            ),
        [data, customFieldsTicketCount, topAmount, datasetVisibilityItems],
    )

    return useMemo(
        () => ({
            isFetching,
            granularity,
            data: topData,
            legendInfo,
            legendDatasetVisibility,
        }),
        [granularity, isFetching, topData, legendInfo, legendDatasetVisibility],
    )
}

export const useCustomFieldsForProductTimeSeries = ({
    selectedCustomFieldId,
    topAmount = DEFAULT_TOP_AMOUNT,
    datasetVisibilityItems = DATASET_VISIBILITY_ITEMS,
    productId,
}: {
    selectedCustomFieldId: number
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
            selectedCustomFieldId,
            productId,
            OrderDirection.Desc,
        )

    const customFieldsTicketCount = useCustomFieldsForProductTicketCount(
        cleanStatsFilters,
        userTimezone,
        selectedCustomFieldId,
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
    sentimentCustomFieldId: number
    sentimentValueStrings: Sentiment[]
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
        sentimentCustomFieldId,
        sentimentValueStrings,
        OrderDirection.Desc,
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
