import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createMemoryHistory } from 'history'
import { fromJS, Map } from 'immutable'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'

import { account } from 'fixtures/account'
import { billingState } from 'fixtures/billing'
import { chatIntegrationFixtures } from 'fixtures/chat'
import { integrationsState, shopifyIntegration } from 'fixtures/integrations'
import { PersonalityPreviewStep } from 'pages/aiAgent/Onboarding/components/steps/PersonalityPreviewStep/PersonalityPreviewStep'
import { DiscountStrategy } from 'pages/aiAgent/Onboarding/components/steps/PersonalityStep/DiscountStrategy'
import { PersuasionLevel } from 'pages/aiAgent/Onboarding/components/steps/PersonalityStep/PersuasionLevel'
import { useGetOnboardingData } from 'pages/aiAgent/Onboarding/hooks/useGetOnboardingData'
import { useTransformToneOfVoiceConversations } from 'pages/aiAgent/Onboarding/hooks/useTransformToneOfVoiceConversations'
import { useUpdateOnboarding } from 'pages/aiAgent/Onboarding/hooks/useUpdateOnboarding'
import { AiAgentScopes, WizardStepEnum } from 'pages/aiAgent/Onboarding/types'
import { RootState, StoreDispatch } from 'state/types'
import { assumeMock, renderWithRouter } from 'utils/testing'

import { conversationExamples } from '../conversationsExamples'

jest.mock('pages/aiAgent/Onboarding/hooks/useGetOnboardingData')
const useGetOnboardingDataMock = assumeMock(useGetOnboardingData)

jest.mock('pages/aiAgent/Onboarding/hooks/useUpdateOnboarding')
const mockUpdateOnboardingMock = assumeMock(useUpdateOnboarding)

jest.mock('pages/aiAgent/Onboarding/hooks/useTransformToneOfVoiceConversations')
const useTransformToneOfVoiceConversationsMock = assumeMock(
    useTransformToneOfVoiceConversations,
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

const renderComponent = (state?: RootState) => {
    return renderWithRouter(
        <QueryClientProvider client={queryClient}>
            <Provider store={mockStore(state ?? defaultState)}>
                <PersonalityPreviewStep
                    currentStep={3}
                    totalSteps={6}
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
        ['sales', [AiAgentScopes.SALES], WizardStepEnum.PERSONALITY_PREVIEW],
        ['support', [AiAgentScopes.SUPPORT], WizardStepEnum.KNOWLEDGE],
        [
            'mixed',
            [AiAgentScopes.SALES, AiAgentScopes.SUPPORT],
            WizardStepEnum.PERSONALITY_PREVIEW,
        ],
    ])('with scope defined as %s', (scopeName, scopes, nextStep) => {
        beforeEach(() => {
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
        })

        it('should render with the title', () => {
            const screen = renderComponent()

            expect(
                screen.getByText('Now see how your AI Agent will respond to'),
            ).toBeInTheDocument()
        })

        it('should select the first personality preview', () => {
            const screen = renderComponent()

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
            const screen = renderComponent()

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

        it('navigates to the previous step when Back is clicked', async () => {
            const screen = renderComponent()

            await userEvent.click(screen.getByRole('button', { name: 'Back' }))

            expect(goToStep).toHaveBeenCalledWith(WizardStepEnum.CHANNELS)
        })

        it('navigates to the next step when Next is clicked', async () => {
            const screen = renderComponent()

            await userEvent.click(screen.getByRole('button', { name: 'Next' }))

            expect(goToStep).toHaveBeenCalledWith(nextStep)
        })
    })
})
