import {configureStore} from '@reduxjs/toolkit'

import {ReportingMetricItem} from 'hooks/reporting/useMetricPerDimension'
import {OrderDirection} from 'models/api/types'
import {
    Intent,
    IntentTableColumn,
} from 'pages/automate/aiAgent/insights/IntentTableWidget/types'
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
} from 'state/ui/stats/insightsSlice'

describe('Intent Slice', () => {
    describe('Intent actions', () => {
        const store = configureStore({
            reducer: {
                intent: intentSlice.reducer,
            },
        })

        test('should return the initial state', () => {
            expect(store.getState().intent).toEqual(initialState)
        })

        test('should handle sortingSet action', () => {
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

        test('should handle sortingLoading action', () => {
            store.dispatch(sortingLoading())
            const state = store.getState().intent

            expect(state.sorting.isLoading).toBe(true)
            expect(state.pagination.currentPage).toBe(1)
        })

        test('should handle sortingLoaded action', () => {
            const lastSortingMetricMock = [
                {name: 'order/cancel', value: 5},
                {name: 'order/return', value: 3},
            ] as unknown as ReportingMetricItem[]

            store.dispatch(sortingLoaded(lastSortingMetricMock))
            const state = store.getState().intent

            expect(state.sorting.isLoading).toBe(false)
            expect(state.sorting.lastSortingMetric).toEqual(
                lastSortingMetricMock
            )
        })

        test('should handle pageSet action', () => {
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

        test('getIntentSorting selector', () => {
            const sorting = getIntentSorting(mockState as any)
            expect(sorting).toEqual(initialState.sorting)
        })

        test('isSortingMetricLoading selector', () => {
            const isLoading = isSortingMetricLoading(mockState as any)
            expect(isLoading).toBe(initialState.sorting.isLoading)
        })

        test('getIntentPagination selector', () => {
            const pagination = getIntentPagination(mockState as any)
            expect(pagination).toEqual(initialState.pagination)
        })

        test('getPaginatedIntents selector', () => {
            const allIntents = [
                {id: 1, intent_name: 'intent1', automation_opportunities: 10},
                {id: 2, intent_name: 'intent2', automation_opportunities: 20},
                {id: 3, intent_name: 'intent3', automation_opportunities: 30},
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
                intent_name: 'order/cancel',
                automation_opportunities: 26,
            },
            {
                id: 2,
                intent_name: 'order/track',
                automation_opportunities: 10,
            },
            {
                id: 3,
                intent_name: 'order/return',
                automation_opportunities: 15,
            },
        ]

        const mockSorting = {
            field: IntentTableColumn.AutomationOpportunities,
            direction: OrderDirection.Desc,
            isLoading: false,
            lastSortingMetric: null,
        }

        const mockSelectorData = {
            data: mockIntents as unknown as Intent[],
            isError: false,
            isFetching: false,
        }

        it('should sort intents in descending order by automation_opportunities', () => {
            const result = getSortedIntents.resultFunc(
                mockSelectorData,
                mockSorting
            )

            expect(result).toEqual([
                {
                    id: 1,
                    intent_name: 'order/cancel',
                    automation_opportunities: 26,
                },
                {
                    id: 3,
                    intent_name: 'order/return',
                    automation_opportunities: 15,
                },
                {
                    id: 2,
                    intent_name: 'order/track',
                    automation_opportunities: 10,
                },
            ])
        })

        it('should sort intents in ascending order by automation_opportunities', () => {
            const ascendingSorting = {
                ...mockSorting,
                direction: OrderDirection.Asc,
            }

            const result = getSortedIntents.resultFunc(
                mockSelectorData,
                ascendingSorting
            )

            expect(result).toEqual([
                {
                    id: 2,
                    intent_name: 'order/track',
                    automation_opportunities: 10,
                },
                {
                    id: 3,
                    intent_name: 'order/return',
                    automation_opportunities: 15,
                },
                {
                    id: 1,
                    intent_name: 'order/cancel',
                    automation_opportunities: 26,
                },
            ])
        })

        it('should return unsorted intents if field is not present in data', () => {
            const invalidSorting = {
                ...mockSorting,
                field: 'non_existing_field' as IntentTableColumn,
            }

            const result = getSortedIntents.resultFunc(
                mockSelectorData,
                invalidSorting
            )

            expect(result).toEqual(mockIntents)
        })
    })
})
