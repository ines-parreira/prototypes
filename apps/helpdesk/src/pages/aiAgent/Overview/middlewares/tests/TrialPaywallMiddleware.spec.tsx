import { assumeMock } from '@repo/testing'
import { screen } from '@testing-library/react'

import useAppSelector from 'hooks/useAppSelector'
import type { StoreIntegration } from 'models/integration/types'
import { IntegrationType } from 'models/integration/types'
import useStoreIntegrations from 'pages/automate/common/hooks/useStoreIntegrations'
import { getCurrentAccountState } from 'state/currentAccount/selectors'
import { renderWithStoreAndQueryClientAndRouter } from 'tests/renderWithStoreAndQueryClientAndRouter'

import { TrialPaywallMiddleware } from '../TrialPaywallMiddleware'

jest.mock('hooks/useAppSelector')
jest.mock('pages/automate/common/hooks/useStoreIntegrations')
jest.mock('pages/aiAgent/trial/hooks/useTrialAccess')
jest.mock('pages/aiAgent/AiAgentPaywallView', () => ({
    AiAgentPaywallView: jest.fn(() => <div data-testid="paywall-view"></div>),
}))

jest.mock(
    'pages/aiAgent/components/AIAgentWelcomePageView/AIAgentWelcomePageView',
    () => ({
        AIAgentWelcomePageView: jest.fn(() => (
            <div data-testid="welcome-page-view"></div>
        )),
    }),
)

const useAppSelectorMock = assumeMock(useAppSelector)
const useStoreIntegrationsMock = assumeMock(useStoreIntegrations)

describe('TrialPaywallMiddleware', () => {
    beforeEach(() => {
        jest.clearAllMocks()

        useAppSelectorMock.mockImplementation((selector) => {
            if (selector === getCurrentAccountState) {
                return {
                    get: jest.fn().mockImplementation((key) => {
                        if (key === 'domain') return 'test-domain'
                        return null
                    }),
                }
            }
            return null
        })
    })

    it('should render missing integrations page when there are no integrations', () => {
        useStoreIntegrationsMock.mockReturnValue([])

        renderWithStoreAndQueryClientAndRouter(<TrialPaywallMiddleware />)

        expect(
            screen.getByText('You don’t have a store connected'),
        ).toBeInTheDocument()
    })

    it('should render welcome page when feature flag is enabled and integrations exist', () => {
        useStoreIntegrationsMock.mockReturnValue([
            {
                id: 1,
                name: 'Test Shop',
                type: IntegrationType.Shopify,
            } as StoreIntegration,
        ])

        renderWithStoreAndQueryClientAndRouter(<TrialPaywallMiddleware />)

        expect(screen.getByTestId('welcome-page-view')).toBeInTheDocument()
    })

    it('should use provided shop name when specified', () => {
        const shopName = 'Specified Shop'

        useStoreIntegrationsMock.mockReturnValue([
            {
                id: 1,
                name: 'Test Shop',
                type: IntegrationType.Shopify,
            } as StoreIntegration,
            {
                id: 2,
                name: 'Specified Shop',
                type: IntegrationType.Shopify,
            } as StoreIntegration,
        ])

        renderWithStoreAndQueryClientAndRouter(
            <TrialPaywallMiddleware shopName={shopName} />,
        )

        expect(screen.getByTestId('welcome-page-view')).toBeInTheDocument()
    })

    it('should use first integration when specified shop name is not found', () => {
        const shopName = 'Non-existent Shop'

        useStoreIntegrationsMock.mockReturnValue([
            {
                id: 1,
                name: 'Test Shop',
                type: IntegrationType.Shopify,
            } as StoreIntegration,
            {
                id: 2,
                name: 'Another Shop',
                type: IntegrationType.Shopify,
            } as StoreIntegration,
        ])

        renderWithStoreAndQueryClientAndRouter(
            <TrialPaywallMiddleware shopName={shopName} />,
        )

        expect(screen.getByTestId('welcome-page-view')).toBeInTheDocument()
    })
})
