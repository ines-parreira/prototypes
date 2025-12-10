import { useMemo } from 'react'

import { stripEscapedQuotes } from 'domains/reporting/hooks/common/utils'
import { useStatsFilters } from 'domains/reporting/hooks/support-performance/useStatsFilters'
import type { MetricWithDecileData } from 'domains/reporting/hooks/useMetricPerDimension'
import { useMetricPerDimensionV2 } from 'domains/reporting/hooks/useMetricPerDimension'
import {
    TicketCustomFieldsDimension,
    TicketCustomFieldsMeasure,
} from 'domains/reporting/models/cubes/TicketCustomFieldsCube'
import { customFieldsTicketCountWithSortQueryFactory } from 'domains/reporting/models/queryFactories/ticket-insights/customFieldsTicketCount'
import {
    ticketFieldsCountPerFieldValueQueryV2Factory,
    withCustomFieldIdAndProductSetFilter,
} from 'domains/reporting/models/scopes/ticketFields'
import { TicketTimeReference } from 'domains/reporting/models/stat/types'
import { getPreviousPeriod } from 'domains/reporting/utils/reporting'
import type { OrderDirection } from 'models/api/types'

const INTENT_VALUE = TicketCustomFieldsDimension.TicketCustomFieldsValue
const TICKET_COUNT_VALUE =
    TicketCustomFieldsMeasure.TicketCustomFieldsTicketCount

export const formatTicketCountData = (
    data: MetricWithDecileData<string>,
    previousPeriodData: MetricWithDecileData<string>,
) => {
    const ticketCountField =
        data?.measures?.find(
            (item) => item === TICKET_COUNT_VALUE || item === 'ticketCount',
        ) || TICKET_COUNT_VALUE
    const customFieldValueField =
        data?.dimensions?.find(
            (item) => item === INTENT_VALUE || item === 'customFieldValue',
        ) || INTENT_VALUE
    return (
        data?.allData.map((item) => {
            const previousPeriodItem = previousPeriodData?.allData?.find(
                (previousPeriodItem) =>
                    previousPeriodItem[customFieldValueField] ===
                    item[customFieldValueField],
            )

            return {
                category: stripEscapedQuotes(item[customFieldValueField]),
                value: item[ticketCountField],
                prevValue: previousPeriodItem?.[ticketCountField],
            }
        }) || []
    )
}

export const useIntentTicketCountsAndDelta = (
    intentCustomFieldId: number,
    sorting: OrderDirection,
    sortingValue:
        | TicketCustomFieldsMeasure.TicketCustomFieldsTicketCount
        | TicketCustomFieldsDimension.TicketCustomFieldsValue,
) => {
    const { cleanStatsFilters, userTimezone } = useStatsFilters()

    const { data, isError, isFetching } = useMetricPerDimensionV2(
        customFieldsTicketCountWithSortQueryFactory(
            cleanStatsFilters,
            userTimezone,
            intentCustomFieldId,
            sorting,
            sortingValue,
        ),
        ticketFieldsCountPerFieldValueQueryV2Factory({
            filters: withCustomFieldIdAndProductSetFilter(
                cleanStatsFilters,
                TicketTimeReference.TaggedAt,
                intentCustomFieldId,
            ),
            timezone: userTimezone,
            sortDirection: sorting,
            sortBy:
                sortingValue ===
                TicketCustomFieldsMeasure.TicketCustomFieldsTicketCount
                    ? 'ticketCount'
                    : 'customFieldValue',
        }),
    )

    const {
        data: previousPeriodData,
        isFetching: isPreviousPeriodFetching,
        isError: isPreviousPeriodError,
    } = useMetricPerDimensionV2(
        customFieldsTicketCountWithSortQueryFactory(
            {
                ...cleanStatsFilters,
                period: getPreviousPeriod(cleanStatsFilters.period),
            },
            userTimezone,
            intentCustomFieldId,
            sorting,
            sortingValue,
        ),
        ticketFieldsCountPerFieldValueQueryV2Factory({
            filters: withCustomFieldIdAndProductSetFilter(
                {
                    ...cleanStatsFilters,
                    period: getPreviousPeriod(cleanStatsFilters.period),
                },
                TicketTimeReference.TaggedAt,
                intentCustomFieldId,
            ),
            timezone: userTimezone,
            sortDirection: sorting,
            sortBy:
                sortingValue ===
                TicketCustomFieldsMeasure.TicketCustomFieldsTicketCount
                    ? 'ticketCount'
                    : 'customFieldValue',
        }),
    )

    const formattedData = useMemo(
        () => formatTicketCountData(data, previousPeriodData),
        [data, previousPeriodData],
    )

    return {
        data: formattedData,
        isError: isError || isPreviousPeriodError,
        isFetching: isFetching || isPreviousPeriodFetching,
    }
}
