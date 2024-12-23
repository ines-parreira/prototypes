import {renderHook} from '@testing-library/react-hooks'
import React from 'react'
import {Provider} from 'react-redux'

import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import useAppSelector from 'hooks/useAppSelector'
import {OrderDirection} from 'models/api/types'
import {isMediumOrSmallScreen} from 'pages/common/utils/mobile'

import {
    useIntentSoringQuery,
    getColumnWidth,
    TableLabels,
    INTENT_NAME_COLUMN_WIDTH,
    MOBILE_INTENT_NAME_COLUMN_WIDTH,
} from '../IntentTableConfig'
import {IntentTableColumn} from '../types'

const mockDispatch = jest.fn()
jest.mock('hooks/useAppDispatch', () => () => mockDispatch)

jest.mock('hooks/useAppSelector', () => jest.fn())
jest.mock('pages/common/utils/mobile')

const mockedIsMediumOrSmallScreen = jest.mocked(isMediumOrSmallScreen)
const useAppSelectorMock = jest.mocked(useAppSelector)

const defaultState = {
    sorting: {
        field: IntentTableColumn.AutomationOpportunities,
        direction: OrderDirection.Desc,
        isLoading: true,
        lastSortingMetric: null,
    },
    pagination: {
        currentPage: 1,
        perPage: 2,
    },
}
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
    })

    describe('TableLabels', () => {
        it('contains correct label for each column', () => {
            expect(TableLabels[IntentTableColumn.IntentName]).toBe('Intent')
            expect(TableLabels[IntentTableColumn.AutomationOpportunities]).toBe(
                'Automation opportunity'
            )
            expect(TableLabels[IntentTableColumn.Tickets]).toBe('Tickets')
        })
    })

    describe('useIntentSoringQuery', () => {
        it('returns the correct sorting state', () => {
            const column = IntentTableColumn.Tickets
            const mockSorting = {field: column, direction: 'desc'}
            const query = jest.fn()

            useAppSelectorMock.mockReturnValue(mockSorting)

            const {result} = renderHook(
                () => useIntentSoringQuery(column, query),
                {
                    wrapper: ({children}) => (
                        <Provider store={mockStore(defaultState)}>
                            {children}
                        </Provider>
                    ),
                }
            )

            expect(result.current.field).toBe(column)
            expect(result.current.direction).toBe('desc')
            expect(result.current.isOrderedBy).toBe(true)
        })
    })
})
