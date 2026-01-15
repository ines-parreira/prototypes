import { assumeMock } from '@repo/testing'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, fireEvent, screen, waitFor } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { createMemoryHistory } from 'history'
import type { Map } from 'immutable'
import { fromJS } from 'immutable'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'

import { account } from 'fixtures/account'
import { billingState } from 'fixtures/billing'
import { chatIntegrationFixtures } from 'fixtures/chat'
import { integrationsState, shopifyIntegration } from 'fixtures/integrations'
import { PersonalityPreviewStep } from 'pages/aiAgent/Onboarding_V2/components/steps/PersonalityPreviewStep/PersonalityPreviewStep'
import { DiscountStrategy } from 'pages/aiAgent/Onboarding_V2/components/steps/PersonalityStep/DiscountStrategy'
import { PersuasionLevel } from 'pages/aiAgent/Onboarding_V2/components/steps/PersonalityStep/PersuasionLevel'
import { useAiAgentScopesForAutomationPlan } from 'pages/aiAgent/Onboarding_V2/hooks/useAiAgentScopesForAutomationPlan'
import { useGetOnboardingData } from 'pages/aiAgent/Onboarding_V2/hooks/useGetOnboardingData'
import { useTransformToneOfVoiceConversations } from 'pages/aiAgent/Onboarding_V2/hooks/useTransformToneOfVoiceConversations'
import { useUpdateOnboarding } from 'pages/aiAgent/Onboarding_V2/hooks/useUpdateOnboarding'
import {
    AiAgentScopes,
    WizardStepEnum,
} from 'pages/aiAgent/Onboarding_V2/types'
import type { RootState, StoreDispatch } from 'state/types'
import { renderWithRouter } from 'utils/testing'

import { conversationExamples } from '../conversationsExamples'

jest.mock('pages/aiAgent/Onboarding_V2/hooks/useGetOnboardingData')
const useGetOnboardingDataMock = assumeMock(useGetOnboardingData)

jest.mock('pages/aiAgent/Onboarding_V2/hooks/useUpdateOnboarding')
const mockUpdateOnboardingMock = assumeMock(useUpdateOnboarding)

jest.mock(
    'pages/aiAgent/Onboarding_V2/hooks/useTransformToneOfVoiceConversations',
)
const useTransformToneOfVoiceConversationsMock = assumeMock(
    useTransformToneOfVoiceConversations,
)

jest.mock('pages/aiAgent/Onboarding_V2/hooks/useAiAgentScopesForAutomationPlan')
const useAiAgentScopesForAutomationPlanMock = assumeMock(
    useAiAgentScopesForAutomationPlan,
)

const mockStore = configureMockStore<RootState, StoreDispatch>()

const defaultState = {
    currentAccount: fromJS(account),
    billing: fromJS(billingState),
    integrations: (fromJS(integrationsState) as Map<any, any>).mergeDeep({
        integrations: [shopifyIntegration, ...chatIntegrationFixtures],
    }),
} as RootState

const history = createMemoryHistory({
    initialEntries: [
        `/app/ai-agent/shopify/${shopifyIntegration.meta.shop_name}/onboarding/${WizardStepEnum.PERSONALITY_PREVIEW}`,
    ],
})

const queryClient = new QueryClient()

const goToStep = jest.fn()

const renderComponent = ({
    currentStep,
    totalSteps,
}: {
    currentStep: number
    totalSteps: number
}) => {
    return renderWithRouter(
        <QueryClientProvider client={queryClient}>
            <Provider store={mockStore(defaultState)}>
                <PersonalityPreviewStep
                    currentStep={currentStep}
                    totalSteps={totalSteps}
                    goToStep={goToStep}
                />
            </Provider>
        </QueryClientProvider>,
        {
            history,
            path: '/app/ai-agent/:shopType/:shopName/onboarding/:step',
            route: `/app/ai-agent/shopify/${shopifyIntegration.meta.shop_name}/onboarding/${WizardStepEnum.PERSONALITY_PREVIEW}`,
        },
    )
}

describe('<PersonalityPreviewStep />', () => {
    describe.each([
        {
            description: 'support',
            scopes: [AiAgentScopes.SUPPORT],
            currentStep: 2,
            totalSteps: 3,
            previousStep: WizardStepEnum.TONE_OF_VOICE,
            nextStep: WizardStepEnum.KNOWLEDGE,
        },
        {
            description: 'support + sales',
            scopes: [AiAgentScopes.SALES, AiAgentScopes.SUPPORT],
            currentStep: 4,
            totalSteps: 5,
            previousStep: WizardStepEnum.ENGAGEMENT,
            nextStep: WizardStepEnum.KNOWLEDGE,
        },
    ])(
        'with scope defined as $description',
        ({ scopes, currentStep, totalSteps, previousStep, nextStep }) => {
            beforeEach(() => {
                useAiAgentScopesForAutomationPlanMock.mockReturnValue(scopes)
                useGetOnboardingDataMock.mockReturnValue({
                    isLoading: false,
                    data: {
                        id: '1',
                        salesPersuasionLevel: PersuasionLevel.Moderate,
                        salesDiscountStrategyLevel: DiscountStrategy.Balanced,
                        salesDiscountMax: 0.8,
                        scopes,
                        shopName: shopifyIntegration.meta.shop_name,
                        currentStepName: WizardStepEnum.PERSONALITY_PREVIEW,
                    },
                })

                mockUpdateOnboardingMock.mockReturnValue({
                    mutate: jest.fn(),
                    isLoading: false,
                } as any)

                useTransformToneOfVoiceConversationsMock.mockReturnValue({
                    previewConversation: conversationExamples.default,
                    isPreviewLoading: false,
                    isLoading: false,
                    preview: undefined,
                })

                renderComponent({ currentStep, totalSteps })
            })

            it('should render with the title', () => {
                expect(
                    screen.getByText(
                        'Now see how your AI Agent will respond to',
                    ),
                ).toBeInTheDocument()
            })

            it('should select the first personality preview', () => {
                expect(screen.getAllByRole('radio')[0]).not.toHaveAttribute(
                    'aria-busy',
                )

                expect(screen.getAllByRole('radio')[0]).toHaveAttribute(
                    'aria-checked',
                    'true',
                )
                expect(screen.getAllByRole('radio')[1]).toHaveAttribute(
                    'aria-checked',
                    'false',
                )
            })

            it('should allow selecting any preview item', () => {
                expect(screen.getAllByRole('radio')[0]).toHaveAttribute(
                    'aria-checked',
                    'true',
                )
                expect(screen.getAllByRole('radio')[1]).toHaveAttribute(
                    'aria-checked',
                    'false',
                )

                act(() => {
                    fireEvent.click(screen.getAllByRole('radio')[1])
                })

                expect(screen.getAllByRole('radio')[0]).toHaveAttribute(
                    'aria-checked',
                    'false',
                )
                expect(screen.getAllByRole('radio')[1]).toHaveAttribute(
                    'aria-checked',
                    'true',
                )
            })
            ;(currentStep > 1 ? it : it.skip)(
                'navigates to the previous step when Back is clicked',
                async () => {
                    act(() => {
                        userEvent.click(
                            screen.getByRole('button', { name: 'Back' }),
                        )
                    })

                    await waitFor(() => {
                        expect(goToStep).toHaveBeenCalledWith(previousStep)
                    })
                },
            )

            it('navigates to the next step when Next is clicked', async () => {
                act(() => {
                    userEvent.click(
                        screen.getByRole('button', { name: 'Next' }),
                    )
                })

                await waitFor(() => {
                    expect(goToStep).toHaveBeenCalledWith(nextStep)
                })
            })
        },
    )
})
