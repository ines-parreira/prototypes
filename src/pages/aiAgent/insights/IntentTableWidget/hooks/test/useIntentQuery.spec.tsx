import React from 'react'

import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import { OrderDirection } from 'models/api/types'
import { act, renderHook } from 'utils/testing/renderHook'

import { IntentTableColumn } from '../../types'
import { useIntentQuery } from '../useIntentQuery'

jest.mock('hooks/reporting/support-performance/useStatsFilters', () => ({
    useStatsFilters: jest.fn().mockReturnValue({
        cleanStatsFilters: { period: { from: '2025-01-01', to: '2025-01-31' } },
        userTimezone: 'UTC',
    }),
}))

jest.mock('hooks/reporting/automate/useAIAgentInsightsDataset', () => ({
    useAIAgentInsightsDataset: jest.fn().mockReturnValue({
        data: [{ id: '1', name: 'Test Intent' }],
        isFetching: false,
    }),
}))

const mockStore = configureMockStore([thunk])
const defaultState = {}

describe('useIntentQuery', () => {
    const shopName = 'test-shop'
    const intentId = 'test-intent-id'
    const intentLevel = 2
    const column = IntentTableColumn.SuccessRateUpliftOpportunity

    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('should return correct initial state', () => {
        const { result } = renderHook(
            () => useIntentQuery(column, shopName, intentId, intentLevel),
            {
                wrapper: ({ children }) => (
                    <Provider store={mockStore(defaultState)}>
                        {children}
                    </Provider>
                ),
            },
        )

        expect(result.current.field).toBe(column)
        expect(result.current.direction).toBe(OrderDirection.Desc)
        expect(result.current.isOrderedBy).toBe(true)
        expect(result.current.isLoading).toBe(false)
        expect(result.current.data).toEqual([{ id: '1', name: 'Test Intent' }])
    })

    it('should toggle direction when sortCallback is called', () => {
        const { result } = renderHook(
            () => useIntentQuery(column, shopName, intentId, intentLevel),
            {
                wrapper: ({ children }) => (
                    <Provider store={mockStore(defaultState)}>
                        {children}
                    </Provider>
                ),
            },
        )

        expect(result.current.direction).toBe(OrderDirection.Desc)

        act(() => {
            result.current.sortCallback()
        })
        expect(result.current.direction).toBe(OrderDirection.Asc)

        act(() => {
            result.current.sortCallback()
        })
        expect(result.current.direction).toBe(OrderDirection.Desc)
    })

    it('should not fetch data when enabled is false', () => {
        const { result } = renderHook(
            () =>
                useIntentQuery(column, shopName, intentId, intentLevel, false),
            {
                wrapper: ({ children }) => (
                    <Provider store={mockStore(defaultState)}>
                        {children}
                    </Provider>
                ),
            },
        )

        expect(result.current.isLoading).toBe(false)
        expect(result.current.data).toBeNull()
    })
})
