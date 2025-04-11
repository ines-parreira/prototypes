import { createSelector, createSlice, PayloadAction } from '@reduxjs/toolkit'

import { OrderDirection } from 'models/api/types'
import {
    Intent,
    IntentTableColumn,
} from 'pages/aiAgent/insights/IntentTableWidget/types'
import { RootState } from 'state/types'
import { INTENT_SLICE_NAME } from 'state/ui/stats/constants'

export type IntentSorting<T> = {
    field: T
    direction: OrderDirection
}

export type IntentState<T> = {
    sorting: IntentSorting<T> & {
        isLoading: boolean
    }
    pagination: {
        currentPage: number
        perPage: number
    }
    intents: Intent[] | null | undefined
}

export const DEFAULT_SORTING_DIRECTION = OrderDirection.Desc

export const INTENTS_PER_PAGE = 15

export const initialState: IntentState<IntentTableColumn> = {
    sorting: {
        field: IntentTableColumn.SuccessRateUpliftOpportunity,
        direction: OrderDirection.Desc,
        isLoading: true,
    },
    pagination: {
        currentPage: 1,
        perPage: INTENTS_PER_PAGE,
    },
    intents: null,
}

export const intentSlice = createSlice({
    name: INTENT_SLICE_NAME,
    initialState,
    reducers: {
        sortingSet(
            state,
            action: PayloadAction<IntentSorting<IntentTableColumn>>,
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
            action: PayloadAction<Intent[] | null | undefined>,
        ) {
            state.sorting.isLoading = false
            state.pagination.currentPage = 1
            state.intents = action.payload || []
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

export const { sortingSet, sortingLoading, sortingLoaded, pageSet } =
    intentSlice.actions

const getSliceState = (state: RootState) => {
    return state.ui.stats.statsTables[intentSlice.name]
}

export const getIntentSorting = createSelector(
    getSliceState,
    (state) => state.sorting,
)

export const isSortingMetricLoading = createSelector(
    getSliceState,
    (state) => state.sorting.isLoading,
)

export const getIntentPagination = createSelector(
    getSliceState,
    (state) => state.pagination,
)

export const getIntentIntents = createSelector(
    getSliceState,
    (state) => state.intents,
)

const getIntents = createSelector(getSliceState, (state) => state.intents)

export const getSortedIntents = createSelector(
    getIntents,
    getIntentSorting,
    (intentsList, { field, direction }) => {
        const intents = intentsList ? [...intentsList] : []
        const sortedIntents = intents.sort((a, b) => {
            const parseValue = (value: string | number) => {
                const num = Number(value)
                return isNaN(num) ? value : num
            }

            const aField = parseValue(a[field])
            const bField = parseValue(b[field])

            // Compare numbers and strings appropriately
            if (typeof aField === 'number' && typeof bField === 'number') {
                return direction === OrderDirection.Asc
                    ? aField - bField
                    : bField - aField
            } else if (
                typeof aField === 'string' &&
                typeof bField === 'string'
            ) {
                return direction === OrderDirection.Asc
                    ? aField.localeCompare(bField)
                    : bField.localeCompare(aField)
            }
            // If types differ, prioritize numbers over strings
            return typeof aField === 'number' ? -1 : 1
        })

        return sortedIntents
    },
)

export const getPaginatedIntents = createSelector(
    getSortedIntents,
    getIntentPagination,
    (
        intents,
        { currentPage, perPage },
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
    },
)
