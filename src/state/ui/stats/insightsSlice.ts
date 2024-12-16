import {createSelector, createSlice, PayloadAction} from '@reduxjs/toolkit'

import {useDispatch} from 'react-redux'

import {ReportingMetricItem} from 'hooks/reporting/useMetricPerDimension'
import {OrderDirection} from 'models/api/types'
import {
    Intent,
    IntentTableColumn,
} from 'pages/automate/aiAgent/insights/IntentTableWidget/types'

import {RootState} from 'state/types'

import {INTENT_SLICE_NAME} from 'state/ui/stats/constants'

export type IntentSorting<T> = {
    field: T
    direction: OrderDirection
}

export type IntentState<T> = {
    sorting: IntentSorting<T> & {
        isLoading: boolean
        lastSortingMetric: Maybe<ReportingMetricItem[]>
    }
    pagination: {
        currentPage: number
        perPage: number
    }
}

export const DEFAULT_SORTING_DIRECTION = OrderDirection.Desc

export const INTENTS_PER_PAGE = 15

export const initialState: IntentState<IntentTableColumn> = {
    sorting: {
        field: IntentTableColumn.AutomationOpportunities,
        direction: OrderDirection.Desc,
        isLoading: true,
        lastSortingMetric: null,
    },
    pagination: {
        currentPage: 1,
        perPage: INTENTS_PER_PAGE,
    },
}

export const intentSlice = createSlice({
    name: INTENT_SLICE_NAME,
    initialState,
    reducers: {
        sortingSet(
            state,
            action: PayloadAction<IntentSorting<IntentTableColumn>>
        ) {
            state.sorting.field = action.payload.field
            state.sorting.direction = action.payload.direction
            state.sorting.isLoading = false
            state.pagination.currentPage = 1
        },
        sortingLoading(state) {
            state.sorting.isLoading = true
            state.pagination.currentPage = 1
        },
        sortingLoaded(
            state,
            action: PayloadAction<Maybe<ReportingMetricItem[]>>
        ) {
            state.sorting.isLoading = false
            state.sorting.lastSortingMetric = action.payload
            state.pagination.currentPage = 1
        },
        pageSet(state, action: PayloadAction<number>) {
            if (action.payload < 1) {
                state.pagination.currentPage = 1
            } else {
                state.pagination.currentPage = action.payload
            }
        },
    },
})

export const {sortingSet, sortingLoading, sortingLoaded, pageSet} =
    intentSlice.actions

const getSliceState = (state: RootState) => {
    return state.ui.stats.statsTables[intentSlice.name]
}

export const getIntentSorting = createSelector(
    getSliceState,
    (state) => state.sorting
)

export const isSortingMetricLoading = createSelector(
    getSliceState,
    (state) => state.sorting.isLoading
)

export const getIntentPagination = createSelector(
    getSliceState,
    (state) => state.pagination
)

// TODO this is just a mock function to simulate fetching data. Should be replaced with actual API call and hook
const getIntents = () => {
    const data = [
        {
            id: 1,
            intent_name: 'order/cancel',
            automation_opportunities: 26,
            tickets: 275,
            automation_rate: 26,
            avg_customer_satisfaction: 4.2,
            resources: 3,
        },
        {
            id: 2,
            intent_name: 'order/track',
            automation_opportunities: 10,
            tickets: 175,
            automation_rate: 8,
            avg_customer_satisfaction: 4.5,
            resources: 2,
        },
        {
            id: 3,
            intent_name: 'order/return',
            automation_opportunities: 15,
            tickets: 125,
            automation_rate: 12,
            avg_customer_satisfaction: 4.3,
            resources: 1,
        },
        {
            id: 4,
            intent_name: 'order/modify',
            automation_opportunities: 20,
            tickets: 75,
            automation_rate: 18,
            avg_customer_satisfaction: 4.1,
            resources: 0,
        },
        {
            id: 5,
            intent_name: 'order/confirm',
            automation_opportunities: 5,
            tickets: 50,
            automation_rate: 3,
            avg_customer_satisfaction: 4.7,
            resources: 1,
        },
    ]

    // eslint-disable-next-line react-hooks/rules-of-hooks
    const dispatch = useDispatch()
    setTimeout(() => {
        dispatch(sortingLoaded())
    }, 2000)

    return {
        isFetching: false,
        data: data,
        isError: false,
    }
}

export const getSortedIntents = createSelector(
    getIntents,
    getIntentSorting,
    (intents, {field, direction}) => {
        const sortedIntents = intents.data.sort((a, b) => {
            if (a[field] > b[field]) {
                return direction === OrderDirection.Asc ? 1 : -1
            } else if (a[field] < b[field]) {
                return direction === OrderDirection.Asc ? -1 : 1
            }
            return 0
        })

        return sortedIntents
    }
)

export const getPaginatedIntents = createSelector(
    getSortedIntents,
    getIntentPagination,
    (
        intents,
        {currentPage, perPage}
    ): {
        intents: Intent[]
        allIntents: Intent[]
        currentPage: number
        perPage: number
    } => {
        const startingItem = (currentPage - 1) * perPage
        const lastItem = Math.min(startingItem + perPage, intents.length)
        return {
            intents: intents.slice(startingItem, lastItem),
            allIntents: intents,
            currentPage,
            perPage,
        }
    }
)
