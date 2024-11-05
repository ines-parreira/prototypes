import {
    FilterKey,
    SavedFilter,
    SavedFilterDraft,
    SavedFilterSupportedFilters,
    SavedFilterWithLogicalOperator,
    StatsFiltersWithLogicalOperator,
} from 'models/stat/types'
import {LogicalOperatorEnum} from 'pages/stats/common/components/Filter/constants'
import {fromLegacyStatsFilters} from 'state/stats/utils'
import {RootState} from 'state/types'
import {
    statFiltersClean,
    statFiltersCleanWithPayload,
    statFiltersDirty,
    statFiltersWithLogicalOperatorsCleanWithPayload,
} from 'state/ui/stats/actions'
import {
    applySavedFilters,
    clearSavedFilterDraft,
    COPY_OF_DRAFT_NAME,
    initialiseSavedFilterDraft,
    EMPTY_DRAFT_NAME,
    filtersSlice,
    FiltersSliceState,
    getCanSaveFilter,
    getHasSavedFilterDraft,
    getIsSavedFilterApplied,
    getSavedFilterDraft,
    initialState,
    removeFilterFromSavedFilterDraft,
    unapplySavedFilter,
    updateSavedFilterDraftName,
    upsertSavedFilterFilter,
    initialiseSavedFilterDraftFromSavedFilter,
    initialiseSavedFilterDraftFromFilters,
    duplicateSavedFilterDraftFromSavedFilter,
    upsertSavedFilterCustomFieldFilter,
} from 'state/ui/stats/filtersSlice'

describe('filtersSlice', () => {
    describe('statFiltersDirty action', () => {
        it('should set the isDirty flag to true', () => {
            const newState = filtersSlice.reducer(
                initialState,
                statFiltersDirty()
            )

            expect(newState.isFilterDirty).toBe(true)
        })
    })

    describe('statFiltersClean action', () => {
        it('should set the isDirty flag to false', () => {
            const newState = filtersSlice.reducer(
                initialState,
                statFiltersClean()
            )

            expect(newState.isFilterDirty).toBe(false)
        })
    })

    describe('statFiltersCleanWithPayload', () => {
        it('should disable the dirty flag and store the payload', () => {
            const newFilters = {
                period: {
                    start_datetime: '2021-02-03T00:00:00.000Z',
                    end_datetime: '2021-02-03T23:59:59.999Z',
                },
                agents: [1, 2],
            }

            const newState = filtersSlice.reducer(
                {...initialState, isFilterDirty: true},
                statFiltersCleanWithPayload(newFilters)
            )

            expect(newState.isFilterDirty).toEqual(false)
            expect(newState.cleanStatsFilters).toEqual(
                fromLegacyStatsFilters(newFilters)
            )
        })
    })

    describe('statFiltersCleanWithPayload', () => {
        it('should disable the dirty flag and store the payload', () => {
            const newFilters = fromLegacyStatsFilters({
                period: {
                    start_datetime: '2021-02-03T00:00:00.000Z',
                    end_datetime: '2021-02-03T23:59:59.999Z',
                },
                agents: [1, 2],
            })

            const newState = filtersSlice.reducer(
                {...initialState, isFilterDirty: true},
                statFiltersWithLogicalOperatorsCleanWithPayload(newFilters)
            )

            expect(newState.isFilterDirty).toEqual(false)
            expect(newState.cleanStatsFilters).toEqual(newFilters)
        })
    })

    describe('savedFilters', () => {
        const agentsSavedFilter: SavedFilterWithLogicalOperator = {
            member: FilterKey.Agents,
            operator: LogicalOperatorEnum.ONE_OF,
            values: ['1', '2'],
        }

        const channelsFilter: SavedFilterSupportedFilters = {
            member: FilterKey.Channels,
            operator: LogicalOperatorEnum.NOT_ONE_OF,
            values: ['1', '2'],
        }

        it('should initialiseSavedFilterDraft', () => {
            const newState = filtersSlice.reducer(
                initialState,
                initialiseSavedFilterDraft()
            )

            expect(newState.savedFilterDraft).toEqual({
                name: EMPTY_DRAFT_NAME,
                filters: [],
            })
        })

        it('should duplicateSavedFilterDraftFromSavedFilter', () => {
            const savedFilter: SavedFilter = {
                id: 123,
                name: 'Some name',
                filters: [agentsSavedFilter],
            }
            const newState = filtersSlice.reducer(
                initialState,
                duplicateSavedFilterDraftFromSavedFilter(savedFilter)
            )

            expect(newState.savedFilterDraft).toEqual({
                name: `${COPY_OF_DRAFT_NAME}${savedFilter.name}`,
                filters: [agentsSavedFilter],
            })
        })

        it('should initialiseSavedFilterDraftFromSavedFilter', () => {
            const savedFilter: SavedFilter = {
                id: 123,
                name: 'Some name',
                filters: [agentsSavedFilter],
            }
            const newState = filtersSlice.reducer(
                initialState,
                initialiseSavedFilterDraftFromSavedFilter(savedFilter)
            )

            expect(newState.savedFilterDraft).toEqual(savedFilter)
        })

        it('should initialiseSavedFilterDraftFromFilters', () => {
            const savedFilter: StatsFiltersWithLogicalOperator = {
                [FilterKey.Period]: {
                    start_datetime: '123',
                    end_datetime: '456',
                },
                [FilterKey.Agents]: {
                    operator: LogicalOperatorEnum.ONE_OF,
                    values: [1, 2],
                },
            }
            const newState = filtersSlice.reducer(
                initialState,
                initialiseSavedFilterDraftFromFilters(savedFilter)
            )

            expect(newState.savedFilterDraft).toEqual({
                name: EMPTY_DRAFT_NAME,
                filters: [
                    {
                        member: FilterKey.Agents,
                        operator: LogicalOperatorEnum.ONE_OF,
                        values: ['1', '2'],
                    },
                ],
            })
        })

        it('should clearSavedFilterDraft', () => {
            const savedFilter: SavedFilter = {
                id: 123,
                name: 'Some name',
                filters: [agentsSavedFilter],
            }
            const state: FiltersSliceState = {
                ...initialState,
                savedFilterDraft: savedFilter,
            }

            const newState = filtersSlice.reducer(
                state,
                clearSavedFilterDraft()
            )

            expect(newState.savedFilterDraft).toEqual(null)
        })

        it('should applySavedFilter', () => {
            const savedFilterId = 123

            const newState = filtersSlice.reducer(
                initialState,
                applySavedFilters(savedFilterId)
            )

            expect(newState.appliedSavedFilterId).toEqual(savedFilterId)
        })

        it('should unapplySavedFilter', () => {
            const savedFilterId = 123
            const state = {
                ...initialState,
                appliedSavedFilterId: savedFilterId,
            }

            const newState = filtersSlice.reducer(state, unapplySavedFilter())

            expect(newState.appliedSavedFilterId).toEqual(null)
        })

        it('should add a filter upsertSavedFilterFilter', () => {
            const filter: SavedFilterSupportedFilters = {
                member: FilterKey.Agents,
                operator: LogicalOperatorEnum.ONE_OF,
                values: ['1', '2'],
            }

            const state = {
                ...initialState,
                savedFilterDraft: {
                    name: 'someName',
                    filters: [],
                },
            }

            const newState = filtersSlice.reducer(
                state,
                upsertSavedFilterFilter(filter)
            )

            expect(newState.savedFilterDraft?.filters).toEqual([filter])
        })

        it('should crate a draft and add a filter upsertSavedFilterFilter', () => {
            const filter: SavedFilterSupportedFilters = {
                member: FilterKey.Agents,
                operator: LogicalOperatorEnum.ONE_OF,
                values: ['1', '2'],
            }

            const state = {
                ...initialState,
                savedFilterDraft: null,
            }

            const newState = filtersSlice.reducer(
                state,
                upsertSavedFilterFilter(filter)
            )

            expect(newState.savedFilterDraft?.filters).toEqual([filter])
        })

        it('should update a filter at the beginning upsertSavedFilterFilter', () => {
            const state = {
                ...initialState,
                savedFilterDraft: {
                    name: 'someName',
                    filters: [agentsSavedFilter],
                },
            }
            const newAgentsSavedFilter = {
                ...agentsSavedFilter,
                values: ['9'],
            }

            const newState = filtersSlice.reducer(
                state,
                upsertSavedFilterFilter(newAgentsSavedFilter)
            )

            expect(newState.savedFilterDraft?.filters).toEqual([
                newAgentsSavedFilter,
            ])
        })

        it('should add a filter at the beginning upsertSavedFilterFilter', () => {
            const state = {
                ...initialState,
                savedFilterDraft: {
                    name: 'someName',
                    filters: [agentsSavedFilter],
                },
            }

            const newState = filtersSlice.reducer(
                state,
                upsertSavedFilterFilter(channelsFilter)
            )

            expect(newState.savedFilterDraft?.filters).toEqual([
                channelsFilter,
                agentsSavedFilter,
            ])
        })

        it('should create draft and insert filter upsertSavedFilterCustomFieldFilter', () => {
            const state = {
                ...initialState,
                savedFilterDraft: null,
            }
            const customFieldFilter = {
                operator: LogicalOperatorEnum.ONE_OF,
                values: ['Some::value'],
                customFieldId: 123,
            }

            const newState = filtersSlice.reducer(
                state,
                upsertSavedFilterCustomFieldFilter(customFieldFilter)
            )

            expect(newState.savedFilterDraft?.filters).toEqual([
                {member: FilterKey.CustomFields, values: [customFieldFilter]},
            ])
        })

        it('should insert upsertSavedFilterCustomFieldFilter', () => {
            const state = {
                ...initialState,
                savedFilterDraft: {
                    name: 'someName',
                    filters: [],
                },
            }
            const customFieldFilter = {
                operator: LogicalOperatorEnum.ONE_OF,
                values: ['Some::value'],
                customFieldId: 123,
            }

            const newState = filtersSlice.reducer(
                state,
                upsertSavedFilterCustomFieldFilter(customFieldFilter)
            )

            expect(newState.savedFilterDraft?.filters).toEqual([
                {member: FilterKey.CustomFields, values: [customFieldFilter]},
            ])
        })

        it('should add filter with upsertSavedFilterCustomFieldFilter', () => {
            const currentFilter = {
                operator: LogicalOperatorEnum.ONE_OF,
                values: ['Some::value'],
                customFieldId: 123,
            }
            const savedFilterDraft: SavedFilterDraft = {
                name: 'someName',
                filters: [
                    {
                        member: FilterKey.CustomFields,
                        values: [currentFilter],
                    },
                ],
            }
            const state = {
                ...initialState,
                savedFilterDraft,
            }
            const customFieldFilter = {
                operator: LogicalOperatorEnum.ONE_OF,
                values: ['Some::value'],
                customFieldId: 456,
            }

            const newState = filtersSlice.reducer(
                state,
                upsertSavedFilterCustomFieldFilter(customFieldFilter)
            )

            expect(newState.savedFilterDraft?.filters).toEqual([
                {
                    member: FilterKey.CustomFields,
                    values: [currentFilter, customFieldFilter],
                },
            ])
        })

        it('should update filter with upsertSavedFilterCustomFieldFilter', () => {
            const currentFilter = {
                operator: LogicalOperatorEnum.ONE_OF,
                values: ['Some::value'],
                customFieldId: 123,
            }
            const savedFilterDraft: SavedFilterDraft = {
                name: 'someName',
                filters: [
                    {
                        member: FilterKey.CustomFields,
                        values: [currentFilter],
                    },
                ],
            }
            const state = {
                ...initialState,
                savedFilterDraft,
            }
            const newValue = 'Some::otherValue'
            const customFieldFilter = {
                operator: LogicalOperatorEnum.ONE_OF,
                values: [newValue],
                customFieldId: 123,
            }

            const newState = filtersSlice.reducer(
                state,
                upsertSavedFilterCustomFieldFilter(customFieldFilter)
            )

            expect(newState.savedFilterDraft?.filters).toEqual([
                {
                    member: FilterKey.CustomFields,
                    values: [customFieldFilter],
                },
            ])
        })

        it('should update the Saved Filters name', () => {
            const state = {
                ...initialState,
                savedFilterDraft: {
                    name: 'someName',
                    filters: [agentsSavedFilter],
                },
            }
            const newName = 'newName'

            const newState = filtersSlice.reducer(
                state,
                updateSavedFilterDraftName(newName)
            )

            expect(newState.savedFilterDraft?.name).toEqual(newName)
        })

        it('should create Saved Filter with a name', () => {
            const state = {
                ...initialState,
                savedFilterDraft: null,
            }
            const newName = 'newName'

            const newState = filtersSlice.reducer(
                state,
                updateSavedFilterDraftName(newName)
            )

            expect(newState.savedFilterDraft).toEqual({
                name: newName,
                filters: [],
            })
        })

        it('should removeFilterFromSavedFilterDraft', () => {
            const agentFilter: SavedFilterSupportedFilters = {
                member: FilterKey.Agents,
                operator: LogicalOperatorEnum.ONE_OF,
                values: ['1', '2'],
            }

            const state = {
                ...initialState,
                savedFilterDraft: {
                    name: 'someName',
                    filters: [channelsFilter, agentFilter],
                },
            }

            const newState = filtersSlice.reducer(
                state,
                removeFilterFromSavedFilterDraft(agentFilter)
            )

            expect(newState.savedFilterDraft?.filters).toEqual([channelsFilter])
        })

        it('should do nothing if no filter on removedSavedFilterFilter', () => {
            const agentFilter: SavedFilterSupportedFilters = {
                member: FilterKey.Agents,
                operator: LogicalOperatorEnum.ONE_OF,
                values: ['1', '2'],
            }

            const state = {
                ...initialState,
                savedFilterDraft: null,
            }

            const newState = filtersSlice.reducer(
                state,
                removeFilterFromSavedFilterDraft(agentFilter)
            )

            expect(newState.savedFilterDraft).toEqual(null)
        })

        it('should return true is savedFilter exists', () => {
            const savedFilterDraft = {
                name: 'someName',
                filters: [agentsSavedFilter],
            }
            const state = {
                ui: {
                    stats: {
                        filters: {
                            ...initialState,
                            savedFilterDraft: savedFilterDraft,
                        },
                    },
                },
            } as RootState

            expect(getHasSavedFilterDraft(state)).toEqual(true)
        })

        it('should return savedFilter', () => {
            const savedFilterDraft = {
                name: 'someName',
                filters: [agentsSavedFilter],
            }
            const state = {
                ui: {
                    stats: {
                        filters: {
                            ...initialState,
                            savedFilterDraft: savedFilterDraft,
                        },
                    },
                },
            } as RootState

            expect(getSavedFilterDraft(state)).toEqual(savedFilterDraft)
        })

        it('should return true if savedFilter has a name and at least one filter', () => {
            const savedFilterDraft = {
                name: 'someName',
                filters: [agentsSavedFilter],
            }
            const state = {
                ui: {
                    stats: {
                        filters: {
                            ...initialState,
                            savedFilterDraft: savedFilterDraft,
                        },
                    },
                },
            } as RootState

            expect(getCanSaveFilter(state)).toEqual(true)
        })

        it('should return false if savedFilter has no filters', () => {
            const savedFilterDraft: SavedFilterDraft = {
                name: 'someName',
                filters: [],
            }
            const state = {
                ui: {
                    stats: {
                        filters: {
                            ...initialState,
                            savedFilterDraft: savedFilterDraft,
                        },
                    },
                },
            } as RootState

            expect(getCanSaveFilter(state)).toEqual(false)
        })

        it('should return false if savedFilter has empty name', () => {
            const savedFilterDraft: SavedFilterDraft = {
                name: '',
                filters: [agentsSavedFilter],
            }
            const state = {
                ui: {
                    stats: {
                        filters: {
                            ...initialState,
                            savedFilterDraft: savedFilterDraft,
                        },
                    },
                },
            } as RootState

            expect(getCanSaveFilter(state)).toEqual(false)
        })

        it('should return true if savedFilterApplied with id', () => {
            const state = {
                ui: {
                    stats: {
                        filters: {
                            ...initialState,
                            appliedSavedFilterId: 123,
                        },
                    },
                },
            } as RootState

            expect(getIsSavedFilterApplied(state)).toEqual(true)
        })

        it('should return false if no savedFilterApplied', () => {
            const state = {
                ui: {
                    stats: {
                        filters: {
                            ...initialState,
                        },
                    },
                },
            } as RootState

            expect(getIsSavedFilterApplied(state)).toEqual(false)
        })
    })
})
