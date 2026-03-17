import type React from 'react'

import { render, screen } from '@testing-library/react'
import { createMemoryHistory } from 'history'
import { fromJS } from 'immutable'
import { Provider } from 'react-redux'
import { Router } from 'react-router-dom'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import { billingState } from 'fixtures/billing'
import type { RootState } from 'state/types'

import { ConnectedChannelsViewContainerRevamp as ConnectedChannelsViewContainer } from '../ConnectedChannelsViewContainer'

jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useParams: jest.fn(),
}))

jest.mock('hooks/aiAgent/useAiAgentAccess')

jest.mock('../ConnectedChannelsView', () => ({
    ConnectedChannelsView: () => <div>ConnectedChannelsView</div>,
}))

const mockStore = configureMockStore([thunk])

const defaultState = {
    billing: fromJS(billingState),
} as RootState

const mockedStore = mockStore(defaultState)

const renderWithRouter = (ui: React.ReactElement, { route = '/' } = {}) => {
    const history = createMemoryHistory({ initialEntries: [route] })
    return {
        ...render(
            <Provider store={mockedStore}>
                <Router history={history}>{ui}</Router>
            </Provider>,
        ),
        history,
    }
}

describe('ConnectedChannelsViewContainer', () => {
    const mockUseParams = jest.requireMock('react-router-dom').useParams
    const mockUseAiAgentAccess = jest.requireMock(
        'hooks/aiAgent/useAiAgentAccess',
    ).useAiAgentAccess

    beforeEach(() => {
        jest.clearAllMocks()
        mockUseParams.mockReturnValue({
            shopName: 'test-shop',
        })
    })

    it('should render ConnectedChannelsView when user has access', () => {
        mockUseAiAgentAccess.mockReturnValue({
            hasAccess: true,
            isLoading: false,
        })

        renderWithRouter(<ConnectedChannelsViewContainer />)

        expect(screen.getByText('ConnectedChannelsView')).toBeInTheDocument()
    })

    it('should redirect to /app/automation/connected-channels when user has no access', () => {
        mockUseAiAgentAccess.mockReturnValue({
            hasAccess: false,
            isLoading: false,
        })

        const { history } = renderWithRouter(
            <ConnectedChannelsViewContainer />,
            {
                route: '/app/automation/shopify/test-shop/connected-channels',
            },
        )

        expect(history.location.pathname).toBe(
            '/app/automation/connected-channels',
        )
    })

    it('should pass shopName from URL params to useAiAgentAccess', () => {
        mockUseParams.mockReturnValue({
            shopName: 'my-custom-shop',
        })
        mockUseAiAgentAccess.mockReturnValue({
            hasAccess: true,
            isLoading: false,
        })

        renderWithRouter(<ConnectedChannelsViewContainer />)

        expect(mockUseAiAgentAccess).toHaveBeenCalledWith('my-custom-shop')
    })

    it('should redirect when access is loading and hasAccess is false', () => {
        mockUseAiAgentAccess.mockReturnValue({
            hasAccess: false,
            isLoading: true,
        })

        const { history } = renderWithRouter(
            <ConnectedChannelsViewContainer />,
            {
                route: '/app/automation/shopify/test-shop/connected-channels',
            },
        )

        expect(history.location.pathname).toBe(
            '/app/automation/connected-channels',
        )
    })
})
