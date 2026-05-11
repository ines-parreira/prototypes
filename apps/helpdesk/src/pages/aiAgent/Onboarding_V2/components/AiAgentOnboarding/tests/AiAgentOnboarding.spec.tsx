import type React from 'react'

import { useFlag } from '@repo/feature-flags'
import { assumeMock, render } from '@repo/testing'
import { QueryClient } from '@tanstack/react-query'
import { act, screen, waitFor } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import type { Map } from 'immutable'
import { fromJS } from 'immutable'
import { useLocation } from 'react-router-dom'

import type { TimeSeriesResult } from 'domains/reporting/hooks/useTimeSeries'
import { useAverageOrdersPerDayTrend } from 'domains/reporting/pages/automate/aiSalesAgent/useAverageOrdersPerDayTrend'
import { account } from 'fixtures/account'
import { billingState } from 'fixtures/billing'
import { chatIntegrationFixtures } from 'fixtures/chat'
import { integrationsState, shopifyIntegration } from 'fixtures/integrations'
import { AiAgentOnboarding } from 'pages/aiAgent/Onboarding_V2/components/AiAgentOnboarding/AiAgentOnboarding'
import { DiscountStrategy } from 'pages/aiAgent/Onboarding_V2/components/steps/PersonalityStep/DiscountStrategy'
import { PersuasionLevel } from 'pages/aiAgent/Onboarding_V2/components/steps/PersonalityStep/PersuasionLevel'
import { useTopProducts } from 'pages/aiAgent/Onboarding_V2/components/TopProductsCard/hooks'
import { useAiAgentScopesForAutomationPlan } from 'pages/aiAgent/Onboarding_V2/hooks/useAiAgentScopesForAutomationPlan'
import { useGetOnboardingData } from 'pages/aiAgent/Onboarding_V2/hooks/useGetOnboardingData'
import {
    AiAgentScopes,
    WizardStepEnum,
} from 'pages/aiAgent/Onboarding_V2/types'
import { useShopifyIntegrationAndScope } from 'pages/common/hooks/useShopifyIntegrationAndScope'
import { useEmailIntegrations } from 'pages/settings/contactForm/hooks/useEmailIntegrations'
import type { RootState } from 'state/types'

const defaultState = {
    currentAccount: fromJS(account),
    billing: fromJS(billingState),
    integrations: (fromJS(integrationsState) as Map<any, any>).mergeDeep({
        integrations: [shopifyIntegration, ...chatIntegrationFixtures],
    }),
} as RootState
// Mock the hooks
jest.mock('pages/common/hooks/useShopifyIntegrationAndScope')
jest.mock('pages/settings/contactForm/hooks/useEmailIntegrations')
jest.mock(
    'pages/integrations/integration/components/gorgias_chat/legacy/GorgiasChatIntegrationPreview/ChatIntegrationPreview',
    () => ({
        __esModule: true,
        default: ({ children }: { children?: React.ReactNode }) => (
            <div>{children}</div>
        ),
    }),
)
jest.mock(
    'pages/aiAgent/Onboarding_V2/components/AiAgentChatConversation/AiAgentChatConversation',
    () => ({
        __esModule: true,
        default: () => <div>AI Agent Preview</div>,
    }),
)
jest.mock('pages/aiAgent/Onboarding_V2/hooks/useGetOnboardingData', () => ({
    useGetOnboardingData: jest.fn(),
}))
jest.mock('pages/aiAgent/Onboarding_V2/components/TopProductsCard/hooks')
const useTopProductsMock = assumeMock(useTopProducts)
jest.mock(
    'domains/reporting/pages/automate/aiSalesAgent/useAverageOrdersPerDayTrend',
)
const useAverageOrdersPerDayTrendMock = assumeMock(useAverageOrdersPerDayTrend)
jest.mock('@repo/feature-flags', () => ({
    ...jest.requireActual('@repo/feature-flags'),
    useFlag: jest.fn(),
    useFlagWithLoading: jest
        .fn()
        .mockReturnValue({ value: false, isLoading: false }),
}))
useAverageOrdersPerDayTrendMock.mockReturnValue({
    data: undefined,
    isFetching: false,
    isError: false,
} as unknown as TimeSeriesResult)
const mockUseFlag = jest.mocked(useFlag)
const mockUseShopifyIntegrationAndScope =
    useShopifyIntegrationAndScope as jest.Mock
const mockUseEmailIntegrations = useEmailIntegrations as jest.Mock
const mockUseGetOnboardingData = useGetOnboardingData as jest.Mock
jest.mock('pages/aiAgent/Onboarding_V2/hooks/useAiAgentScopesForAutomationPlan')
const useAiAgentScopesForAutomationPlanMock = assumeMock(
    useAiAgentScopesForAutomationPlan,
)
const testQueryClient = new QueryClient({
    defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
    },
})

const LocationPath = () => {
    const location = useLocation()

    return (
        <>
            <div data-testid="current-path">{location.pathname}</div>
            <div data-testid="current-search">{location.search}</div>
        </>
    )
}

const renderComponent = (
    initialRoute = '/app/ai-agent/onboarding/shopify integration',
    defaultPath = '/app/ai-agent/onboarding/:step',
) => {
    return render(
        <>
            <AiAgentOnboarding />
            <LocationPath />
        </>,
        {
            initialEntries: [initialRoute],
            path: defaultPath,
            storeState: defaultState,
        },
    )
}
describe('AiAgentOnboarding', () => {
    const user = userEvent.setup({
        advanceTimers: jest.advanceTimersByTime,
    })
    beforeEach(() => {
        testQueryClient.clear()
        // Populate the return values of the mocked hooks
        mockUseShopifyIntegrationAndScope.mockReturnValue({
            integration: null,
        })
        mockUseEmailIntegrations.mockReturnValue({
            emailIntegrations: true,
            defaultIntegration: true,
        })
        mockUseGetOnboardingData.mockReturnValue({
            data: {
                id: 1,
                salesPersuasionLevel: PersuasionLevel.Moderate,
                salesDiscountStrategyLevel: DiscountStrategy.Balanced,
                salesDiscountMax: 0.8,
                scopes: [AiAgentScopes.SUPPORT, AiAgentScopes.SALES],
                shopName: shopifyIntegration.meta.shop_name,
            },
        })
        useTopProductsMock.mockReturnValue({
            isLoading: false,
            data: [],
        })
        mockUseFlag.mockReturnValue(false)
        useAiAgentScopesForAutomationPlanMock.mockReturnValue([
            AiAgentScopes.SUPPORT,
            AiAgentScopes.SALES,
        ])
    })
    beforeAll(() => {
        jest.useFakeTimers()
    })
    afterAll(() => {
        jest.useRealTimers()
    })
    it('renders the Onboarding component', () => {
        renderComponent()
        jest.runAllTimers()
        expect(
            screen.getByRole('heading', {
                name: /First, let.s connect your Shopify account/i,
            }),
        ).toBeInTheDocument()
    })
    it('should keep user on onboarding even if feature flag is disabled', () => {
        mockUseFlag.mockReturnValue(false)
        renderComponent()
        jest.runAllTimers()
        expect(screen.getByTestId('current-path')).toHaveTextContent(
            '/app/ai-agent/onboarding',
        )
    })
    it('should navigate to the next step when Next button is clicked', async () => {
        renderComponent(
            `/app/ai-agent/shopify/shopify-store/onboarding/${WizardStepEnum.SHOPIFY_INTEGRATION}`,
            '/app/ai-agent/:shopType/:shopName/onboarding/:step',
        )
        jest.runAllTimers()
        await waitFor(() => {
            expect(
                screen.getByRole('heading', {
                    name: /First, let.s connect your Shopify account/i,
                }),
            ).toBeInTheDocument()
        })
        // Click Next
        await act(() =>
            user.click(
                screen.getByRole('button', {
                    name: /Next/i,
                }),
            ),
        )
        await waitFor(() => {
            expect(screen.getByTestId('current-path')).toHaveTextContent(
                WizardStepEnum.TONE_OF_VOICE,
            )
        })
    })
    it('should navigate to the previous step when Back button is clicked', async () => {
        renderComponent(
            `/app/ai-agent/shopify/shopify-store/onboarding/${WizardStepEnum.KNOWLEDGE}`,
            '/app/ai-agent/:shopType/:shopName/onboarding/:step',
        )
        jest.runAllTimers()
        await waitFor(() => {
            expect(
                screen.getByRole('heading', {
                    name: /AI Agent is syncing your knowledge sources/i,
                }),
            ).toBeInTheDocument()
        })
        // Click Back
        await act(() => user.click(screen.getByText(/Back/i)))
        await waitFor(() => {
            expect(screen.getByTestId('current-path')).toHaveTextContent(
                WizardStepEnum.ENGAGEMENT,
            )
        })
    })
    it('should preserve shop context when current step is invalid', async () => {
        mockUseShopifyIntegrationAndScope.mockReturnValue({
            integration: null,
        })
        renderComponent(
            '/app/ai-agent/shopify/shopify-store/onboarding/invalid-step',
            '/app/ai-agent/:shopType/:shopName/onboarding/:step',
        )
        await waitFor(() => {
            expect(screen.getByTestId('current-path')).toHaveTextContent(
                `/app/ai-agent/shopify/shopify-store/onboarding/${WizardStepEnum.SHOPIFY_INTEGRATION}`,
            )
        })
    })

    describe('?jtbd= URL parameter', () => {
        it('preserves ?jtbd= when navigating to next step', async () => {
            renderComponent(
                `/app/ai-agent/shopify/shopify-store/onboarding/${WizardStepEnum.SHOPIFY_INTEGRATION}?jtbd=sales`,
                '/app/ai-agent/:shopType/:shopName/onboarding/:step',
            )
            jest.runAllTimers()

            await waitFor(() => {
                expect(
                    screen.getByRole('heading', {
                        name: /First, let.s connect your Shopify account/i,
                    }),
                ).toBeInTheDocument()
            })

            await act(() =>
                user.click(screen.getByRole('button', { name: /Next/i })),
            )

            await waitFor(() => {
                expect(screen.getByTestId('current-path')).toHaveTextContent(
                    WizardStepEnum.TONE_OF_VOICE,
                )
            })
            expect(screen.getByTestId('current-search')).toHaveTextContent(
                '?jtbd=sales',
            )
        })

        it('preserves ?jtbd= when navigating back', async () => {
            renderComponent(
                `/app/ai-agent/shopify/shopify-store/onboarding/${WizardStepEnum.KNOWLEDGE}?jtbd=sales`,
                '/app/ai-agent/:shopType/:shopName/onboarding/:step',
            )
            jest.runAllTimers()

            await waitFor(() => {
                expect(
                    screen.getByRole('heading', {
                        name: /AI Agent is syncing your knowledge sources/i,
                    }),
                ).toBeInTheDocument()
            })

            await act(() => user.click(screen.getByText(/Back/i)))

            await waitFor(() => {
                expect(screen.getByTestId('current-path')).toHaveTextContent(
                    WizardStepEnum.ENGAGEMENT,
                )
            })
            expect(screen.getByTestId('current-search')).toHaveTextContent(
                '?jtbd=sales',
            )
        })

        it('preserves ?jtbd= when redirecting from an invalid step', async () => {
            mockUseShopifyIntegrationAndScope.mockReturnValue({
                integration: null,
            })
            renderComponent(
                '/app/ai-agent/shopify/shopify-store/onboarding/invalid-step?jtbd=support',
                '/app/ai-agent/:shopType/:shopName/onboarding/:step',
            )

            await waitFor(() => {
                expect(screen.getByTestId('current-path')).toHaveTextContent(
                    `/app/ai-agent/shopify/shopify-store/onboarding/${WizardStepEnum.SHOPIFY_INTEGRATION}`,
                )
            })
            expect(screen.getByTestId('current-search')).toHaveTextContent(
                '?jtbd=support',
            )
        })
    })
})
