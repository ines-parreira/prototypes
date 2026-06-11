import type React from 'react'

import { render } from '@repo/testing'
import { screen } from '@testing-library/react'
import { fromJS } from 'immutable'
import { useLocation } from 'react-router-dom'

import { billingState } from 'fixtures/billing'
import type { RootState } from 'state/types'

import { ConnectedChannelsViewContainer } from '../ConnectedChannelsViewContainer'

jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useParams: jest.fn(),
}))

jest.mock('hooks/aiAgent/useAiAgentAccess')

jest.mock('../ConnectedChannelsView', () => ({
    ConnectedChannelsView: () => <div>ConnectedChannelsView</div>,
}))

const defaultState = {
    billing: fromJS(billingState),
} as RootState

const LocationPath = () => {
    const location = useLocation()

    return <div aria-label="Current path">{location.pathname}</div>
}

const renderComponent = (ui: React.ReactElement, { route = '/' } = {}) => {
    return render(
        <>
            <LocationPath />
            {ui}
        </>,
        { initialEntries: [route], storeState: defaultState },
    )
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

        renderComponent(<ConnectedChannelsViewContainer />)

        expect(screen.getByText('ConnectedChannelsView')).toBeInTheDocument()
    })

    it('should redirect to /app/automation/connected-channels when user has no access', () => {
        mockUseAiAgentAccess.mockReturnValue({
            hasAccess: false,
            isLoading: false,
        })

        renderComponent(<ConnectedChannelsViewContainer />, {
            route: '/app/automation/shopify/test-shop/connected-channels',
        })

        expect(screen.getByLabelText('Current path')).toHaveTextContent(
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

        renderComponent(<ConnectedChannelsViewContainer />)

        expect(mockUseAiAgentAccess).toHaveBeenCalledWith('my-custom-shop')
    })

    it('should redirect when access is loading', () => {
        mockUseAiAgentAccess.mockReturnValue({
            hasAccess: false,
            isLoading: true,
        })

        renderComponent(<ConnectedChannelsViewContainer />, {
            route: '/app/automation/shopify/test-shop/connected-channels',
        })

        expect(screen.getByLabelText('Current path')).toHaveTextContent(
            '/app/automation/connected-channels',
        )
    })
})
