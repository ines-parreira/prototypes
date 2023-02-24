import React from 'react'
import {createBrowserHistory} from 'history'
import {act} from '@testing-library/react'
import configureMockStore from 'redux-mock-store'
import {Provider} from 'react-redux'
import {fromJS} from 'immutable'

import {user} from 'fixtures/users'
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

    afterEach(() => {
        window.USER_IMPERSONATED = null
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

    it.only('should make Shopify route available for impersonated admin users', () => {
        window.USER_IMPERSONATED = true

        const {container} = renderWithRouter(
            <Provider store={mockStore({currentUser: fromJS(user)})}>
                <Routes />
            </Provider>,
            {
                history: mockHistory,
            }
        )

        act(() =>
            mockHistory.push(
                '/app/admin/tasks/credit-shopify-billing-integration'
            )
        )

        expect(container).toMatchSnapshot()
    })

    it('should not make Shopify route available for non-impersonated users', () => {
        const {container} = renderWithRouter(<Routes />, {
            history: mockHistory,
        })

        act(() =>
            mockHistory.push(
                '/app/admin/tasks/credit-shopify-billing-integration'
            )
        )

        expect(container).toMatchSnapshot()
    })
})
