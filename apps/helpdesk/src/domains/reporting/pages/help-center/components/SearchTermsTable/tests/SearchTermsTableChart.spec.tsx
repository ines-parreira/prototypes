import React from 'react'

import { assumeMock } from '@repo/testing'
import { render, screen } from '@testing-library/react'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import { SearchTermsTable } from 'domains/reporting/pages/help-center/components/SearchTermsTable/SearchTermsTable'
import { SearchTermsTableChart } from 'domains/reporting/pages/help-center/components/SearchTermsTable/SearchTermsTableChart'
import { useSelectedHelpCenter } from 'domains/reporting/pages/help-center/hooks/useSelectedHelpCenter'

jest.mock('domains/reporting/pages/help-center/hooks/useSelectedHelpCenter')
const useSelectedHelpCenterMock = assumeMock(useSelectedHelpCenter)

jest.mock(
    'domains/reporting/pages/help-center/components/SearchTermsTable/SearchTermsTable',
)
const SearchTermsTableMock = assumeMock(SearchTermsTable)

const mockStore = configureMockStore([thunk])
const store = mockStore({})

const renderComponent = () => {
    render(
        <Provider store={store}>
            <SearchTermsTableChart />
        </Provider>,
    )
}

describe('SearchTermsTableChart', () => {
    const helpCenterDomain = 'acme'
    const statsFilters = {
        period: {
            start_datetime: '2021-05-29T00:00:00+02:00',
            end_datetime: '2021-06-04T23:59:59+02:00',
        },
    }
    beforeEach(() => {
        useSelectedHelpCenterMock.mockReturnValue({
            activeHelpCenters: [],
            helpCenters: [],
            isLoading: false,
            selectedHelpCenter: {} as any,
            sortedHelpCenters: [],
            statsFilters,
            helpCenterId: 123,
            selectedHelpCenterDomain: helpCenterDomain,
        })
        SearchTermsTableMock.mockImplementation(() => <div />)
    })

    it('should render', () => {
        renderComponent()

        expect(
            screen.getByText('Search terms with results'),
        ).toBeInTheDocument()
    })

    it('should render no data state', () => {
        useSelectedHelpCenterMock.mockReturnValue({
            activeHelpCenters: [],
            helpCenters: [],
            isLoading: false,
            selectedHelpCenter: {} as any,
            sortedHelpCenters: [],
            statsFilters,
            helpCenterId: 123,
            selectedHelpCenterDomain: undefined,
        })

        renderComponent()

        expect(screen.getByText('No data available')).toBeInTheDocument()
    })
})
