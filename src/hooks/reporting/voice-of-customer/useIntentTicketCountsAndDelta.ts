import { useMemo } from 'react'

import { stripEscapedQuotes } from 'hooks/reporting/common/utils'
import { transformCategorySeparator } from 'hooks/reporting/helpers'
import { useStatsFilters } from 'hooks/reporting/support-performance/useStatsFilters'
import {
    MetricWithDecileData,
    useMetricPerDimension,
} from 'hooks/reporting/useMetricPerDimension'
import { OrderDirection } from 'models/api/types'
import {
    TicketCustomFieldsDimension,
    TicketCustomFieldsMeasure,
} from 'models/reporting/cubes/TicketCustomFieldsCube'
import { customFieldsTicketCountWithSortQueryFactory } from 'models/reporting/queryFactories/ticket-insights/customFieldsTicketCount'
import { getPreviousPeriod } from 'utils/reporting'

const INTENT_VALUE = TicketCustomFieldsDimension.TicketCustomFieldsValue
const TICKET_COUNT_VALUE =
    TicketCustomFieldsMeasure.TicketCustomFieldsTicketCount

export const formatTicketCountData = (
    data: MetricWithDecileData,
    previousPeriodData: MetricWithDecileData,
) => {
    return (
        data?.allData.map((item) => {
            const previousPeriodItem = previousPeriodData?.allData?.find(
                (previousPeriodItem) =>
                    previousPeriodItem[INTENT_VALUE] === item[INTENT_VALUE],
            )

            return {
                category: transformCategorySeparator(
                    stripEscapedQuotes(item[INTENT_VALUE]),
                ),

                value: item[TICKET_COUNT_VALUE],
                prevValue: previousPeriodItem?.[TICKET_COUNT_VALUE] || null,
            }
        }) || []
    )
}

export const useIntentTicketCountsAndDelta = (
    intentCustomFieldId: string,
    sorting: OrderDirection,
    sortingValue:
        | TicketCustomFieldsMeasure.TicketCustomFieldsTicketCount
        | TicketCustomFieldsDimension.TicketCustomFieldsValue,
) => {
    const { cleanStatsFilters, userTimezone } = useStatsFilters()

    const { data, isError, isFetching } = useMetricPerDimension(
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
    } = useMetricPerDimension(
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
