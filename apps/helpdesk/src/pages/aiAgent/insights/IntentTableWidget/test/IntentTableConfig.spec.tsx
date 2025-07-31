import React from 'react'

import { renderHook } from '@repo/testing'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import useAppSelector from 'hooks/useAppSelector'
import { OrderDirection } from 'models/api/types'
import { isMediumOrSmallScreen } from 'pages/common/utils/mobile'

import {
    getColumnContentAlignment,
    getColumnWidth,
    INTENT_NAME_COLUMN_WIDTH,
    METRIC_COLUMN_WIDTH,
    MOBILE_INTENT_NAME_COLUMN_WIDTH,
    MOBILE_METRIC_COLUMN_WIDTH,
    MOBILE_SUCCESS_RATE_UPLIFT_OPPORTUNITY_COLUMN_WIDTH,
    SUCCESS_RATE_UPLIFT_OPPORTUNITY_COLUMN_WIDTH,
    TableLabels,
    useIntentSortingQuery,
} from '../IntentTableConfig'
import { IntentTableColumn } from '../types'

const mockDispatch = jest.fn()
jest.mock('hooks/useAppDispatch', () => () => mockDispatch)

jest.mock('hooks/useAppSelector', () => jest.fn())
jest.mock('pages/common/utils/mobile')

const mockedIsMediumOrSmallScreen = jest.mocked(isMediumOrSmallScreen)
const useAppSelectorMock = jest.mocked(useAppSelector)

const defaultState = {
    sorting: {
        field: IntentTableColumn.SuccessRateUpliftOpportunity,
        direction: OrderDirection.Desc,
        isLoading: true,
        lastSortingMetric: null,
    },
    pagination: {
        currentPage: 1,
        perPage: 2,
    },
}
const shopName = 'test-shop'
const mockStore = configureMockStore([thunk])

describe('TableConfig Utilities and Hooks', () => {
    describe('getColumnWidth', () => {
        it('returns correct width for IntentName column on large screens', () => {
            mockedIsMediumOrSmallScreen.mockReturnValue(false)
            const columnWidth = getColumnWidth(IntentTableColumn.IntentName)
            expect(columnWidth).toBe(INTENT_NAME_COLUMN_WIDTH)
        })

        it('returns correct width for IntentName column on small screens', () => {
            mockedIsMediumOrSmallScreen.mockReturnValue(true)
            const columnWidth = getColumnWidth(IntentTableColumn.IntentName)
            expect(columnWidth).toBe(MOBILE_INTENT_NAME_COLUMN_WIDTH)
        })

        it('returns correct width for SuccessRateUpliftOpportunity column on large screens', () => {
            mockedIsMediumOrSmallScreen.mockReturnValue(false)
            const columnWidth = getColumnWidth(
                IntentTableColumn.SuccessRateUpliftOpportunity,
            )
            expect(columnWidth).toBe(
                SUCCESS_RATE_UPLIFT_OPPORTUNITY_COLUMN_WIDTH,
            )
        })

        it('returns correct width for SuccessRateUpliftOpportunity column on small screens', () => {
            mockedIsMediumOrSmallScreen.mockReturnValue(true)
            const columnWidth = getColumnWidth(
                IntentTableColumn.SuccessRateUpliftOpportunity,
            )
            expect(columnWidth).toBe(
                MOBILE_SUCCESS_RATE_UPLIFT_OPPORTUNITY_COLUMN_WIDTH,
            )
        })

        it('returns correct width for metric columns (Tickets) on large screens', () => {
            mockedIsMediumOrSmallScreen.mockReturnValue(false)
            const columnWidth = getColumnWidth(IntentTableColumn.Tickets)
            expect(columnWidth).toBe(METRIC_COLUMN_WIDTH)
        })

        it('returns correct width for metric columns (SuccessRate) on large screens', () => {
            mockedIsMediumOrSmallScreen.mockReturnValue(false)
            const columnWidth = getColumnWidth(IntentTableColumn.SuccessRate)
            expect(columnWidth).toBe(METRIC_COLUMN_WIDTH)
        })

        it('returns correct width for metric columns (AvgCustomerSatisfaction) on large screens', () => {
            mockedIsMediumOrSmallScreen.mockReturnValue(false)
            const columnWidth = getColumnWidth(
                IntentTableColumn.AvgCustomerSatisfaction,
            )
            expect(columnWidth).toBe(METRIC_COLUMN_WIDTH)
        })

        it('returns correct width for metric columns (Tickets) on small screens', () => {
            mockedIsMediumOrSmallScreen.mockReturnValue(true)
            const columnWidth = getColumnWidth(IntentTableColumn.Tickets)
            expect(columnWidth).toBe(MOBILE_METRIC_COLUMN_WIDTH)
        })

        it('returns correct width for metric columns (SuccessRate) on small screens', () => {
            mockedIsMediumOrSmallScreen.mockReturnValue(true)
            const columnWidth = getColumnWidth(IntentTableColumn.SuccessRate)
            expect(columnWidth).toBe(MOBILE_METRIC_COLUMN_WIDTH)
        })

        it('returns correct width for metric columns (AvgCustomerSatisfaction) on small screens', () => {
            mockedIsMediumOrSmallScreen.mockReturnValue(true)
            const columnWidth = getColumnWidth(
                IntentTableColumn.AvgCustomerSatisfaction,
            )
            expect(columnWidth).toBe(MOBILE_METRIC_COLUMN_WIDTH)
        })
    })

    describe('TableLabels', () => {
        it('contains correct label for each column', () => {
            expect(TableLabels[IntentTableColumn.IntentName]).toBe('Intent')
            expect(
                TableLabels[IntentTableColumn.SuccessRateUpliftOpportunity],
            ).toBe('Improvement potential')
            expect(TableLabels[IntentTableColumn.Tickets]).toBe('Tickets')
        })
    })

    describe('useIntentSortingQuery', () => {
        it('returns the correct sorting state', () => {
            const column = IntentTableColumn.Tickets
            const mockSorting = { field: column, direction: 'desc' }
            const query = jest.fn()

            useAppSelectorMock.mockReturnValue(mockSorting)

            const { result } = renderHook(
                () => useIntentSortingQuery(column, query, shopName),
                {
                    wrapper: ({ children }) => (
                        <Provider store={mockStore(defaultState)}>
                            {children}
                        </Provider>
                    ),
                },
            )

            expect(result.current.field).toBe(column)
            expect(result.current.direction).toBe('desc')
            expect(result.current.isOrderedBy).toBe(true)
        })
    })

    describe('getColumnContentAlignment', () => {
        it('returns correct alignment for IntentName column', () => {
            const columnAlignment = getColumnContentAlignment(
                IntentTableColumn.IntentName,
            )
            expect(columnAlignment).toBe('left')
        })

        it('returns correct alignment for other columns', () => {
            const columnAlignment = getColumnContentAlignment(
                IntentTableColumn.SuccessRateUpliftOpportunity,
            )
            expect(columnAlignment).toBe('right')
        })
    })
})
