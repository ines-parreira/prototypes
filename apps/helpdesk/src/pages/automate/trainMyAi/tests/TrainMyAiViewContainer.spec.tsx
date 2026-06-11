import { render } from '@repo/testing'
import { screen } from '@testing-library/react'
import { fromJS } from 'immutable'

import { billingState } from 'fixtures/billing'
import { useAiAgentAccess } from 'hooks/aiAgent/useAiAgentAccess'
import type { RootState } from 'state/types'

import { TrainMyAiViewContainer } from '../TrainMyAiViewContainer'

jest.mock('hooks/aiAgent/useAiAgentAccess')
jest.mock('../TrainMyAiView', () => ({
    TrainMyAiView: () => <div>TrainMyAiView</div>,
}))
const mockUseAiAgentAccess = jest.mocked(useAiAgentAccess)
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
    render(<TrainMyAiViewContainer />, {
        path: '/app/automation/:shopType/:shopName/train-my-ai',
        initialEntries: ['/app/automation/shopify/test-shop/train-my-ai'],
        storeState: defaultState,
    })
describe('TrainMyAiViewContainer', () => {
    beforeEach(() => {
        jest.resetAllMocks()
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
