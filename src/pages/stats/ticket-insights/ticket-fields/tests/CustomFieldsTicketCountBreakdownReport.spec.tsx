import {render} from '@testing-library/react'
import React from 'react'
import {Provider} from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import {CustomFieldsTicketCountBreakdownReport} from 'pages/stats/ticket-insights/ticket-fields/CustomFieldsTicketCountBreakdownReport'
import {initialState} from 'state/stats/statsSlice'
import {RootState, StoreDispatch} from 'state/types'
import {initialState as uiFiltersInitialState} from 'state/ui/stats/filtersSlice'
import {getSelectedCustomField} from 'state/ui/stats/ticketInsightsSlice'
import {assumeMock} from 'utils/testing'
import {CustomFieldsTicketCountBreakdownTable} from 'pages/stats/ticket-insights/ticket-fields/CustomFieldsTicketCountBreakdownTable'
import {NoDataAvailable} from 'pages/stats/NoDataAvailable'

const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([thunk])

jest.mock('state/ui/stats/ticketInsightsSlice')
const getSelectedCustomFieldMock = assumeMock(getSelectedCustomField)
jest.mock(
    'pages/stats/ticket-insights/ticket-fields/CustomFieldsTicketCountBreakdownTable.tsx'
)
const CustomFieldsTicketCountBreakdownTableMock = assumeMock(
    CustomFieldsTicketCountBreakdownTable
)
jest.mock('pages/stats/NoDataAvailable')
const NoDataAvailableMock = assumeMock(NoDataAvailable)
const componentMock = () => <div />

describe('<CustomFieldsTicketCountBreakdownReport />', () => {
    const defaultState = {
        stats: initialState,
        ui: {
            stats: {filters: uiFiltersInitialState},
        },
    } as RootState

    beforeEach(() => {
        NoDataAvailableMock.mockImplementation(componentMock)
        CustomFieldsTicketCountBreakdownTableMock.mockImplementation(
            componentMock
        )
    })

    it('should render CustomFieldsTicketCountBreakdownTable when custom field id is available', () => {
        getSelectedCustomFieldMock.mockReturnValue({
            id: 123,
            label: 'someLabel',
            isLoading: false,
        })

        render(
            <Provider store={mockStore(defaultState)}>
                <CustomFieldsTicketCountBreakdownReport />
            </Provider>
        )

        expect(CustomFieldsTicketCountBreakdownTableMock).toHaveBeenCalled()
        expect(NoDataAvailableMock).not.toHaveBeenCalled()
    })

    it('should render NoData when custom field id is not available', () => {
        getSelectedCustomFieldMock.mockReturnValue({
            id: null,
            label: '',
            isLoading: false,
        })

        render(
            <Provider store={mockStore(defaultState)}>
                <CustomFieldsTicketCountBreakdownReport />
            </Provider>
        )

        expect(NoDataAvailableMock).toHaveBeenCalled()
        expect(CustomFieldsTicketCountBreakdownTableMock).not.toHaveBeenCalled()
    })
})
