import { FeatureFlagKey, useFlag } from '@repo/feature-flags'
import { screen } from '@testing-library/react'
import { fromJS } from 'immutable'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import { IntegrationType } from '@gorgias/helpdesk-queries'

import { useCanUseAiAgent } from 'hooks/aiAgent/useCanUseAiAgent'
import { useGetOrCreateAccountConfiguration } from 'hooks/aiAgent/useGetOrCreateAccountConfiguration'
import type { ShopifyIntegration } from 'models/integration/types'
import { useInitializePostOnboardingSteps } from 'pages/aiAgent/Overview/hooks/useInitializePostOnboardingSteps'
import { getHasAutomate } from 'state/billing/selectors'
import { renderWithRouter } from 'utils/testing'

import { AiAgentAccountConfigurationProvider } from '../AiAgentAccountConfigurationProvider'

jest.mock('hooks/aiAgent/useGetOrCreateAccountConfiguration')
jest.mock('hooks/aiAgent/useCanUseAiAgent')
jest.mock('pages/aiAgent/Overview/hooks/useInitializePostOnboardingSteps')
jest.mock('pages/aiAgent/Overview/middlewares/TrialPaywallMiddleware', () => ({
    TrialPaywallMiddleware: ({ shopName }: { shopName?: string }) => (
        <div data-testid="trial-paywall-middleware">
            TrialPaywallMiddleware: {shopName}
        </div>
    ),
}))

const mockStore = configureMockStore([thunk])

const MOCK_EMAIL_ADDRESS = 'test@mail.com'

const defaultState = {
    integrations: fromJS({
        integrations: [
            {
                id: 1,
                type: IntegrationType.Email,
                name: 'My email integration',
                meta: {
                    address: MOCK_EMAIL_ADDRESS,
                },
            },
            {
                id: 2,
                type: IntegrationType.Shopify,
                name: 'My Shopify Store',
                meta: {
                    shop_name: 'my-shopify-store',
                },
            },
        ],
    }),
    entities: {
        helpCenter: {
            helpCenters: {
                helpCentersById: {
                    '1': { id: 1, name: 'help center 1', type: 'faq' },
                    '2': { id: 2, name: 'help center 2', type: 'faq' },
                },
            },
        },
    },
    currentAccount: fromJS({
        id: 123,
        domain: 'test-domain',
    }),
}
jest.mock('state/billing/selectors', () => ({
    __esModule: true,
    getHasAutomate: jest.fn(),
}))
const mockGetHasAutomate = jest.mocked(getHasAutomate)

jest.mock('@repo/feature-flags')
const mockUseFlag = jest.mocked(useFlag)

const mockUseCanUseAiAgent = jest.mocked(useCanUseAiAgent)
const mockUseInitializePostOnboardingSteps = jest.mocked(
    useInitializePostOnboardingSteps,
)

const renderComponent = () =>
    renderWithRouter(
        <Provider store={mockStore(defaultState)}>
            <AiAgentAccountConfigurationProvider>
                <div data-testid="children" />
            </AiAgentAccountConfigurationProvider>
        </Provider>,
    )

describe('AiAgentAccountConfigurationProvider', () => {
    const mockUseGetOrCreateAccountConfiguration =
        useGetOrCreateAccountConfiguration as jest.MockedFunction<
            typeof useGetOrCreateAccountConfiguration
        >

    beforeEach(() => {
        jest.resetAllMocks()
        mockUseFlag.mockReturnValue(false)
        mockUseCanUseAiAgent.mockReturnValue({
            storeIntegration: undefined,
            isCurrentStoreDuringTrial: false,
            hasAnyActiveTrial: false,
            isLoading: false,
            isError: false,
        })
        mockUseGetOrCreateAccountConfiguration.mockReturnValue({
            status: 'success',
        } as any)
        mockUseInitializePostOnboardingSteps.mockReturnValue({
            isLoading: false,
        })
    })

    it('should render if automate and load successs', () => {
        mockGetHasAutomate.mockReturnValue(true)

        mockUseGetOrCreateAccountConfiguration.mockReturnValue({
            status: 'success',
        } as any)
        renderComponent()

        expect(screen.getByTestId('children')).toBeInTheDocument()
    })

    it('should render if not automate but feature flag and load successs', () => {
        mockGetHasAutomate.mockReturnValue(false)
        mockUseFlag.mockImplementation(
            (key) => FeatureFlagKey.AIAgentPreviewModeAllowed === key || false,
        )

        mockUseGetOrCreateAccountConfiguration.mockReturnValue({
            status: 'success',
        } as any)
        renderComponent()

        expect(screen.getByTestId('children')).toBeInTheDocument()
    })

    it('should render Loader when accountConfigRetrievalStatus is loading with automate', () => {
        mockUseGetOrCreateAccountConfiguration.mockReturnValue({
            status: 'loading',
        } as any)
        mockGetHasAutomate.mockReturnValue(true)

        renderComponent()
        expect(
            screen.getByText('We’re preparing your space...'),
        ).toBeInTheDocument()
    })

    it('should redirect to "/app/automation" when error', () => {
        mockUseGetOrCreateAccountConfiguration.mockReturnValue({
            status: 'error',
        } as any)
        mockGetHasAutomate.mockReturnValue(false)

        renderComponent()
    })

    it('should redirect to "/app/automation" when not automate and no FF', () => {
        mockGetHasAutomate.mockReturnValue(false)

        mockUseGetOrCreateAccountConfiguration.mockReturnValue({
            status: 'error',
        } as any)

        renderComponent()
    })

    it('should render children when not automate but during trial', () => {
        mockGetHasAutomate.mockReturnValue(false)
        mockUseCanUseAiAgent.mockReturnValue({
            storeIntegration: undefined,
            isCurrentStoreDuringTrial: true,
            hasAnyActiveTrial: true,
            isLoading: false,
            isError: false,
        })

        renderComponent()

        expect(screen.getByTestId('children')).toBeInTheDocument()
    })

    it('should render AIAgentWelcomePageView when not automate but expanding trial experience enabled with store integration', () => {
        mockGetHasAutomate.mockReturnValue(false)
        mockUseFlag.mockImplementation(
            (key) =>
                key === FeatureFlagKey.AiAgentExpandingTrialExperienceForAll ||
                false,
        )
        mockUseCanUseAiAgent.mockReturnValue({
            storeIntegration: {
                id: 123,
                type: IntegrationType.Shopify,
                meta: {
                    shop_name: 'Test Store',
                },
            } as ShopifyIntegration,
            isCurrentStoreDuringTrial: false,
            hasAnyActiveTrial: false,
            isLoading: false,
            isError: false,
        })

        renderComponent()

        expect(
            screen.getByTestId('trial-paywall-middleware'),
        ).toBeInTheDocument()
        expect(
            screen.getByText('TrialPaywallMiddleware: Test Store'),
        ).toBeInTheDocument()
        expect(screen.queryByTestId('children')).not.toBeInTheDocument()
    })

    it('should render loader when feature flag is loading', () => {
        mockUseFlag.mockImplementation((key) =>
            key === FeatureFlagKey.AiAgentExpandingTrialExperienceForAll
                ? 'loading_state'
                : false,
        )

        renderComponent()

        expect(
            screen.getByText('We’re preparing your space...'),
        ).toBeInTheDocument()
    })

    it('should render loader when trial check is loading', () => {
        mockUseCanUseAiAgent.mockReturnValue({
            storeIntegration: undefined,
            isCurrentStoreDuringTrial: false,
            hasAnyActiveTrial: false,
            isLoading: true,
            isError: false,
        })

        renderComponent()

        expect(
            screen.getByText('We’re preparing your space...'),
        ).toBeInTheDocument()
    })

    it('should render loader when post onboarding steps are loading', () => {
        mockGetHasAutomate.mockReturnValue(true)
        mockUseInitializePostOnboardingSteps.mockReturnValue({
            isLoading: true,
        })

        renderComponent()

        expect(
            screen.getByText('We’re preparing your space...'),
        ).toBeInTheDocument()
    })
})
