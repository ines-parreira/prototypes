import {render, screen} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'
import {Provider} from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import {useNoSearchResultsMetrics} from '../../../hooks/useNoSearchResultsMetrics'
import NoSearchTable from '../NoSearchTable'

jest.mock('../../../hooks/useNoSearchResultsMetrics', () => ({
    useNoSearchResultsMetrics: jest.fn(),
}))

const mockUseNoSearchResultsMetrics = jest.mocked(useNoSearchResultsMetrics)

const mockStore = configureMockStore([thunk])
const store = mockStore({})

const renderComponent = () => {
    render(
        <Provider store={store}>
            <NoSearchTable
                statsFilters={{
                    period: {
                        start_datetime: '2021-05-29T00:00:00+02:00',
                        end_datetime: '2021-06-04T23:59:59+02:00',
                    },
                }}
                timezone="US"
            />
        </Provider>
    )
}

describe('<NoSearchTable/>', () => {
    beforeEach(() => {
        mockUseNoSearchResultsMetrics.mockReturnValue({
            data: [],
            isLoading: false,
            total: 0,
        })
    })

    it('should render', () => {
        renderComponent()
        expect(screen.getByText('No search results')).toBeInTheDocument()
    })

    it('should render no data state', () => {
        renderComponent()
        expect(screen.getByText('No data available')).toBeInTheDocument()
    })

    it('should paginate to the next page', () => {
        mockUseNoSearchResultsMetrics.mockReturnValue({
            data: [[]],
            isLoading: false,
            total: 40,
        })

        renderComponent()

        expect(screen.getByText('1')).toHaveAttribute('aria-current', 'true')
        expect(screen.getByText('2')).toHaveAttribute('aria-current', 'false')

        userEvent.click(screen.getByText('2'))

        expect(screen.getByText('1')).toHaveAttribute('aria-current', 'false')
        expect(screen.getByText('2')).toHaveAttribute('aria-current', 'true')
    })
})
