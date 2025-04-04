import { useEffect } from 'react'

// eslint-disable-next-line no-restricted-imports
import { useDispatch } from 'react-redux'

import { useStatsFilters } from 'hooks/reporting/support-performance/useStatsFilters'
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
    IntentTableColumn.AutomationOpportunities,
    IntentTableColumn.Tickets,
    IntentTableColumn.SuccessRate,
    IntentTableColumn.AvgCustomerSatisfaction,
    IntentTableColumn.Resources,
]

export const TableLabels: Record<IntentTableColumn, string> = {
    [IntentTableColumn.IntentName]: 'Intent',
    [IntentTableColumn.AutomationOpportunities]: 'Automation opportunity',
    [IntentTableColumn.Tickets]: 'Tickets',
    [IntentTableColumn.SuccessRate]: 'Success Rate',
    [IntentTableColumn.AvgCustomerSatisfaction]: 'AVG CSAT',
    [IntentTableColumn.Resources]: 'Resources',
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
    [IntentTableColumn.AutomationOpportunities]: {
        format: 'decimal-percent-to-integer-percent',
        hint: {
            title: 'Estimated potential to improve your success rate, base on the potential uplift between your current success rate and the ticket volume of the intent.',
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
    [IntentTableColumn.Resources]: {
        format: 'integer',
        hint: {
            title: 'Number of unique Guidance, articles, URLs, external documents or Actions used to answer tickets in this intent',
        },
        perAgent: true,
    },
}

export const INTENT_NAME_COLUMN_WIDTH = isExtraLargeScreen() ? 160 : 300
export const MOBILE_INTENT_NAME_COLUMN_WIDTH = 140
export const METRIC_COLUMN_WIDTH = 140
export const MOBILE_METRIC_COLUMN_WIDTH = 120

export const getColumnWidth = (column: IntentTableColumn) => {
    if (isMediumOrSmallScreen()) {
        return column === IntentTableColumn.IntentName
            ? MOBILE_INTENT_NAME_COLUMN_WIDTH
            : MOBILE_METRIC_COLUMN_WIDTH
    }
    return column === IntentTableColumn.IntentName
        ? INTENT_NAME_COLUMN_WIDTH
        : METRIC_COLUMN_WIDTH
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
    const dispatch = useDispatch()
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
