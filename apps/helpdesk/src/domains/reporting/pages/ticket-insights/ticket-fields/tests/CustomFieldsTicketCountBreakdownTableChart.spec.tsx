import React from 'react'

import { assumeMock } from '@repo/testing'
import { render } from '@testing-library/react'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import { NoDataAvailable } from 'domains/reporting/pages/common/components/NoDataAvailable'
import { CustomFieldsTicketCountBreakdownTable } from 'domains/reporting/pages/ticket-insights/ticket-fields/CustomFieldsTicketCountBreakdownTable'
import { CustomFieldsTicketCountBreakdownTableChart } from 'domains/reporting/pages/ticket-insights/ticket-fields/CustomFieldsTicketCountBreakdownTableChart'
import { initialState } from 'domains/reporting/state/stats/statsSlice'
import { initialState as uiFiltersInitialState } from 'domains/reporting/state/ui/stats/filtersSlice'
import { getSelectedCustomField } from 'domains/reporting/state/ui/stats/ticketInsightsSlice'
import { RootState, StoreDispatch } from 'state/types'

const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([thunk])

jest.mock('domains/reporting/state/ui/stats/ticketInsightsSlice')
const getSelectedCustomFieldMock = assumeMock(getSelectedCustomField)
jest.mock(
    'domains/reporting/pages/ticket-insights/ticket-fields/CustomFieldsTicketCountBreakdownTable.tsx',
)
const CustomFieldsTicketCountBreakdownTableMock = assumeMock(
    CustomFieldsTicketCountBreakdownTable,
)
jest.mock('domains/reporting/pages/common/components/NoDataAvailable')
const NoDataAvailableMock = assumeMock(NoDataAvailable)
const componentMock = () => <div />

describe('<CustomFieldsTicketCountBreakdownReport />', () => {
    const defaultState = {
        stats: initialState,
        ui: {
            stats: { filters: uiFiltersInitialState },
        },
    } as RootState

    beforeEach(() => {
        NoDataAvailableMock.mockImplementation(componentMock)
        CustomFieldsTicketCountBreakdownTableMock.mockImplementation(
            componentMock,
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
                <CustomFieldsTicketCountBreakdownTableChart />
            </Provider>,
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
                <CustomFieldsTicketCountBreakdownTableChart />
            </Provider>,
        )

        expect(NoDataAvailableMock).toHaveBeenCalled()
        expect(CustomFieldsTicketCountBreakdownTableMock).not.toHaveBeenCalled()
    })
})
