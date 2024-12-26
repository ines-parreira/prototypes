import {configureStore} from '@reduxjs/toolkit'

import {OrderDirection} from 'models/api/types'
import {
    Intent,
    IntentTableColumn,
} from 'pages/aiAgent/insights/IntentTableWidget/types'
import {
    intentSlice,
    initialState,
    sortingSet,
    sortingLoading,
    sortingLoaded,
    pageSet,
    getIntentSorting,
    isSortingMetricLoading,
    getIntentPagination,
    getPaginatedIntents,
    getSortedIntents,
    getIntentIntents,
} from 'state/ui/stats/insightsSlice'

describe('Intent Slice', () => {
    describe('Intent actions', () => {
        const store = configureStore({
            reducer: {
                intent: intentSlice.reducer,
            },
        })

        it('should return the initial state', () => {
            expect(store.getState().intent).toEqual(initialState)
        })

        it('should handle sortingSet action', () => {
            const sortingPayload = {
                field: IntentTableColumn.Tickets,
                direction: OrderDirection.Asc,
            }

            store.dispatch(sortingSet(sortingPayload))
            const state = store.getState().intent

            expect(state.sorting.field).toBe(sortingPayload.field)
            expect(state.sorting.direction).toBe(sortingPayload.direction)
            expect(state.sorting.isLoading).toBe(false)
            expect(state.pagination.currentPage).toBe(1)
        })

        it('should handle sortingLoading action', () => {
            store.dispatch(sortingLoading())
            const state = store.getState().intent

            expect(state.sorting.isLoading).toBe(true)
            expect(state.pagination.currentPage).toBe(1)
        })

        it('should handle sortingLoaded action', () => {
            const lastSortingMetricMock = [
                {name: 'order/cancel', automationOpportunity: 5},
                {name: 'order/return', automationOpportunity: 3},
            ] as unknown as Intent[]

            store.dispatch(sortingLoaded(lastSortingMetricMock))
            const state = store.getState().intent

            expect(state.sorting.isLoading).toBe(false)
            expect(state.intents).toEqual(lastSortingMetricMock)
        })

        it('should handle pageSet action', () => {
            store.dispatch(pageSet(3))
            const state = store.getState().intent

            expect(state.pagination.currentPage).toBe(3)

            store.dispatch(pageSet(0)) // Invalid page number
            expect(store.getState().intent.pagination.currentPage).toBe(1)
        })
    })
    describe('Selectors', () => {
        const mockState = {
            ui: {
                stats: {
                    statsTables: {
                        [intentSlice.name]: initialState,
                    },
                },
            },
        }

        it('getIntentSorting selector', () => {
            const sorting = getIntentSorting(mockState as any)
            expect(sorting).toEqual(initialState.sorting)
        })

        it('isSortingMetricLoading selector', () => {
            const isLoading = isSortingMetricLoading(mockState as any)
            expect(isLoading).toBe(initialState.sorting.isLoading)
        })

        it('getIntentPagination selector', () => {
            const pagination = getIntentPagination(mockState as any)
            expect(pagination).toEqual(initialState.pagination)
        })

        it('getIntentIntents selector', () => {
            const intents = getIntentIntents(mockState as any)
            expect(intents).toEqual(initialState.intents)
        })

        it('getPaginatedIntents selector', () => {
            const allIntents = [
                {
                    id: 1,
                    [IntentTableColumn.IntentName]: 'intent1',
                    [IntentTableColumn.AutomationOpportunities]: 10,
                },
                {
                    id: 2,
                    [IntentTableColumn.IntentName]: 'intent2',
                    [IntentTableColumn.AutomationOpportunities]: 20,
                },
                {
                    id: 3,
                    [IntentTableColumn.IntentName]: 'intent3',
                    [IntentTableColumn.AutomationOpportunities]: 30,
                },
            ] as unknown as Intent[]

            const pagination = {
                currentPage: 1,
                perPage: 2,
            }

            const paginatedIntents = getPaginatedIntents.resultFunc(
                allIntents,
                pagination
            )
            expect(paginatedIntents.intents.length).toBe(2) // First page items
            expect(paginatedIntents.allIntents.length).toBe(3)
        })
    })

    describe('getSortedIntents', () => {
        // Mock data
        const mockIntents = [
            {
                id: 1,
                [IntentTableColumn.IntentName]: 'order/cancel',
                [IntentTableColumn.AutomationOpportunities]: 26,
            },
            {
                id: 2,
                [IntentTableColumn.IntentName]: 'order/track',
                [IntentTableColumn.AutomationOpportunities]: 10,
            },
            {
                id: 3,
                [IntentTableColumn.IntentName]: 'order/return',
                [IntentTableColumn.AutomationOpportunities]: 15,
            },
        ] as unknown as Intent[]

        const mockSorting = {
            field: IntentTableColumn.AutomationOpportunities,
            direction: OrderDirection.Desc,
            isLoading: false,
            lastSortingMetric: null,
        }

        it('should sort intents in descending order by automationOpportunity', () => {
            const result = getSortedIntents.resultFunc(mockIntents, mockSorting)

            expect(result).toEqual([
                {
                    id: 1,
                    [IntentTableColumn.IntentName]: 'order/cancel',
                    [IntentTableColumn.AutomationOpportunities]: 26,
                },
                {
                    id: 3,
                    [IntentTableColumn.IntentName]: 'order/return',
                    [IntentTableColumn.AutomationOpportunities]: 15,
                },
                {
                    id: 2,
                    [IntentTableColumn.IntentName]: 'order/track',
                    [IntentTableColumn.AutomationOpportunities]: 10,
                },
            ])
        })

        it('should sort intents in ascending order by automationOpportunity', () => {
            const ascendingSorting = {
                ...mockSorting,
                direction: OrderDirection.Asc,
            }

            const result = getSortedIntents.resultFunc(
                mockIntents,
                ascendingSorting
            )

            expect(result).toEqual([
                {
                    id: 2,
                    [IntentTableColumn.IntentName]: 'order/track',
                    [IntentTableColumn.AutomationOpportunities]: 10,
                },
                {
                    id: 3,
                    [IntentTableColumn.IntentName]: 'order/return',
                    [IntentTableColumn.AutomationOpportunities]: 15,
                },
                {
                    id: 1,
                    [IntentTableColumn.IntentName]: 'order/cancel',
                    [IntentTableColumn.AutomationOpportunities]: 26,
                },
            ])
        })

        it('should return unsorted intents if field is not present in data', () => {
            const invalidSorting = {
                ...mockSorting,
                field: 'non_existing_field' as IntentTableColumn,
            }

            const result = getSortedIntents.resultFunc(
                mockIntents,
                invalidSorting
            )

            expect(result).toEqual(mockIntents)
        })
    })
})
