import {useDispatch} from 'react-redux'

import useAppSelector from 'hooks/useAppSelector'
import {opposite} from 'models/api/types'
import {
    isExtraLargeScreen,
    isMediumOrSmallScreen,
} from 'pages/common/utils/mobile'
import {MetricValueFormat} from 'pages/stats/common/utils'
import {TooltipData} from 'pages/stats/types'
import {
    DEFAULT_SORTING_DIRECTION,
    sortingSet,
    getIntentSorting,
} from 'state/ui/stats/insightsSlice'

import {IntentTableColumn} from './types'

export const TableColumnsOrder: IntentTableColumn[] = [
    IntentTableColumn.IntentName,
    IntentTableColumn.AutomationOpportunities,
    IntentTableColumn.Tickets,
    IntentTableColumn.AutomationRate,
    IntentTableColumn.AvgCustomerSatisfaction,
    IntentTableColumn.Resources,
]

export const TableLabels: Record<IntentTableColumn, string> = {
    [IntentTableColumn.IntentName]: 'Intent',
    [IntentTableColumn.AutomationOpportunities]: 'Automation opportunities',
    [IntentTableColumn.Tickets]: 'Tickets',
    [IntentTableColumn.AutomationRate]: 'Automation rate',
    [IntentTableColumn.AvgCustomerSatisfaction]: 'AVG CSAT',
    [IntentTableColumn.Resources]: 'Resources',
}

export const IntentsColumnsConfig: Partial<
    Record<
        IntentTableColumn,
        {
            format: MetricValueFormat
            hint: TooltipData | null
            perAgent: boolean
        }
    >
> = {
    [IntentTableColumn.AutomationOpportunities]: {
        format: 'percent',
        hint: {
            title: 'Estimated potential to improve your automation rate, based on the potential uplift between your current automation rate and the ticket volume of the intent. ',
        },
        perAgent: true,
    },
    [IntentTableColumn.Tickets]: {
        format: 'decimal',
        hint: null,
        perAgent: true,
    },
    [IntentTableColumn.AutomationRate]: {
        format: 'percent',
        hint: null,
        perAgent: true,
    },
    [IntentTableColumn.AvgCustomerSatisfaction]: {
        format: 'decimal',
        hint: null,
        perAgent: true,
    },
    [IntentTableColumn.Resources]: {
        format: 'decimal',
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

export const IntentRowConfig: Partial<
    Record<IntentTableColumn, {hint: TooltipData | null}>
> = {
    [IntentTableColumn.AutomationRate]: {
        hint: {
            title: 'Industry average for this intent: 14%',
        },
    },
}

export function useIntentSoringQuery(column: IntentTableColumn) {
    const dispatch = useDispatch()
    const sorting = useAppSelector(getIntentSorting)

    return {
        sortCallback: () => {
            dispatch(
                sortingSet({
                    field: column,
                    direction:
                        sorting.field === column
                            ? opposite(sorting.direction)
                            : DEFAULT_SORTING_DIRECTION,
                })
            )
        },
        direction: sorting.direction,
        field: sorting.field,
        isOrderedBy: column === sorting.field,
    }
}
