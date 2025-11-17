import { QueryClientProvider } from '@tanstack/react-query'
import { screen } from '@testing-library/react'
import { fromJS } from 'immutable'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import { billingState } from 'fixtures/billing'
import { useAiAgentAccess } from 'hooks/aiAgent/useAiAgentAccess'
import type { RootState, StoreDispatch } from 'state/types'
import { mockQueryClient } from 'tests/reactQueryTestingUtils'
import { renderWithRouter } from 'utils/testing'

import TrainMyAiViewContainer from '../TrainMyAiViewContainer'

jest.mock('hooks/aiAgent/useAiAgentAccess')
jest.mock('../TrainMyAiView', () => () => <div>TrainMyAiView</div>)
jest.mock('launchdarkly-react-client-sdk')

const mockUseAiAgentAccess = jest.mocked(useAiAgentAccess)
const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([thunk])
const queryClient = mockQueryClient()

const defaultState = {
    billing: fromJS(billingState),
    integrations: fromJS({
        integrations: [
            { type: 'email', meta: { address: 'test@gorgias.com' } },
        ],
    }),
    entities: {
        chatsApplicationAutomationSettings: {},
    },
} as RootState

const renderComponent = () =>
    renderWithRouter(
        <Provider store={mockStore(defaultState)}>
            <QueryClientProvider client={queryClient}>
                <TrainMyAiViewContainer />
            </QueryClientProvider>
        </Provider>,
        {
            path: '/app/automation/:shopType/:shopName/train-my-ai',
            route: '/app/automation/shopify/test-shop/train-my-ai',
        },
    )

describe('TrainMyAiViewContainer', () => {
    beforeEach(() => {
        jest.resetAllMocks()
        jest.requireMock(
            'launchdarkly-react-client-sdk',
        ).useFlags.mockReturnValue({})
    })

    it('should render TrainMyAiView when user has access', () => {
        mockUseAiAgentAccess.mockReturnValue({
            hasAccess: true,
            isLoading: false,
        })

        renderComponent()

        expect(screen.getByText('TrainMyAiView')).toBeInTheDocument()
    })

    it('should render AutomatePaywallView when user has no access', () => {
        mockUseAiAgentAccess.mockReturnValue({
            hasAccess: false,
            isLoading: false,
        })

        renderComponent()

        expect(screen.queryByText('TrainMyAiView')).not.toBeInTheDocument()
        expect(
            screen.getByRole('button', { name: /Select plan to get started/ }),
        ).toBeInTheDocument()
    })
})
