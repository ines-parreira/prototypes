import { useEffect } from 'react'

import { useStatsFilters } from 'hooks/reporting/support-performance/useStatsFilters'
import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import usePrevious from 'hooks/usePrevious'
import { opposite, OrderDirection } from 'models/api/types'
import { StatsFilters } from 'models/stat/types'
import { IntentTableColumn } from 'pages/aiAgent/insights/IntentTableWidget/types'
import {
    isExtraLargeScreen,
    isMediumOrSmallScreen,
} from 'pages/common/utils/mobile'
import { MetricValueFormat } from 'pages/stats/common/utils'
import { TooltipData } from 'pages/stats/types'
import {
    DEFAULT_SORTING_DIRECTION,
    getIntentSorting,
    sortingLoaded,
    sortingLoading,
    sortingSet,
} from 'state/ui/stats/insightsSlice'

export const TableColumnsOrder: IntentTableColumn[] = [
    IntentTableColumn.IntentName,
    IntentTableColumn.SuccessRateUpliftOpportunity,
    IntentTableColumn.Tickets,
    IntentTableColumn.SuccessRate,
    IntentTableColumn.AvgCustomerSatisfaction,
    // IntentTableColumn.Resources,
]

export const TableLabels: Record<IntentTableColumn, string> = {
    [IntentTableColumn.IntentName]: 'Intent',
    [IntentTableColumn.SuccessRateUpliftOpportunity]:
        'Success rate uplift opportunity',
    [IntentTableColumn.Tickets]: 'Tickets',
    [IntentTableColumn.SuccessRate]: 'Success Rate',
    [IntentTableColumn.AvgCustomerSatisfaction]: 'AVG CSAT',
    // [IntentTableColumn.Resources]: 'Resources',
}

export const CSAT_DRILL_DOWN_LABEL = 'Customer Satisfaction'

export const IntentsColumnsConfig: Partial<
    Record<
        IntentTableColumn,
        {
            format: MetricValueFormat
            hint: TooltipData | null
            perAgent: boolean
            notAvailableText?: string
        }
    >
> = {
    [IntentTableColumn.IntentName]: {
        format: 'decimal',
        hint: {
            title: 'The primary topic or issue identified by AI Agent in a ticket',
        },
        perAgent: false,
    },
    [IntentTableColumn.SuccessRateUpliftOpportunity]: {
        format: 'decimal-percent-to-integer-percent',
        hint: {
            title: `Estimated potential to improve your success rate, based on the number of tickets that haven't been automated. \nExample: If there are 100 total AI agent tickets and a given intent / topic has 15 tickets that have not been automated, the uplift opportunity is 15%.`,
        },
        perAgent: true,
        notAvailableText: '-',
    },
    [IntentTableColumn.Tickets]: {
        format: 'integer',
        hint: null,
        perAgent: true,
        notAvailableText: '-',
    },
    [IntentTableColumn.SuccessRate]: {
        format: 'decimal-percent-to-integer-percent',
        hint: null,
        perAgent: true,
        notAvailableText: '-',
    },
    [IntentTableColumn.AvgCustomerSatisfaction]: {
        format: 'decimal',
        hint: null,
        perAgent: true,
        notAvailableText: '-',
    },
    // [IntentTableColumn.Resources]: {
    //     format: 'integer',
    //     hint: {
    //         title: 'Number of unique Guidance, articles, URLs, external documents or Actions used to answer tickets in this intent',
    //     },
    //     perAgent: true,
    // },
}

export const INTENT_NAME_COLUMN_WIDTH = isExtraLargeScreen() ? 160 : 300
export const MOBILE_INTENT_NAME_COLUMN_WIDTH = 140
export const METRIC_COLUMN_WIDTH = 140
export const MOBILE_METRIC_COLUMN_WIDTH = 120
export const SUCCESS_RATE_UPLIFT_OPPORTUNITY_COLUMN_WIDTH = 160
export const MOBILE_SUCCESS_RATE_UPLIFT_OPPORTUNITY_COLUMN_WIDTH = 140

export const getColumnWidth = (column: IntentTableColumn) => {
    if (isMediumOrSmallScreen()) {
        switch (column) {
            case IntentTableColumn.SuccessRateUpliftOpportunity:
                return MOBILE_SUCCESS_RATE_UPLIFT_OPPORTUNITY_COLUMN_WIDTH
            case IntentTableColumn.IntentName:
                return MOBILE_INTENT_NAME_COLUMN_WIDTH
            default:
                return MOBILE_METRIC_COLUMN_WIDTH
        }
    }

    switch (column) {
        case IntentTableColumn.SuccessRateUpliftOpportunity:
            return SUCCESS_RATE_UPLIFT_OPPORTUNITY_COLUMN_WIDTH
        case IntentTableColumn.IntentName:
            return INTENT_NAME_COLUMN_WIDTH
        default:
            return METRIC_COLUMN_WIDTH
    }
}

export const getColumnContentAlignment = (column: IntentTableColumn) => {
    return column === IntentTableColumn.IntentName ? 'left' : 'right'
}

export const IntentRowConfig: Partial<
    Record<IntentTableColumn, { hint?: TooltipData | null }>
> = {
    // TODO we are hiding the hint for now, but we will need to add it back when the industry average feature is ready
    [IntentTableColumn.SuccessRate]: {},
}

export function useIntentSortingQuery(
    column: IntentTableColumn,
    useQuery: (
        filters: StatsFilters,
        timezone: string,
        shopName: string,
        sorting?: OrderDirection,
        intentId?: string,
        intentLevel?: number,
    ) => {
        data: any
        isFetching: boolean
    },
    shopName: string,
    intentId?: string,
    intentLevel?: number,
) {
    const dispatch = useAppDispatch()
    const sorting = useAppSelector(getIntentSorting)

    const { cleanStatsFilters, userTimezone } = useStatsFilters()

    const queryData = useQuery(
        cleanStatsFilters,
        userTimezone,
        shopName,
        sorting?.direction,
        intentId,
        intentLevel,
    )
    const isFetching = queryData?.isFetching
    const data = queryData?.data

    const prevIntentId = usePrevious(intentId)
    const prevIntentLevel = usePrevious(intentLevel)
    const prevShopName = usePrevious(shopName)

    const prevStartDatetime = usePrevious(
        cleanStatsFilters?.period?.start_datetime,
    )
    const prevEndDatetime = usePrevious(cleanStatsFilters?.period?.end_datetime)

    useEffect(() => {
        if (sorting?.field === column) {
            if (!sorting?.isLoading) {
                isFetching && dispatch(sortingLoading())
            } else {
                !isFetching && dispatch(sortingLoaded(data))
            }
        }
    }, [
        column,
        dispatch,
        data,
        sorting?.field,
        sorting?.isLoading,
        sorting?.direction,
        isFetching,
    ])

    useEffect(() => {
        if (
            prevIntentId !== intentId ||
            prevIntentLevel !== intentLevel ||
            prevStartDatetime !== cleanStatsFilters?.period?.start_datetime ||
            prevEndDatetime !== cleanStatsFilters?.period?.end_datetime ||
            prevShopName !== shopName
        ) {
            !isFetching && dispatch(sortingLoaded(data))
        }
    }, [
        intentId,
        intentLevel,
        isFetching,
        data,
        dispatch,
        prevIntentId,
        prevIntentLevel,
        prevStartDatetime,
        cleanStatsFilters?.period?.start_datetime,
        cleanStatsFilters?.period?.end_datetime,
        prevEndDatetime,
        prevShopName,
        shopName,
    ])

    return {
        sortCallback: () => {
            dispatch(
                sortingSet({
                    field: column,
                    direction:
                        sorting.field === column
                            ? opposite(sorting?.direction)
                            : DEFAULT_SORTING_DIRECTION,
                }),
            )
        },
        direction: sorting?.direction,
        field: sorting?.field,
        isOrderedBy: column === sorting?.field,
    }
}
