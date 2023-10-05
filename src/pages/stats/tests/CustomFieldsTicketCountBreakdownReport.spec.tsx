import {render} from '@testing-library/react'
import React from 'react'
import {Provider} from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import {CustomFieldsTicketCountBreakdownReport} from 'pages/stats/CustomFieldsTicketCountBreakdownReport'
import {initialState} from 'state/stats/reducers'
import {RootState, StoreDispatch} from 'state/types'
import {initialState as uiStatsInitialState} from 'state/ui/stats/reducer'
import {getSelectedCustomField} from 'state/ui/stats/ticketInsightsSlice'
import {assumeMock} from 'utils/testing'
import {CustomFieldsTicketCountBreakdownTable} from '../CustomFieldsTicketCountBreakdownTable'
import {NoDataAvailable} from '../NoDataAvailable'

const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([thunk])

jest.mock('state/ui/stats/ticketInsightsSlice')
const getSelectedCustomFieldMock = assumeMock(getSelectedCustomField)
jest.mock('pages/stats/CustomFieldsTicketCountBreakdownTable.tsx')
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
            stats: uiStatsInitialState,
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
