import {createSlice, PayloadAction} from '@reduxjs/toolkit'

import {createSelector} from 'reselect'

import {
    SavedFilter,
    SavedFilterDraft,
    SavedFilterSupportedFilters,
    StatsFiltersWithLogicalOperator,
} from 'models/stat/types'
import {
    fromLegacyStatsFilters,
    savedFilterDraftFiltersFromFiltersWithLogicalOperators,
} from 'state/stats/utils'
import {RootState} from 'state/types'

export type FiltersSliceState = {
    isFilterDirty: boolean
    cleanStatsFilters: StatsFiltersWithLogicalOperator | null
    savedFilterDraft: SavedFilter | SavedFilterDraft | null
    appliedSavedFilterId: number | null
}

export const initialState: FiltersSliceState = {
    isFilterDirty: false,
    cleanStatsFilters: null,
    savedFilterDraft: null,
    appliedSavedFilterId: null,
}

export const EMPTY_DRAFT_NAME = 'Saved Filter Draft'
export const COPY_OF_DRAFT_NAME = 'Copy of '

export const filtersSlice = createSlice({
    name: 'filters',
    initialState: initialState,
    reducers: {
        statFiltersDirty(state) {
            state.isFilterDirty = true
        },
        statFiltersClean(state) {
            state.isFilterDirty = false
        },
        statFiltersCleanWithPayload(state, {payload}) {
            state.isFilterDirty = false
            state.cleanStatsFilters = fromLegacyStatsFilters(payload)
        },
        statFiltersWithLogicalOperatorsCleanWithPayload(state, {payload}) {
            state.isFilterDirty = false
            state.cleanStatsFilters = payload
        },
        initialiseSavedFilterDraft(state) {
            state.savedFilterDraft = {
                name: EMPTY_DRAFT_NAME,
                filters: [],
            }
        },
        initialiseSavedFilterDraftFromFilters(
            state,
            action: PayloadAction<StatsFiltersWithLogicalOperator>
        ) {
            state.savedFilterDraft = {
                name: EMPTY_DRAFT_NAME,
                filters: savedFilterDraftFiltersFromFiltersWithLogicalOperators(
                    action.payload
                ),
            }
        },
        initialiseSavedFilterDraftFromSavedFilter(
            state,
            action: PayloadAction<SavedFilter>
        ) {
            state.savedFilterDraft = action.payload
        },
        duplicateSavedFilterDraftFromSavedFilter(
            state,
            action: PayloadAction<SavedFilter>
        ) {
            state.savedFilterDraft = {
                name: `${COPY_OF_DRAFT_NAME}${action.payload.name}`,
                filters: action.payload.filters,
            }
        },
        clearSavedFilterDraft(state) {
            state.savedFilterDraft = null
        },
        applySavedFilters(state, action: PayloadAction<number>) {
            state.appliedSavedFilterId = action.payload
        },
        unapplySavedFilter(state) {
            state.appliedSavedFilterId = null
        },
        updateSavedFilterDraftName(state, action: PayloadAction<string>) {
            state.savedFilterDraft = {
                name: action.payload,
                filters: state.savedFilterDraft?.filters ?? [],
            }
        },
        upsertSavedFilterFilter(
            state,
            action: PayloadAction<SavedFilterSupportedFilters>
        ) {
            if (state.savedFilterDraft === null) {
                state.savedFilterDraft = {
                    name: EMPTY_DRAFT_NAME,
                    filters: [action.payload],
                }
            } else {
                const otherFilters = state.savedFilterDraft.filters.filter(
                    (filter) => filter.member !== action.payload.member
                )
                state.savedFilterDraft.filters = [
                    action.payload,
                    ...otherFilters,
                ]
            }
        },
        removeFilterFromSavedFilterDraft(
            state,
            action: PayloadAction<SavedFilterSupportedFilters>
        ) {
            if (state.savedFilterDraft !== null) {
                state.savedFilterDraft.filters =
                    state.savedFilterDraft.filters.filter(
                        (filter) => filter.member !== action.payload.member
                    )
            }
        },
    },
})

export const {
    initialiseSavedFilterDraft,
    initialiseSavedFilterDraftFromFilters,
    initialiseSavedFilterDraftFromSavedFilter,
    duplicateSavedFilterDraftFromSavedFilter,
    clearSavedFilterDraft,
    applySavedFilters,
    unapplySavedFilter,
    updateSavedFilterDraftName,
    upsertSavedFilterFilter,
    removeFilterFromSavedFilterDraft,
} = filtersSlice.actions

const getSliceState = (state: RootState) => state.ui.stats[filtersSlice.name]

export const getHasSavedFilterDraft = createSelector(
    getSliceState,
    (state) => state.savedFilterDraft !== null
)

export const getSavedFilterDraft = createSelector(
    getSliceState,
    (state) => state.savedFilterDraft
)

export const getCanSaveFilter = createSelector(
    getSliceState,
    (state) =>
        state.savedFilterDraft !== null &&
        state.savedFilterDraft.name !== '' &&
        state.savedFilterDraft.filters.length > 0
)

export const getIsSavedFilterApplied = createSelector(
    getSliceState,
    (state) => state.appliedSavedFilterId !== null
)
