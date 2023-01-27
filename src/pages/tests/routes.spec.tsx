import React from 'react'
import {createBrowserHistory} from 'history'
import {act} from '@testing-library/react'
import configureMockStore from 'redux-mock-store'
import {Provider} from 'react-redux'

import {logPageChange} from 'store/middlewares/segmentTracker'
import {assumeMock, renderWithRouter} from 'utils/testing'

import Routes from '../routes'

jest.mock('store/middlewares/segmentTracker')
const logPageMock = assumeMock(logPageChange)

jest.mock('pages/App', () => () => <div>App</div>)
jest.mock('pages/stats/DefaultStatsFilters', () => () => (
    <div>Default stats filters</div>
))

const mockHistory = createBrowserHistory()
const mockStore = configureMockStore()

describe('<Routes/>', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        mockHistory.replace('/app')
    })

    it('should not log page change via segment on initial render', () => {
        renderWithRouter(<Routes />, {history: mockHistory})
        expect(logPageMock).not.toHaveBeenCalled()
    })

    it('should not log page change after location change', () => {
        renderWithRouter(<Routes />, {
            history: mockHistory,
        })

        act(() => mockHistory.push('/app/settings/profile'))

        expect(logPageMock).not.toHaveBeenCalled()
    })

    it('should log page change after location change to the stats page', () => {
        renderWithRouter(
            <Provider store={mockStore({})}>
                <Routes />
            </Provider>,
            {
                history: mockHistory,
            }
        )

        act(() => mockHistory.push('/app/stats/live-overview'))

        expect(logPageMock).toHaveBeenCalledTimes(1)
    })
})
