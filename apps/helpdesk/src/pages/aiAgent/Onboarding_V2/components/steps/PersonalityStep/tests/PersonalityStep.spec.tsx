import type { ComponentProps } from 'react'

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
import { DiscountStrategy } from 'pages/aiAgent/Onboarding_V2/components/steps/PersonalityStep/DiscountStrategy'
import { PersonalityStep } from 'pages/aiAgent/Onboarding_V2/components/steps/PersonalityStep/PersonalityStep'
import { PersuasionLevel } from 'pages/aiAgent/Onboarding_V2/components/steps/PersonalityStep/PersuasionLevel'
import type { StepProps } from 'pages/aiAgent/Onboarding_V2/components/steps/types'
import { conversationExamples } from 'pages/aiAgent/Onboarding_V2/constants/conversationExamples'
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

const trackRect = {
    left: 0,
    width: 400,
    right: 400,
    top: 0,
    bottom: 0,
    height: 0,
    x: 0,
    y: 0,
    toJSON: () => {},
}

const history = createMemoryHistory({
    initialEntries: [
        `/app/ai-agent/shopify/${shopifyIntegration.meta.shop_name}/onboarding/${WizardStepEnum.SALES_PERSONALITY}`,
    ],
})

const testQueryClient = new QueryClient({
    defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
    },
})

const mockStore = configureMockStore<RootState, StoreDispatch>()

const defaultState = {
    currentAccount: fromJS(account),
    billing: fromJS(billingState),
    integrations: (fromJS(integrationsState) as Map<any, any>).mergeDeep({
        integrations: [shopifyIntegration, ...chatIntegrationFixtures],
    }),
} as RootState

jest.mock('pages/aiAgent/Onboarding_V2/hooks/useGetOnboardingData')
const useGetOnboardingDataMock = assumeMock(useGetOnboardingData)

const mutateUpdateOnboardingMock = jest.fn()
jest.mock('pages/aiAgent/Onboarding_V2/hooks/useUpdateOnboarding')
const useUpdateOnboardingMock = assumeMock(useUpdateOnboarding)

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

const goToStep = jest.fn()
const defaultProps: StepProps = {
    currentStep: 2,
    totalSteps: 5,
    goToStep,
}

const renderComponent = (
    props: ComponentProps<typeof PersonalityStep> = defaultProps,
) => {
    renderWithRouter(
        <QueryClientProvider client={testQueryClient}>
            <Provider store={mockStore(defaultState)}>
                <PersonalityStep {...props} />
            </Provider>
        </QueryClientProvider>,
        {
            history,
            path: '/app/ai-agent/:shopType/:shopName/onboarding/:step',
            route: `/app/ai-agent/shopify/${shopifyIntegration.meta.shop_name}/onboarding/${WizardStepEnum.SALES_PERSONALITY}`,
        },
    )
}

describe('PersonalityStep - With prepopulated data', () => {
    beforeEach(() => {
        testQueryClient.clear()
    })

    beforeAll(() => {
        useGetOnboardingDataMock.mockReturnValue({
            isLoading: false,
            data: {
                id: '1',
                salesPersuasionLevel: PersuasionLevel.Moderate,
                salesDiscountStrategyLevel: DiscountStrategy.Balanced,
                salesDiscountMax: 0.1,
                scopes: [AiAgentScopes.SUPPORT, AiAgentScopes.SALES],
                shopName: shopifyIntegration.meta.shop_name,
                currentStepName: WizardStepEnum.SALES_PERSONALITY,
            },
        })

        useUpdateOnboardingMock.mockReturnValue({
            mutate: jest.fn(),
            isLoading: false,
        } as any)

        useTransformToneOfVoiceConversationsMock.mockReturnValue({
            previewConversation: conversationExamples.default,
            isPreviewLoading: false,
            isLoading: false,
            preview: undefined,
        })

        useAiAgentScopesForAutomationPlanMock.mockReturnValue([
            AiAgentScopes.SUPPORT,
            AiAgentScopes.SALES,
        ])
    })

    it('navigates to the next step when Next is clicked', async () => {
        renderComponent()

        await waitFor(() => {
            expect(screen.getByDisplayValue('10')).toBeInTheDocument()
        })

        await waitFor(() => {
            expect(
                screen.queryByText(/Fixed discount \(%\)/),
            ).toBeInTheDocument()
        })

        fireEvent.click(screen.getByText(/Next/i))

        await waitFor(() => {
            expect(goToStep).toHaveBeenCalledWith(WizardStepEnum.ENGAGEMENT)
        })
    })
})

describe('PersonalityStep - Empty state', () => {
    beforeEach(() => {
        testQueryClient.clear()
    })

    beforeAll(() => {
        useGetOnboardingDataMock.mockReturnValue({
            isLoading: false,
            data: {
                id: '1',
                salesPersuasionLevel: PersuasionLevel.Moderate,
                salesDiscountStrategyLevel: DiscountStrategy.Balanced,
                salesDiscountMax: null,
                scopes: [AiAgentScopes.SALES],
                shopName: shopifyIntegration.meta.shop_name,
                currentStepName: WizardStepEnum.SALES_PERSONALITY,
            },
        })

        mutateUpdateOnboardingMock.mockImplementation(
            (data: any, { onSuccess }: { onSuccess: () => {} }) => {
                onSuccess()
            },
        )
        useUpdateOnboardingMock.mockReturnValue({
            mutate: mutateUpdateOnboardingMock,
            isLoading: false,
        } as any)

        useTransformToneOfVoiceConversationsMock.mockReturnValue({
            previewConversation: conversationExamples.default,
            isPreviewLoading: false,
            isLoading: false,
            preview: undefined,
        })

        useAiAgentScopesForAutomationPlanMock.mockReturnValue([
            AiAgentScopes.SALES,
        ])
    })

    it('should render without crashing', () => {
        renderComponent()

        expect(
            screen.getByRole('heading', {
                name: /Choose how AI Agent drives sales/i,
            }),
        ).toBeInTheDocument()
        expect(
            screen.getByText(
                'Strike a balance between providing educational information and encouraging a purchase.',
            ),
        ).toBeInTheDocument()
        expect(
            screen.getByText(
                'Use discounts selectively based on customer behavior and likelihood to convert.',
            ),
        ).toBeInTheDocument()
    })

    it('should update persuasion level description when moving slider', async () => {
        renderComponent()

        await waitFor(() => {
            const track = document.querySelectorAll('.track')[0]
            track.getBoundingClientRect = jest.fn().mockReturnValue(trackRect)
            // Try clicking beyond the end of track to select the last value
            fireEvent.click(track, {
                clientX: 500,
            })

            expect(
                screen.getByText(
                    'Drive purchases by confidently recommending products and encouraging immediate action.',
                ),
            ).toBeInTheDocument()
        })
    })

    it('should update discount strategy description when moving slider', async () => {
        renderComponent()

        await waitFor(() => {
            const track = document.querySelectorAll('.track')[1]
            track.getBoundingClientRect = jest.fn().mockReturnValue(trackRect)
            // Try clicking beyond the end of track to select the last value
            fireEvent.click(track, {
                clientX: 500,
            })

            expect(
                screen.getByText(
                    'Use discounts often to maximize conversions and reduce cart abandonment.',
                ),
            ).toBeInTheDocument()
        })
    })

    it('should set max percentage to 0 when discount strategy is None', async () => {
        renderComponent()

        await waitFor(() => {
            const track = document.querySelectorAll('.track')[1]
            track.getBoundingClientRect = jest.fn().mockReturnValue(trackRect)
            // Try clicking before the start of track to select the first value
            fireEvent.click(track, {
                clientX: 0,
            })

            expect(
                screen.getByText(
                    'Sell at full price, focusing on value. Offering discounts boosts conversion by ~50%.',
                ),
            ).toBeInTheDocument()
        })

        // Wait for maxDiscountPercentage to update in the DOM
        await waitFor(() => {
            const maxDiscountInput =
                screen.getByLabelText(/Fixed discount \(%\)/)
            expect(maxDiscountInput).toBeInTheDocument()
            expect(maxDiscountInput).toHaveValue('0')
        })
    })

    it('should update the max percentage discount when valid discount', async () => {
        const user = userEvent.setup()
        renderComponent()

        const maxDiscountInput =
            screen.getByLabelText<HTMLInputElement>(/Fixed discount \(%\)/)

        // Remove the default value
        await act(() => user.clear(maxDiscountInput))

        await act(() => user.type(maxDiscountInput, '15'))

        expect(maxDiscountInput).toHaveValue('15')

        await waitFor(() => {
            expect(
                screen.queryByText(/Must be a number between 1 and 100/i),
            ).not.toBeInTheDocument()
        })
    })

    it('should set max percentage to 8 when discount strategy is not None', async () => {
        renderComponent()

        await waitFor(() => {
            const track = document.querySelectorAll('.track')[1]
            track.getBoundingClientRect = jest.fn().mockReturnValue(trackRect)
            // Try clicking before the start of track to select the first value
            fireEvent.click(track, {
                clientX: 0,
            })

            expect(
                screen.getByText(
                    'Sell at full price, focusing on value. Offering discounts boosts conversion by ~50%.',
                ),
            ).toBeInTheDocument()
        })

        // Wait for maxDiscountPercentage to update in the DOM
        await waitFor(() => {
            const maxDiscountInput =
                screen.getByLabelText(/Fixed discount \(%\)/)
            expect(maxDiscountInput).toBeInTheDocument()
            expect(maxDiscountInput).toHaveValue('0')
        })

        await waitFor(() => {
            const track = document.querySelectorAll('.track')[1]
            track.getBoundingClientRect = jest.fn().mockReturnValue(trackRect)
            // Try clicking beyond the end of track to select the last value
            fireEvent.click(track, {
                clientX: 500,
            })

            expect(
                screen.getByText(
                    'Use discounts often to maximize conversions and reduce cart abandonment.',
                ),
            ).toBeInTheDocument()
        })

        // Wait for maxDiscountPercentage to update in the DOM
        await waitFor(() => {
            const maxDiscountInput =
                screen.getByLabelText(/Fixed discount \(%\)/)
            expect(maxDiscountInput).toBeInTheDocument()
            expect(maxDiscountInput).toHaveValue('8')
        })
    })

    it('should update the max percentage discount and change the discount strategy when the value is 0', async () => {
        renderComponent()

        await waitFor(() => {
            const maxDiscountInput =
                screen.getByLabelText<HTMLInputElement>(/Fixed discount \(%\)/)
            fireEvent.change(maxDiscountInput, { target: { value: '0' } })
            expect(maxDiscountInput.value).toBe('0')

            expect(
                screen.getByText(
                    'Sell at full price, focusing on value. Offering discounts boosts conversion by ~50%.',
                ),
            ).toBeInTheDocument()
        })
    })

    it('should update the max percentage discount and show an error message when discount to high (101)', async () => {
        renderComponent()

        await waitFor(() => {
            const maxDiscountInput =
                screen.getByLabelText<HTMLInputElement>(/Fixed discount \(%\)/)
            fireEvent.change(maxDiscountInput, { target: { value: '101' } })
            expect(maxDiscountInput.value).toBe('101')

            expect(
                screen.queryByText(/Must be a number between 1 and 100/i),
            ).toBeInTheDocument()
        })
    })

    it.skip('navigates to the previous step when Back is clicked', async () => {
        renderComponent()

        await waitFor(() => {
            expect(
                screen.queryByText(/Fixed discount \(%\)/),
            ).toBeInTheDocument()
        })

        fireEvent.click(screen.getByText(/Back/i))

        await waitFor(() => {
            expect(goToStep).toHaveBeenCalledWith(
                WizardStepEnum.SHOPIFY_INTEGRATION,
            )
        })
    })

    it('navigates to the engagement step when Next is clicked', async () => {
        renderComponent()

        await waitFor(() => {
            expect(
                screen.queryByText(/Fixed discount \(%\)/),
            ).toBeInTheDocument()
        })

        await waitFor(() => {
            const maxDiscountInput =
                screen.getByLabelText<HTMLInputElement>(/Fixed discount \(%\)/)
            fireEvent.change(maxDiscountInput, { target: { value: '90' } })
            expect(maxDiscountInput.value).toBe('90')
        })

        fireEvent.click(screen.getByText(/Next/i))

        await waitFor(() => {
            expect(goToStep).toHaveBeenCalledWith(WizardStepEnum.ENGAGEMENT)
        })
    })
})

describe('PersonalityStep - Preview information', () => {
    const defaultMockData = {
        id: '1',
        salesPersuasionLevel: PersuasionLevel.Moderate,
        salesDiscountStrategyLevel: DiscountStrategy.Balanced,
        salesDiscountMax: 0.1,
        scopes: [AiAgentScopes.SALES],
        shopName: shopifyIntegration.meta.shop_name,
        currentStepName: WizardStepEnum.SALES_PERSONALITY,
    }

    beforeEach(() => {
        testQueryClient.clear()
    })

    beforeAll(() => {
        useGetOnboardingDataMock.mockReturnValue({
            isLoading: false,
            data: defaultMockData,
        })

        useUpdateOnboardingMock.mockReturnValue({
            mutate: jest.fn(),
            isLoading: false,
        } as any)
    })

    it('renders the correct preview for no discount educational', async () => {
        useTransformToneOfVoiceConversationsMock.mockReturnValue({
            previewConversation: conversationExamples.noDiscountEducational,
            isLoading: false,
            isPreviewLoading: false,
            preview: undefined,
        })

        const mockData = {
            ...defaultMockData,
            salesDiscountStrategyLevel: DiscountStrategy.NoDiscount,
            salesPersuasionLevel: PersuasionLevel.Educational,
        }
        const expectedMessages =
            conversationExamples.noDiscountEducational.messages

        useGetOnboardingDataMock.mockReturnValue({
            isLoading: false,
            data: mockData,
        })

        renderComponent()

        expect(
            screen.getByText(
                expectedMessages[expectedMessages.length - 1].content,
            ),
        ).toBeInTheDocument()
    })

    it('renders the correct preview for no discount moderate', async () => {
        useTransformToneOfVoiceConversationsMock.mockReturnValue({
            previewConversation: conversationExamples.noDiscountBalanced,
            isLoading: false,
            isPreviewLoading: false,
            preview: undefined,
        })

        const mockData = {
            ...defaultMockData,
            salesDiscountStrategyLevel: DiscountStrategy.NoDiscount,
            salesPersuasionLevel: PersuasionLevel.Moderate,
        }
        const expectedMessages =
            conversationExamples.noDiscountBalanced.messages

        useGetOnboardingDataMock.mockReturnValue({
            isLoading: false,
            data: mockData,
        })

        renderComponent()

        expect(
            screen.getByText(
                expectedMessages[expectedMessages.length - 1].content,
            ),
        ).toBeInTheDocument()
    })

    it('renders the correct preview for no discount aggressive', async () => {
        useTransformToneOfVoiceConversationsMock.mockReturnValue({
            previewConversation: conversationExamples.noDiscountAggressive,
            isLoading: false,
            isPreviewLoading: false,
            preview: undefined,
        })

        const mockData = {
            ...defaultMockData,
            salesDiscountStrategyLevel: DiscountStrategy.NoDiscount,
            salesPersuasionLevel: PersuasionLevel.Assertive,
        }
        const expectedMessages =
            conversationExamples.noDiscountAggressive.messages

        useGetOnboardingDataMock.mockReturnValue({
            isLoading: false,
            data: mockData,
        })

        renderComponent()

        expect(
            screen.getByText(
                expectedMessages[expectedMessages.length - 1].content,
            ),
        ).toBeInTheDocument()
    })

    it('renders the correct preview for with discount educational', async () => {
        useTransformToneOfVoiceConversationsMock.mockReturnValue({
            previewConversation: conversationExamples.withDiscountEducational,
            isLoading: false,
            isPreviewLoading: false,
            preview: undefined,
        })

        const mockData = {
            ...defaultMockData,
            salesDiscountStrategyLevel: DiscountStrategy.Maximized,
            salesPersuasionLevel: PersuasionLevel.Educational,
        }
        const expectedMessages =
            conversationExamples.withDiscountEducational.messages

        useGetOnboardingDataMock.mockReturnValue({
            isLoading: false,
            data: mockData,
        })

        renderComponent()

        expect(
            screen.getByText(
                expectedMessages[expectedMessages.length - 1].content,
            ),
        ).toBeInTheDocument()
    })

    it('renders the correct preview for with discount balanced', async () => {
        useTransformToneOfVoiceConversationsMock.mockReturnValue({
            previewConversation: conversationExamples.withDiscountBalanced,
            isLoading: false,
            isPreviewLoading: false,
            preview: undefined,
        })

        const salesDiscountMax = 15
        const mockData = {
            ...defaultMockData,
            salesDiscountStrategyLevel: DiscountStrategy.Maximized,
            salesPersuasionLevel: PersuasionLevel.Moderate,
            salesDiscountMax: salesDiscountMax / 100,
        }
        const expectedMessages =
            conversationExamples.withDiscountBalanced.messages

        useGetOnboardingDataMock.mockReturnValue({
            isLoading: false,
            data: mockData,
        })

        renderComponent()

        const expectedMessage = expectedMessages[
            expectedMessages.length - 1
        ].content.replace('[DISCOUNT-PERCENTAGE]', String(salesDiscountMax))

        expect(screen.getByText(expectedMessage)).toBeInTheDocument()
    })

    it('renders the correct preview for with discount aggressive', async () => {
        useTransformToneOfVoiceConversationsMock.mockReturnValue({
            previewConversation: conversationExamples.withDiscountAggressive,
            isLoading: false,
            isPreviewLoading: false,
            preview: undefined,
        })

        const mockData = {
            ...defaultMockData,
            salesDiscountStrategyLevel: DiscountStrategy.Maximized,
            salesPersuasionLevel: PersuasionLevel.Assertive,
        }
        const expectedMessages =
            conversationExamples.withDiscountAggressive.messages

        useGetOnboardingDataMock.mockReturnValue({
            isLoading: false,
            data: mockData,
        })

        renderComponent()

        expect(
            screen.getByText(
                expectedMessages[expectedMessages.length - 1].content,
            ),
        ).toBeInTheDocument()
    })

    it('renders the loading preview', async () => {
        useTransformToneOfVoiceConversationsMock.mockReturnValue({
            previewConversation: undefined,
            isLoading: true,
            isPreviewLoading: true,
            preview: undefined,
        })

        renderComponent()

        expect(screen.getByTestId('typing-message-bubble')).toBeInTheDocument()
    })
})

describe('PersonalityStep - Onboarding mutation', () => {
    let doUpdateOnboardingMutationMock: jest.Mock

    beforeEach(() => {
        doUpdateOnboardingMutationMock = jest.fn()
        useUpdateOnboardingMock.mockReturnValue({
            mutate: doUpdateOnboardingMutationMock,
            isLoading: false,
        } as any)

        useTransformToneOfVoiceConversationsMock.mockReturnValue({
            previewConversation: conversationExamples.default,
            isPreviewLoading: false,
            isLoading: false,
            preview: undefined,
        })

        useAiAgentScopesForAutomationPlanMock.mockReturnValue([
            AiAgentScopes.SUPPORT,
            AiAgentScopes.SALES,
        ])
    })

    describe('when there is no sales settings', () => {
        beforeEach(() => {
            useGetOnboardingDataMock.mockReturnValue({
                isLoading: false,
                data: {
                    id: '1',
                    salesPersuasionLevel: null,
                    salesDiscountStrategyLevel: null,
                    salesDiscountMax: null,
                    scopes: [AiAgentScopes.SALES, AiAgentScopes.SUPPORT],
                    shopName: shopifyIntegration.meta.shop_name,
                    currentStepName: WizardStepEnum.SALES_PERSONALITY,
                },
            })
        })

        it('should render with default values', async () => {
            renderComponent()

            await waitFor(() => {
                expect(
                    screen.getByLabelText(/Fixed discount \(%\)/),
                ).toBeInTheDocument()
            })

            expect(
                screen.getByText(
                    'Strike a balance between providing educational information and encouraging a purchase.',
                ),
            ).toBeInTheDocument()

            expect(
                screen.getByText(
                    'Use discounts selectively based on customer behavior and likelihood to convert.',
                ),
            ).toBeInTheDocument()

            const maxDiscountInput =
                screen.getByLabelText(/Fixed discount \(%\)/)
            expect(maxDiscountInput).toBeInTheDocument()
            expect(maxDiscountInput).toHaveValue('8')
        })

        it('should call doUpdateOnboardingMutation with default values when clicking on next', async () => {
            const user = userEvent.setup()
            renderComponent()

            const nextButton = screen.getByText(/Next/i)

            await act(() => user.click(nextButton))

            await waitFor(() => {
                expect(doUpdateOnboardingMutationMock).toHaveBeenCalled()
                expect(doUpdateOnboardingMutationMock.mock.calls[0][0]).toEqual(
                    {
                        data: {
                            id: '1',
                            scopes: [
                                AiAgentScopes.SALES,
                                AiAgentScopes.SUPPORT,
                            ],
                            shopName: shopifyIntegration.meta.shop_name,
                            currentStepName: WizardStepEnum.ENGAGEMENT,
                            salesDiscountMax: 0.08,
                            salesDiscountStrategyLevel: 'balanced',
                            salesPersuasionLevel: 'balanced',
                        },
                        id: '1',
                    },
                )
            })
        })
    })

    describe('when there are sales settings', () => {
        beforeEach(() => {
            useGetOnboardingDataMock.mockReturnValue({
                isLoading: false,
                data: {
                    id: '1',
                    salesPersuasionLevel: PersuasionLevel.Assertive,
                    salesDiscountStrategyLevel: DiscountStrategy.Maximized,
                    salesDiscountMax: 0.1,
                    scopes: [AiAgentScopes.SALES, AiAgentScopes.SUPPORT],
                    shopName: shopifyIntegration.meta.shop_name,
                    currentStepName: WizardStepEnum.SALES_PERSONALITY,
                },
            })
        })

        it('should not call doUpdateOnboardingMutation when no values are changed', async () => {
            const user = userEvent.setup()
            renderComponent()

            const nextButton = screen.getByText(/Next/i)

            await act(() => user.click(nextButton))

            expect(doUpdateOnboardingMutationMock).not.toHaveBeenCalled()
        })

        it('should call doUpdateOnboardingMutation when values are changed', async () => {
            const user = userEvent.setup()
            renderComponent()

            const maxDiscountInput =
                screen.getByLabelText<HTMLInputElement>(/Fixed discount \(%\)/)
            fireEvent.change(maxDiscountInput, { target: { value: '0' } })
            expect(maxDiscountInput.value).toBe('0')

            const nextButton = screen.getByText(/Next/i)

            await act(() => user.click(nextButton))

            await waitFor(() => {
                expect(doUpdateOnboardingMutationMock).toHaveBeenCalled()
                expect(doUpdateOnboardingMutationMock.mock.calls[0][0]).toEqual(
                    {
                        data: {
                            id: '1',
                            scopes: [
                                AiAgentScopes.SALES,
                                AiAgentScopes.SUPPORT,
                            ],
                            shopName: shopifyIntegration.meta.shop_name,
                            currentStepName: WizardStepEnum.ENGAGEMENT,
                            salesDiscountMax: null,
                            salesDiscountStrategyLevel: 'none',
                            salesPersuasionLevel: 'aggressive',
                        },
                        id: '1',
                    },
                )
            })
        })
    })
})
