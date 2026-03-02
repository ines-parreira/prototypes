import { getLDClient } from '@repo/feature-flags'
import { assumeMock } from '@repo/testing'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, screen, waitFor } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { createMemoryHistory } from 'history'
import type { Map } from 'immutable'
import { fromJS } from 'immutable'
import { ldClientMock } from 'jest-launchdarkly-mock'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'

import { account } from 'fixtures/account'
import { billingState } from 'fixtures/billing'
import { chatIntegrationFixtures } from 'fixtures/chat'
import { integrationsState, shopifyIntegration } from 'fixtures/integrations'
import { useGmvUsdOver30Days } from 'pages/aiAgent/components/CustomerEngagementSettings/hooks/useGmvUsdOver30Days'
import { useLowestPotentialImpact } from 'pages/aiAgent/components/CustomerEngagementSettings/hooks/useLowestPotentialImpact'
import { DiscountStrategy } from 'pages/aiAgent/Onboarding/components/steps/PersonalityStep/DiscountStrategy'
import { PersuasionLevel } from 'pages/aiAgent/Onboarding/components/steps/PersonalityStep/PersuasionLevel'
import { useGetOnboardingData } from 'pages/aiAgent/Onboarding/hooks/useGetOnboardingData'
import { useUpdateOnboarding } from 'pages/aiAgent/Onboarding/hooks/useUpdateOnboarding'
import { AiAgentScopes, WizardStepEnum } from 'pages/aiAgent/Onboarding/types'
import type { RootState, StoreDispatch } from 'state/types'
import { renderWithRouter } from 'utils/testing'

import { EngagementStep } from '../EngagementStep'

const mockStore = configureMockStore<RootState, StoreDispatch>()

const queryClient = new QueryClient()

const history = createMemoryHistory({
    initialEntries: [
        `/app/ai-agent/shopify/${shopifyIntegration.meta.shop_name}/onboarding/engagement`,
    ],
})

const defaultState = {
    currentAccount: fromJS(account),
    billing: fromJS(billingState),
    integrations: (fromJS(integrationsState) as Map<any, any>).mergeDeep({
        integrations: [shopifyIntegration, ...chatIntegrationFixtures],
    }),
} as RootState

jest.mock(
    'pages/aiAgent/components/CustomerEngagementSettings/hooks/useGmvUsdOver30Days',
)
const mockUseGmvUsdOver30Days = assumeMock(useGmvUsdOver30Days)

jest.mock(
    'pages/aiAgent/components/CustomerEngagementSettings/hooks/useLowestPotentialImpact',
)
const mockUseLowestPotentialImpact = assumeMock(useLowestPotentialImpact)

jest.mock('pages/aiAgent/Onboarding/hooks/useGetOnboardingData')
const useGetOnboardingDataMock = assumeMock(useGetOnboardingData)

jest.mock('pages/aiAgent/Onboarding/hooks/useGetOnboardings')

const mockGmvData = [
    [
        {
            dateTime: '2024-01-01T00:00:00Z',
            value: 10000,
        },
    ],
]
const mockLowestPotentialImpact = '$500'

const mutateUpdateOnboardingMock = jest.fn()
jest.mock('pages/aiAgent/Onboarding/hooks/useUpdateOnboarding')
const useUpdateOnboardingMock = assumeMock(useUpdateOnboarding)

const goToStep = jest.fn()

const renderWithProviders = (props = {}) => {
    return renderWithRouter(
        <Provider store={mockStore(defaultState)}>
            <QueryClientProvider client={queryClient}>
                <EngagementStep
                    currentStep={4}
                    totalSteps={5}
                    goToStep={goToStep}
                    {...props}
                />
            </QueryClientProvider>
        </Provider>,
        {
            history,
            path: '/app/ai-agent/:shopType/:shopName/onboarding/:step',
            route: `/app/ai-agent/shopify/${shopifyIntegration.meta.shop_name}/onboarding/engagement`,
        },
    )
}

describe('EngagementStep', () => {
    beforeEach(() => {
        ldClientMock.allFlags.mockReturnValue({})
        let __client = getLDClient()
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        __client = ldClientMock

        mockUseGmvUsdOver30Days.mockReturnValue({
            data: mockGmvData,
            isLoading: false,
        })

        mockUseLowestPotentialImpact.mockReturnValue(mockLowestPotentialImpact)

        useGetOnboardingDataMock.mockReturnValue({
            data: {
                salesPersuasionLevel: PersuasionLevel.Moderate,
                salesDiscountStrategyLevel: DiscountStrategy.Balanced,
                salesDiscountMax: 0.8,
                scopes: [AiAgentScopes.SUPPORT, AiAgentScopes.SALES],
                shopName: shopifyIntegration.meta.shop_name,
                currentStepName: WizardStepEnum.SHOPIFY_INTEGRATION,
                id: '1',
            },
            isLoading: false,
        } as any)

        useUpdateOnboardingMock.mockReturnValue({
            mutate: mutateUpdateOnboardingMock,
            isLoading: false,
        } as any)

        mutateUpdateOnboardingMock.mockImplementation(
            (data: any, { onSuccess }: { onSuccess: () => {} }) => {
                onSuccess()
            },
        )
    })

    afterEach(() => {
        jest.clearAllMocks()
    })

    it('renders the main title and form sections', async () => {
        renderWithProviders()

        await waitFor(() => {
            expect(
                screen.getByText(/engage your customers/i),
            ).toBeInTheDocument()
        })

        expect(
            screen.getByText(/Send tailored messages after searches/i),
        ).toBeInTheDocument()
        expect(
            screen.getByText(/Display AI-generated FAQs/i),
        ).toBeInTheDocument()
        expect(
            screen.getByText(/Keep an input field visible/i),
        ).toBeInTheDocument()
    })

    it.skip('shows confirmation popup when all toggles are off and next is clicked', async () => {
        renderWithProviders()

        await waitFor(() => {
            expect(
                screen.getByText(/engage your customers/i),
            ).toBeInTheDocument()
        })

        // Turn off all toggles (simulate user interaction)
        const toggles = screen.getAllByRole('checkbox')
        toggles.forEach((toggle) => {
            const input = toggle as HTMLInputElement
            if (input.checked) {
                act(() => {
                    userEvent.click(input)
                })
            }
        })
        // Click next
        const nextButton = screen.getByRole('button', { name: /next/i })
        act(() => {
            userEvent.click(nextButton)
        })
        // Popup should appear
        await waitFor(() => {
            expect(
                screen.getByText(/Keep Customer Engagement on to boost sales/i),
            ).toBeInTheDocument()
        })
    })

    it('calls goToStep when back is clicked', async () => {
        renderWithProviders()

        await waitFor(() => {
            expect(
                screen.getByText(/engage your customers/i),
            ).toBeInTheDocument()
        })

        const backButton = screen.getByRole('button', { name: /Back/i })

        act(() => {
            userEvent.click(backButton)
        })

        await waitFor(() => {
            expect(goToStep).toHaveBeenCalled()
        })
    })

    it('calls updateOnboarding when toggles are changed and Next is clicked', async () => {
        renderWithProviders()

        await waitFor(() => {
            expect(
                screen.getByText(/engage your customers/i),
            ).toBeInTheDocument()
        })

        const toggles = screen.getAllByRole('checkbox')
        expect(toggles.length).toBeGreaterThan(0)

        // Flip the first toggle to make the form dirty
        act(() => {
            userEvent.click(toggles[0])
        })

        // Click "Next"
        const nextButton = screen.getByRole('button', { name: /next/i })
        act(() => {
            userEvent.click(nextButton)
        })

        await waitFor(() => {
            expect(mutateUpdateOnboardingMock).toHaveBeenCalledWith(
                {
                    id: '1',
                    data: {
                        currentStepName: WizardStepEnum.KNOWLEDGE,
                        id: '1',
                        isAskAnythingInputEnabled: true,
                        isConversationStartersEnabled: true,
                        isSalesHelpOnSearchEnabled: false,
                        salesDiscountMax: 0.8,
                        salesDiscountStrategyLevel: 'balanced',
                        salesPersuasionLevel: 'balanced',
                        scopes: ['support', 'sales'],
                        shopName: shopifyIntegration.meta.shop_name,
                    },
                },
                expect.anything(),
            )

            expect(goToStep).toHaveBeenCalledWith(WizardStepEnum.KNOWLEDGE)
        })
    })
})
