import {createSlice, PayloadAction} from '@reduxjs/toolkit'
import {createSelector} from 'reselect'

import {
    CustomFieldFilter,
    CustomFieldSavedFilter,
    FilterKey,
    SavedFilter,
    SavedFilterDraft,
    SavedFilterSupportedFilters,
    SavedFilterWithLogicalOperator,
    StatsFiltersWithLogicalOperator,
    TagsSavedFilter,
} from 'models/stat/types'
import {toApiFormatted} from 'pages/stats/common/filters/helpers'
import {
    fromLegacyStatsFilters,
    isCustomFieldSavedFilter,
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
                filter_group: [],
            }
        },
        initialiseSavedFilterDraftFromFilters(
            state,
            action: PayloadAction<StatsFiltersWithLogicalOperator>
        ) {
            state.savedFilterDraft = {
                name: EMPTY_DRAFT_NAME,
                filter_group:
                    savedFilterDraftFiltersFromFiltersWithLogicalOperators(
                        action.payload
                    ),
            }
        },
        initialiseSavedFilterDraftFromSavedFilter(
            state,
            action: PayloadAction<SavedFilter>
        ) {
            state.appliedSavedFilterId = null
            state.savedFilterDraft = action.payload
        },
        duplicateSavedFilterDraftFromSavedFilter(
            state,
            action: PayloadAction<SavedFilter>
        ) {
            state.savedFilterDraft = {
                name: `${COPY_OF_DRAFT_NAME}${action.payload.name}`,
                filter_group: action.payload.filter_group,
            }
        },
        clearSavedFilterDraft(state) {
            state.savedFilterDraft = null
        },
        applySavedFilter(state, action: PayloadAction<SavedFilter>) {
            state.appliedSavedFilterId = action.payload.id
            state.savedFilterDraft = action.payload
        },
        unapplySavedFilter(state) {
            state.appliedSavedFilterId = null
            state.savedFilterDraft = null
        },
        updateSavedFilterDraftName(state, action: PayloadAction<string>) {
            if (state.savedFilterDraft === null) {
                state.savedFilterDraft = {
                    name: action.payload,
                    filter_group: [],
                }
            } else {
                state.savedFilterDraft.name = action.payload
            }
        },
        upsertSavedFilterFilter(
            state,
            action: PayloadAction<
                SavedFilterWithLogicalOperator | TagsSavedFilter
            >
        ) {
            if (state.savedFilterDraft === null) {
                state.savedFilterDraft = {
                    name: EMPTY_DRAFT_NAME,
                    filter_group: [action.payload],
                }
            } else {
                const otherFilters = state.savedFilterDraft.filter_group.filter(
                    (filter) => filter.member !== action.payload.member
                )
                state.savedFilterDraft.filter_group = [
                    action.payload,
                    ...otherFilters,
                ]
            }
        },
        upsertSavedFilterCustomFieldFilter(
            state,
            action: PayloadAction<CustomFieldFilter>
        ) {
            if (state.savedFilterDraft === null) {
                state.savedFilterDraft = {
                    name: EMPTY_DRAFT_NAME,
                    filter_group: [
                        {
                            member: FilterKey.CustomFields,
                            values: [
                                {
                                    ...action.payload,
                                    custom_field_id:
                                        action.payload.customFieldId,
                                },
                            ],
                        },
                    ],
                }
            } else {
                const otherFilters = state.savedFilterDraft.filter_group.filter(
                    (filter) => filter.member !== FilterKey.CustomFields
                )

                const existingCustomFieldFilter =
                    state.savedFilterDraft.filter_group.find(
                        isCustomFieldSavedFilter
                    )

                const otherValues =
                    existingCustomFieldFilter?.values.filter(
                        (v) =>
                            v.custom_field_id !== action.payload.customFieldId
                    ) ?? []

                const updatedFilter: CustomFieldSavedFilter = {
                    member: FilterKey.CustomFields,
                    values: [
                        ...otherValues,
                        {
                            ...action.payload,
                            custom_field_id: action.payload.customFieldId,
                        },
                    ],
                }
                state.savedFilterDraft.filter_group = [
                    updatedFilter,
                    ...otherFilters,
                ]
            }
        },
        removeFilterFromSavedFilterDraft(
            state,
            action: PayloadAction<SavedFilterSupportedFilters>
        ) {
            if (state.savedFilterDraft !== null) {
                state.savedFilterDraft.filter_group =
                    state.savedFilterDraft.filter_group.filter(
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
    applySavedFilter,
    unapplySavedFilter,
    updateSavedFilterDraftName,
    upsertSavedFilterFilter,
    upsertSavedFilterCustomFieldFilter,
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
        toApiFormatted(state.savedFilterDraft.filter_group).length > 0
)

export const getIsSavedFilterApplied = createSelector(
    getSliceState,
    (state) => state.appliedSavedFilterId !== null
)

export const getSavedFilterAppliedId = createSelector(
    getSliceState,
    (state) => state.appliedSavedFilterId
)
