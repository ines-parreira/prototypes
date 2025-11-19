import { useMemo } from 'react'

import { stripEscapedQuotes } from 'domains/reporting/hooks/common/utils'
import { useStatsFilters } from 'domains/reporting/hooks/support-performance/useStatsFilters'
import type { MetricWithDecileData } from 'domains/reporting/hooks/useMetricPerDimension'
import { useMetricPerDimension } from 'domains/reporting/hooks/useMetricPerDimension'
import {
    TicketCustomFieldsDimension,
    TicketCustomFieldsMeasure,
} from 'domains/reporting/models/cubes/TicketCustomFieldsCube'
import { customFieldsTicketCountWithSortQueryFactory } from 'domains/reporting/models/queryFactories/ticket-insights/customFieldsTicketCount'
import { getPreviousPeriod } from 'domains/reporting/utils/reporting'
import type { OrderDirection } from 'models/api/types'

const INTENT_VALUE = TicketCustomFieldsDimension.TicketCustomFieldsValue
const TICKET_COUNT_VALUE =
    TicketCustomFieldsMeasure.TicketCustomFieldsTicketCount

export const formatTicketCountData = (
    data: MetricWithDecileData<string>,
    previousPeriodData: MetricWithDecileData<string>,
) => {
    return (
        data?.allData.map((item) => {
            const previousPeriodItem = previousPeriodData?.allData?.find(
                (previousPeriodItem) =>
                    previousPeriodItem[INTENT_VALUE] === item[INTENT_VALUE],
            )

            return {
                category: stripEscapedQuotes(item[INTENT_VALUE]),
                value: item[TICKET_COUNT_VALUE],
                prevValue: previousPeriodItem?.[TICKET_COUNT_VALUE],
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

    const { data, isError, isFetching } = useMetricPerDimension<string>(
        customFieldsTicketCountWithSortQueryFactory(
            cleanStatsFilters,
            userTimezone,
            intentCustomFieldId,
            sorting,
            sortingValue,
        ),
    )

    const {
        data: previousPeriodData,
        isFetching: isPreviousPeriodFetching,
        isError: isPreviousPeriodError,
    } = useMetricPerDimension<string>(
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
