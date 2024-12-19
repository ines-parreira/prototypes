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
    applySavedFilter,
    clearSavedFilterDraft,
    COPY_OF_DRAFT_NAME,
    initialiseSavedFilterDraft,
    filtersSlice,
    FiltersSliceState,
    getCanSaveFilter,
    getHasSavedFilterDraft,
    getIsSavedFilterApplied,
    getSavedFilterDraft,
    initialState,
    removeFilterFromSavedFilterDraft,
    updateSavedFilterDraftName,
    upsertSavedFilterFilter,
    initialiseSavedFilterDraftFromSavedFilter,
    initialiseSavedFilterDraftFromFilters,
    duplicateSavedFilterDraftFromSavedFilter,
    upsertSavedFilterCustomFieldFilter,
    getHideFiltersPanelOptionalFilters,
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

    const agentsSavedFilter: SavedFilterWithLogicalOperator = {
        member: FilterKey.Agents,
        operator: LogicalOperatorEnum.ONE_OF,
        values: ['1', '2'],
    }

    describe('savedFilters', () => {
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
                name: '',
                filter_group: [],
            })
        })

        it('should duplicateSavedFilterDraftFromSavedFilter', () => {
            const savedFilter: SavedFilter = {
                id: 123,
                name: 'Some name',
                filter_group: [agentsSavedFilter],
            }
            const newState = filtersSlice.reducer(
                initialState,
                duplicateSavedFilterDraftFromSavedFilter(savedFilter)
            )

            expect(newState.savedFilterDraft).toEqual({
                name: `${savedFilter.name} ${COPY_OF_DRAFT_NAME}`,
                filter_group: [agentsSavedFilter],
            })
        })

        it('should initialiseSavedFilterDraftFromSavedFilter', () => {
            const savedFilter: SavedFilter = {
                id: 123,
                name: 'Some name',
                filter_group: [agentsSavedFilter],
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
                name: '',
                filter_group: [
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
                filter_group: [agentsSavedFilter],
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
            expect(newState.appliedSavedFilterId).toEqual(null)
        })

        it('should applySavedFilter', () => {
            const savedFilter: SavedFilter = {
                id: 123,
                name: 'Some name',
                filter_group: [agentsSavedFilter],
            }

            const newState = filtersSlice.reducer(
                initialState,
                applySavedFilter(savedFilter)
            )

            expect(newState.appliedSavedFilterId).toEqual(savedFilter.id)
            expect(newState.savedFilterDraft).toEqual(savedFilter)
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
                    filter_group: [],
                },
            }

            const newState = filtersSlice.reducer(
                state,
                upsertSavedFilterFilter(filter)
            )

            expect(newState.savedFilterDraft?.filter_group).toEqual([filter])
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

            expect(newState.savedFilterDraft?.filter_group).toEqual([filter])
        })

        it('should update a filter at the beginning upsertSavedFilterFilter', () => {
            const state = {
                ...initialState,
                savedFilterDraft: {
                    name: 'someName',
                    filter_group: [agentsSavedFilter],
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

            expect(newState.savedFilterDraft?.filter_group).toEqual([
                newAgentsSavedFilter,
            ])
        })

        it('should add a filter at the beginning upsertSavedFilterFilter', () => {
            const state = {
                ...initialState,
                savedFilterDraft: {
                    name: 'someName',
                    filter_group: [agentsSavedFilter],
                },
            }

            const newState = filtersSlice.reducer(
                state,
                upsertSavedFilterFilter(channelsFilter)
            )

            expect(newState.savedFilterDraft?.filter_group).toEqual([
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

            expect(newState.savedFilterDraft?.filter_group).toEqual([
                {
                    member: FilterKey.CustomFields,
                    values: [
                        {
                            ...customFieldFilter,
                            custom_field_id: String(
                                customFieldFilter.customFieldId
                            ),
                        },
                    ],
                },
            ])
        })

        it('should insert upsertSavedFilterCustomFieldFilter', () => {
            const state = {
                ...initialState,
                savedFilterDraft: {
                    name: 'someName',
                    filter_group: [],
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

            expect(newState.savedFilterDraft?.filter_group).toEqual([
                {
                    member: FilterKey.CustomFields,
                    values: [
                        {
                            ...customFieldFilter,
                            custom_field_id: String(
                                customFieldFilter.customFieldId
                            ),
                        },
                    ],
                },
            ])
        })

        it('should add filter with upsertSavedFilterCustomFieldFilter', () => {
            const currentFilter = {
                operator: LogicalOperatorEnum.ONE_OF,
                values: ['Some::value'],
                custom_field_id: '123',
            }
            const savedFilterDraft: SavedFilterDraft = {
                name: 'someName',
                filter_group: [
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

            expect(newState.savedFilterDraft?.filter_group).toEqual([
                {
                    member: FilterKey.CustomFields,
                    values: [
                        currentFilter,
                        {
                            ...customFieldFilter,
                            custom_field_id: String(
                                customFieldFilter.customFieldId
                            ),
                        },
                    ],
                },
            ])
        })

        it('should update filter with upsertSavedFilterCustomFieldFilter', () => {
            const currentFilter = {
                operator: LogicalOperatorEnum.ONE_OF,
                values: ['Some::value'],
                custom_field_id: '123',
            }
            const savedFilterDraft: SavedFilterDraft = {
                name: 'someName',
                filter_group: [
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

            expect(newState.savedFilterDraft?.filter_group).toEqual([
                {
                    member: FilterKey.CustomFields,
                    values: [
                        {
                            ...customFieldFilter,
                            custom_field_id: String(
                                customFieldFilter.customFieldId
                            ),
                        },
                    ],
                },
            ])
        })

        it('should update the Saved Filters name', () => {
            const state = {
                ...initialState,
                savedFilterDraft: {
                    name: 'someName',
                    filter_group: [agentsSavedFilter],
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
                filter_group: [],
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
                    filter_group: [channelsFilter, agentFilter],
                },
            }

            const newState = filtersSlice.reducer(
                state,
                removeFilterFromSavedFilterDraft({filterKey: FilterKey.Agents})
            )

            expect(newState.savedFilterDraft?.filter_group).toEqual([
                channelsFilter,
            ])
        })

        it('should remove CustomFields object using removeFilterFromSavedFilterDraft', () => {
            const currentFilter = {
                operator: LogicalOperatorEnum.ONE_OF,
                values: ['Some::value'],
                custom_field_id: '123',
            }
            const savedFilterDraft: SavedFilterDraft = {
                name: 'someName',
                filter_group: [
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

            const newState = filtersSlice.reducer(
                state,
                removeFilterFromSavedFilterDraft({
                    filterKey: FilterKey.CustomFields,
                    customFieldId: 123,
                })
            )

            expect(newState.savedFilterDraft?.filter_group).toEqual([])
        })

        it('should remove one CustomField and keep the other using removeFilterFromSavedFilterDraft', () => {
            const currentFilter = {
                operator: LogicalOperatorEnum.ONE_OF,
                values: ['Some::value'],
                custom_field_id: '123',
            }
            const otherFilter = {...currentFilter, custom_field_id: '456'}
            const savedFilterDraft: SavedFilterDraft = {
                name: 'someName',
                filter_group: [
                    {
                        member: FilterKey.CustomFields,
                        values: [currentFilter, otherFilter],
                    },
                ],
            }

            const state = {
                ...initialState,
                savedFilterDraft,
            }

            const newState = filtersSlice.reducer(
                state,
                removeFilterFromSavedFilterDraft({
                    filterKey: FilterKey.CustomFields,
                    customFieldId: 123,
                })
            )

            expect(newState.savedFilterDraft?.filter_group).toEqual([
                {
                    member: FilterKey.CustomFields,
                    values: [otherFilter],
                },
            ])
        })

        it('should remove TagsFilters object using removeFilterFromSavedFilterDraft', () => {
            const currentFilter = {
                operator: LogicalOperatorEnum.ONE_OF,
                values: ['Some::value'],
                filterInstanceId: 'first',
            } as any
            const savedFilterDraft: SavedFilterDraft = {
                name: 'someName',
                filter_group: [
                    {
                        member: FilterKey.Tags,
                        values: [currentFilter],
                    },
                ],
            }

            const state = {
                ...initialState,
                savedFilterDraft,
            }

            const newState = filtersSlice.reducer(
                state,
                removeFilterFromSavedFilterDraft({
                    filterKey: FilterKey.Tags,
                    filterInstanceId: 'first',
                })
            )

            expect(newState.savedFilterDraft?.filter_group).toEqual([])
        })

        it('should remove TagsFilters and keep the other using removeFilterFromSavedFilterDraft', () => {
            const currentFilter = {
                operator: LogicalOperatorEnum.ONE_OF,
                values: ['Some::value'],
                filterInstanceId: 'first',
            } as any

            const otherFilter: SavedFilterSupportedFilters = {
                member: FilterKey.Agents,
                operator: LogicalOperatorEnum.ONE_OF,
                values: ['Some::value'],
                filterInstanceId: 'second',
            } as any

            const savedFilterDraft: SavedFilterDraft = {
                name: 'someName',
                filter_group: [
                    {
                        member: FilterKey.Tags,
                        values: [currentFilter, otherFilter],
                    },
                ],
            }

            const state = {
                ...initialState,
                savedFilterDraft,
                values: ['1', '2'],
            }

            const newState = filtersSlice.reducer(
                state,
                removeFilterFromSavedFilterDraft({
                    filterKey: FilterKey.Tags,
                    filterInstanceId: 'first',
                })
            )

            expect(newState.savedFilterDraft?.filter_group).toEqual([
                {
                    member: FilterKey.Tags,
                    values: [otherFilter],
                },
            ])
        })

        it('should do nothing if no filter on removedSavedFilterFilter', () => {
            const state = {
                ...initialState,
                savedFilterDraft: null,
            }

            const newState = filtersSlice.reducer(
                state,
                removeFilterFromSavedFilterDraft({filterKey: FilterKey.Agents})
            )

            expect(newState.savedFilterDraft).toEqual(null)
        })

        it('should return true is savedFilter exists', () => {
            const savedFilterDraft = {
                name: 'someName',
                filter_group: [agentsSavedFilter],
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
                filter_group: [agentsSavedFilter],
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
                filter_group: [agentsSavedFilter],
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
                filter_group: [],
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
                filter_group: [agentsSavedFilter],
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

    describe('getShouldDisableFiltersPanelActions', () => {
        const savedFilterDraft = {
            name: 'someName',
            filter_group: [agentsSavedFilter],
        }
        const getState = (draft = {}) => ({
            ui: {
                stats: {
                    filters: {
                        ...initialState,
                        ...draft,
                    },
                },
            },
        })

        it('should return true', () => {
            expect(
                getHideFiltersPanelOptionalFilters(
                    getState({
                        savedFilterDraft: savedFilterDraft,
                        appliedSavedFilterId: null,
                    }) as RootState
                )
            ).toBeTruthy()

            expect(
                getHideFiltersPanelOptionalFilters(
                    getState({
                        savedFilterDraft: null,
                        appliedSavedFilterId: 1,
                    }) as RootState
                )
            ).toBeTruthy()

            expect(
                getHideFiltersPanelOptionalFilters(
                    getState({
                        savedFilterDraft: {name: null},
                        appliedSavedFilterId: 1,
                    }) as RootState
                )
            ).toBeTruthy()
        })

        it('should return false', () => {
            expect(
                getHideFiltersPanelOptionalFilters(
                    getState({
                        savedFilterDraft: null,
                        appliedSavedFilterId: null,
                    }) as RootState
                )
            ).toBeFalsy()
        })
    })
})
