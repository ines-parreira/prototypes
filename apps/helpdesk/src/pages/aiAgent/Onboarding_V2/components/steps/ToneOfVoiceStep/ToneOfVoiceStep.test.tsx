import '@testing-library/jest-dom'

import { assumeMock } from '@repo/testing'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { fromJS } from 'immutable'
import { Provider } from 'react-redux'
import { MemoryRouter, Route } from 'react-router-dom'
import configureMockStore from 'redux-mock-store'

import { account } from 'fixtures/account'
import { billingState } from 'fixtures/billing'
import { integrationsState, shopifyIntegration } from 'fixtures/integrations'
import { user } from 'fixtures/users'
import { ToneOfVoice } from 'pages/aiAgent/constants'
import { AiAgentScopes } from 'pages/aiAgent/Onboarding_V2/types'

import { ToneOfVoiceStep } from './ToneOfVoiceStep'

const mockUseSteps = {
    validSteps: [
        { step: 'step1', condition: true },
        { step: 'step2', condition: true },
        { step: 'step3', condition: true },
    ],
    totalSteps: 3,
}

const mockUseCheckStoreIntegration = jest.fn()
const mockUseCheckOnboardingCompleted = jest.fn()
const mockUseCheckStoreAlreadyConfigured = jest.fn()
const mockMutate = jest.fn()
const mockCreateMutate = jest.fn()

const mockOnboardingData = {
    id: '123',
    shopName: 'test-shop',
    toneOfVoice: ToneOfVoice.Friendly,
    customToneOfVoiceGuidance: undefined,
}

jest.mock('pages/aiAgent/Onboarding_V2/hooks/useSteps', () => ({
    useSteps: () => mockUseSteps,
}))

jest.mock('pages/aiAgent/Onboarding_V2/hooks/useCheckStoreIntegration', () => ({
    __esModule: true,
    default: () => mockUseCheckStoreIntegration(),
}))

jest.mock(
    'pages/aiAgent/Onboarding_V2/hooks/useCheckOnboardingCompleted',
    () => ({
        __esModule: true,
        default: () => mockUseCheckOnboardingCompleted(),
    }),
)

jest.mock(
    'pages/aiAgent/Onboarding_V2/hooks/useCheckStoreAlreadyConfigured',
    () => ({
        useCheckStoreAlreadyConfigured: () =>
            mockUseCheckStoreAlreadyConfigured(),
    }),
)

jest.mock('pages/aiAgent/Onboarding_V2/hooks/useGetOnboardingData')
const useGetOnboardingDataMock = assumeMock(
    require('pages/aiAgent/Onboarding_V2/hooks/useGetOnboardingData')
        .useGetOnboardingData,
)

jest.mock('pages/aiAgent/Onboarding_V2/hooks/useUpdateOnboarding')
const useUpdateOnboardingMock = assumeMock(
    require('pages/aiAgent/Onboarding_V2/hooks/useUpdateOnboarding')
        .useUpdateOnboarding,
)

jest.mock('pages/aiAgent/Onboarding_V2/hooks/useCreateOnboarding')
const useCreateOnboardingMock = assumeMock(
    require('pages/aiAgent/Onboarding_V2/hooks/useCreateOnboarding')
        .useCreateOnboarding,
)

jest.mock(
    'pages/aiAgent/Onboarding_V2/hooks/useAiAgentScopesForAutomationPlan',
    () => ({
        useAiAgentScopesForAutomationPlan: () => [
            AiAgentScopes.SUPPORT,
            AiAgentScopes.SALES,
        ],
    }),
)

jest.mock(
    'pages/aiAgent/Onboarding_V2/hooks/useTransformToneOfVoiceConversations',
    () => ({
        useTransformToneOfVoiceConversations: () => ({
            previewConversation: {
                messages: [
                    {
                        content: "I'd like to return a pair of shoes.",
                        isHtml: false,
                        fromAgent: false,
                        attachments: [],
                    },
                    {
                        content: 'Returning is simple!',
                        isHtml: true,
                        fromAgent: true,
                        attachments: [],
                    },
                ],
            },
            isPreviewLoading: false,
        }),
    }),
)

jest.mock('state/integrations/selectors', () => ({
    getShopifyIntegrationByShopName: () => () => ({
        toJS: () => ({
            id: 123,
            meta: { shop_domain: 'test-shop.myshopify.com' },
        }),
    }),
}))

const mockStore = configureMockStore()

describe('ToneOfVoiceStep', () => {
    const mockGoToStep = jest.fn()
    const defaultProps = {
        currentStep: 2,
        totalSteps: 3,
        goToStep: mockGoToStep,
        isStoreSelected: false,
    }

    let queryClient: QueryClient

    const createMockState = () => ({
        currentAccount: fromJS(account),
        billing: fromJS(billingState),
        integrations: fromJS(integrationsState).mergeDeep({
            integrations: [
                {
                    ...shopifyIntegration,
                    meta: {
                        ...shopifyIntegration.meta,
                        shop_domain: 'test-shop.myshopify.com',
                    },
                },
            ],
        }),
        currentUser: fromJS(user),
    })

    beforeEach(() => {
        jest.clearAllMocks()
        queryClient = new QueryClient({
            defaultOptions: {
                queries: { retry: false },
                mutations: { retry: false },
            },
        })

        useGetOnboardingDataMock.mockReturnValue({
            data: mockOnboardingData,
            isLoading: false,
        })

        useUpdateOnboardingMock.mockReturnValue({
            mutate: mockMutate,
            isLoading: false,
        })

        useCreateOnboardingMock.mockReturnValue({
            mutate: mockCreateMutate,
            isLoading: false,
        })
    })

    const renderComponent = (props = defaultProps) => {
        const store = mockStore(createMockState())
        return render(
            <Provider store={store}>
                <QueryClientProvider client={queryClient}>
                    <MemoryRouter
                        initialEntries={[
                            '/app/ai-agent/shopify/test-shop/onboarding/tone-of-voice',
                        ]}
                    >
                        <Route path="/app/ai-agent/:shopType/:shopName/onboarding/:step">
                            <ToneOfVoiceStep {...props} />
                        </Route>
                    </MemoryRouter>
                </QueryClientProvider>
            </Provider>,
        )
    }

    describe('Rendering', () => {
        it('should render with correct title', () => {
            renderComponent()

            expect(
                screen.getByText('Choose a tone that matches your brand'),
            ).toBeInTheDocument()
        })

        it('should render description text', () => {
            renderComponent()

            expect(
                screen.getByText(/set the personality of your ai agent/i),
            ).toBeInTheDocument()
        })
    })

    describe('Navigation', () => {
        it('should navigate to next step when Next button is clicked', async () => {
            const user = userEvent.setup()
            renderComponent()

            const nextButton = screen.getByRole('button', { name: /next/i })
            await user.click(nextButton)

            expect(mockGoToStep).toHaveBeenCalledWith('step3')
        })

        it('should navigate to previous step when Back button is clicked', async () => {
            const user = userEvent.setup()
            renderComponent()

            const backButton = screen.getByRole('button', { name: /back/i })
            await user.click(backButton)

            expect(mockGoToStep).toHaveBeenCalledWith('step1')
        })
    })

    describe('Tone of Voice Selection', () => {
        it('should display Friendly tone by default', () => {
            renderComponent()

            expect(screen.getByText('Friendly')).toBeInTheDocument()
        })

        it('should allow selecting different tones', async () => {
            const user = userEvent.setup()
            renderComponent()

            const professionalOption = screen.getByText('Professional')
            await user.click(professionalOption)

            expect(screen.getByText('Professional')).toBeInTheDocument()
        })

        it('should show custom tone textarea when Custom is selected', async () => {
            const user = userEvent.setup()
            renderComponent()

            const customOption = screen.getByText('Custom')
            await user.click(customOption)

            expect(
                screen.getByLabelText(/custom tone of voice/i),
            ).toBeInTheDocument()
        })

        it('should display examples text for custom tone', async () => {
            const user = userEvent.setup()
            renderComponent()

            const customOption = screen.getByText('Custom')
            await user.click(customOption)

            expect(
                screen.getByText(/use a friendly and conversational tone/i),
            ).toBeInTheDocument()
        })
    })

    describe('Form Submission', () => {
        it('should call mutation with correct data when tone is changed', async () => {
            const user = userEvent.setup()
            renderComponent()

            const professionalOption = screen.getByText('Professional')
            await user.click(professionalOption)

            const nextButton = screen.getByRole('button', { name: /next/i })
            await user.click(nextButton)

            expect(mockMutate).toHaveBeenCalledWith(
                {
                    id: '123',
                    data: expect.objectContaining({
                        toneOfVoice: ToneOfVoice.Professional,
                    }),
                },
                expect.any(Object),
            )
        })

        it('should submit custom tone guidance when Custom is selected', async () => {
            const user = userEvent.setup()
            renderComponent()

            const customOption = screen.getByText('Custom')
            await user.click(customOption)

            const textarea = screen.getByLabelText(/custom tone of voice/i)
            await user.type(textarea, 'Be concise and friendly')

            const nextButton = screen.getByRole('button', { name: /next/i })
            await user.click(nextButton)

            expect(mockMutate).toHaveBeenCalledWith(
                expect.objectContaining({
                    data: expect.objectContaining({
                        toneOfVoice: ToneOfVoice.Custom,
                        customToneOfVoiceGuidance: 'Be concise and friendly',
                    }),
                }),
                expect.any(Object),
            )
        })

        it('should skip mutation and go to next step if form unchanged', async () => {
            const user = userEvent.setup()
            renderComponent()

            const nextButton = screen.getByRole('button', { name: /next/i })
            await user.click(nextButton)

            expect(mockMutate).not.toHaveBeenCalled()
            expect(mockGoToStep).toHaveBeenCalledWith('step3')
        })
    })

    describe('Create vs Update Logic', () => {
        it('should call create mutation when data has no id', async () => {
            const user = userEvent.setup()

            useGetOnboardingDataMock.mockReturnValue({
                data: {
                    shopName: 'test-shop',
                    toneOfVoice: ToneOfVoice.Friendly,
                    customToneOfVoiceGuidance: undefined,
                },
                isLoading: false,
            })

            renderComponent()

            const professionalOption = screen.getByText('Professional')
            await user.click(professionalOption)

            const nextButton = screen.getByRole('button', { name: /next/i })
            await user.click(nextButton)

            expect(mockCreateMutate).toHaveBeenCalledWith(
                expect.objectContaining({
                    shopName: 'test-shop',
                    toneOfVoice: ToneOfVoice.Professional,
                }),
                expect.any(Object),
            )
            expect(mockMutate).not.toHaveBeenCalled()
        })

        it('should call create mutation even when form unchanged but no id exists', async () => {
            const user = userEvent.setup()

            useGetOnboardingDataMock.mockReturnValue({
                data: {
                    shopName: 'test-shop',
                    toneOfVoice: ToneOfVoice.Friendly,
                    customToneOfVoiceGuidance: undefined,
                },
                isLoading: false,
            })

            renderComponent()

            const nextButton = screen.getByRole('button', { name: /next/i })
            await user.click(nextButton)

            expect(mockCreateMutate).toHaveBeenCalled()
            expect(mockMutate).not.toHaveBeenCalled()
        })
    })
})
