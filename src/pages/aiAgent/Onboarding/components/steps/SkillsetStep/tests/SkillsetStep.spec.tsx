import React from 'react'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, fireEvent, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import AxiosMock from 'axios-mock-adapter'
import { fromJS, Map } from 'immutable'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'

import { account } from 'fixtures/account'
import { billingState } from 'fixtures/billing'
import { chatIntegrationFixtures } from 'fixtures/chat'
import { integrationsState, shopifyIntegration } from 'fixtures/integrations'
import axiosClient from 'models/api/resources'
import { ToneOfVoice } from 'pages/aiAgent/constants'
import { conversationExamples } from 'pages/aiAgent/Onboarding/components/steps/PersonalityPreviewStep/conversationsExamples'
import { SkillsetStep } from 'pages/aiAgent/Onboarding/components/steps/SkillsetStep/SkillsetStep'
import { useCreateOnboarding } from 'pages/aiAgent/Onboarding/hooks/useCreateOnboarding'
import { useGenerateToneOfVoice } from 'pages/aiAgent/Onboarding/hooks/useGenerateToneOfVoice'
import {
    defaultOnboardingData,
    useGetOnboardingData,
} from 'pages/aiAgent/Onboarding/hooks/useGetOnboardingData'
import { useUpdateOnboarding } from 'pages/aiAgent/Onboarding/hooks/useUpdateOnboarding'
import { WizardStepEnum } from 'pages/aiAgent/Onboarding/types'
import { useShopifyIntegrationAndScope } from 'pages/common/hooks/useShopifyIntegrationAndScope'
import { useEmailIntegrations } from 'pages/settings/contactForm/hooks/useEmailIntegrations'
import { RootState, StoreDispatch } from 'state/types'
import { assumeMock, renderWithRouter } from 'utils/testing'

type MutationOptions = { onSuccess: () => void }

// Mock the hooks
jest.mock('pages/aiAgent/Onboarding/hooks/useGetOnboardingData', () => {
    const actualModule = jest.requireActual(
        'pages/aiAgent/Onboarding/hooks/useGetOnboardingData',
    )
    return {
        ...actualModule,
        useGetOnboardingData: jest.fn(),
    }
})

jest.mock('pages/aiAgent/Onboarding/hooks/useUpdateOnboarding', () => ({
    useUpdateOnboarding: jest.fn(),
}))
jest.mock('pages/aiAgent/Onboarding/hooks/useCreateOnboarding', () => ({
    useCreateOnboarding: jest.fn(),
}))

jest.mock('pages/aiAgent/Onboarding/hooks/useGenerateToneOfVoice')
const useGenerateToneOfVoiceMock = assumeMock(useGenerateToneOfVoice)

const axiosMock = new AxiosMock(axiosClient)

jest.mock('pages/common/hooks/useShopifyIntegrationAndScope')
jest.mock('pages/settings/contactForm/hooks/useEmailIntegrations')

jest.mock(
    'pages/integrations/integration/components/gorgias_chat/GorgiasChatIntegrationPreview/ChatIntegrationPreview',
    () => ({
        __esModule: true,
        default: ({ children }: { children: React.ReactNode }) => (
            <div>{children}</div>
        ),
    }),
)

const mockUseShopifyIntegrationAndScope =
    useShopifyIntegrationAndScope as jest.Mock
const mockUseEmailIntegrations = useEmailIntegrations as jest.Mock
const mockUseGetOnboardingData = useGetOnboardingData as jest.Mock
const mockUseUpdateOnboarding = useUpdateOnboarding as jest.Mock
const mockUseCreateOnboarding = useCreateOnboarding as jest.Mock
const mockUpdateOnboarding = jest.fn()
const mockCreateOnboarding = jest.fn()

const queryClient = new QueryClient()

const goToStep = jest.fn()

const mockStore = configureMockStore<RootState, StoreDispatch>()

const defaultState = {
    currentAccount: fromJS(account),
    billing: fromJS(billingState),
    integrations: (fromJS(integrationsState) as Map<any, any>).mergeDeep({
        integrations: [shopifyIntegration, ...chatIntegrationFixtures],
    }),
} as RootState

const renderComponent = () => {
    return renderWithRouter(
        <QueryClientProvider client={queryClient}>
            <Provider store={mockStore(defaultState)}>
                <SkillsetStep
                    currentStep={1}
                    totalSteps={3}
                    goToStep={goToStep}
                    setSelectedScope={jest.fn()}
                />
            </Provider>
        </QueryClientProvider>,
        {
            path: '/app/ai-agent/:shopType/:shopName/onboarding',
            route: `/app/ai-agent/${shopifyIntegration.type}/${shopifyIntegration.name}/onboarding`,
        },
    )
}

const TONE_OF_VOICE = 'Here is the tone of voice'

describe('<SkillsetStep />', () => {
    beforeEach(() => {
        // Populate the return values of the mocked hooks
        mockUseShopifyIntegrationAndScope.mockReturnValue({
            integration: true,
        })
        mockUseEmailIntegrations.mockReturnValue({
            emailIntegrations: true,
            defaultIntegration: true,
        })
        mockUseGetOnboardingData.mockReturnValue({
            data: defaultOnboardingData,
        })

        mockUseUpdateOnboarding.mockReturnValue({
            mutate: mockUpdateOnboarding,
            isLoading: false,
        })

        mockUseCreateOnboarding.mockReturnValue({
            mutate: mockCreateOnboarding,
            isLoading: false,
        })

        useGenerateToneOfVoiceMock.mockReturnValue({
            isLoading: false,
            generateToneOfVoice: jest.fn().mockResolvedValue(TONE_OF_VOICE),
        })

        axiosMock.onGet('PHRASE_PREDICTION_URL').reply(200, [])
    })

    it('renders', () => {
        renderComponent()

        expect(screen.getByText(/Welcome to AI Agent!/i)).toBeInTheDocument()
    })

    it('user can select a goal and click next when there is an integration', async () => {
        renderComponent()

        expect(screen.getByText('Automate support with AI')).toBeInTheDocument()

        act(() => {
            fireEvent.click(screen.getByText('Automate support with AI'))
        })

        fireEvent.click(screen.getByText(/Next/i))

        await waitFor(() => {
            expect(mockCreateOnboarding).toHaveBeenCalledWith(
                expect.objectContaining({ scopes: ['support'] }),
                expect.objectContaining({ onSuccess: expect.any(Function) }),
            )
        })

        /* eslint-disable @typescript-eslint/no-unsafe-member-access */
        const onSuccessCallback = (
            mockCreateOnboarding.mock.calls[0][1] as MutationOptions
        ).onSuccess

        // ✅ Manually trigger `onSuccess`
        act(() => {
            onSuccessCallback()
        })

        expect(goToStep).toHaveBeenCalledWith(WizardStepEnum.CHANNELS)
    })

    it('user can select a goal and click next when there is not an integration', async () => {
        mockUseShopifyIntegrationAndScope.mockReturnValue({
            integration: false,
        })

        renderComponent()

        expect(screen.getByText('Automate support with AI')).toBeInTheDocument()

        act(() => {
            fireEvent.click(screen.getByText('Automate support with AI'))
        })

        fireEvent.click(screen.getByText(/Next/i))

        await waitFor(() => {
            expect(mockCreateOnboarding).toHaveBeenCalledWith(
                expect.objectContaining({ scopes: ['support'] }),
                expect.objectContaining({ onSuccess: expect.any(Function) }),
            )
        })

        const onSuccessCallback = (
            mockCreateOnboarding.mock.calls[0][1] as MutationOptions
        ).onSuccess

        // ✅ Manually trigger `onSuccess`
        act(() => {
            onSuccessCallback()
        })

        expect(goToStep).toHaveBeenCalledWith(
            WizardStepEnum.SHOPIFY_INTEGRATION,
        )
    })

    it('user can select a goal and click next when there is no email integration', async () => {
        mockUseEmailIntegrations.mockReturnValue({
            emailIntegrations: false,
            defaultIntegration: false,
        })

        renderComponent()

        expect(screen.getByText('Automate support with AI')).toBeInTheDocument()

        act(() => {
            fireEvent.click(screen.getByText('Automate support with AI'))
        })

        fireEvent.click(screen.getByText(/Next/i))

        await waitFor(() => {
            expect(mockCreateOnboarding).toHaveBeenCalledWith(
                expect.objectContaining({ scopes: ['support'] }),
                expect.objectContaining({ onSuccess: expect.any(Function) }),
            )
        })

        const onSuccessCallback = (
            mockCreateOnboarding.mock.calls[0][1] as MutationOptions
        ).onSuccess

        // ✅ Manually trigger `onSuccess`
        act(() => {
            onSuccessCallback()
        })

        expect(goToStep).toHaveBeenCalledWith(WizardStepEnum.EMAIL_INTEGRATION)
    })
})

describe('<SkillsetStep /> - Show correct preview', () => {
    beforeEach(() => {
        // Populate the return values of the mocked hooks
        mockUseShopifyIntegrationAndScope.mockReturnValue({
            integration: true,
        })
        mockUseEmailIntegrations.mockReturnValue({
            emailIntegrations: true,
            defaultIntegration: true,
        })
        mockUseGetOnboardingData.mockReturnValue({
            data: defaultOnboardingData,
        })

        mockUseUpdateOnboarding.mockReturnValue({
            mutate: mockUpdateOnboarding,
            isLoading: false,
        })

        mockUseCreateOnboarding.mockReturnValue({
            mutate: mockCreateOnboarding,
            isLoading: false,
        })

        useGenerateToneOfVoiceMock.mockReturnValue({
            isLoading: false,
            generateToneOfVoice: jest.fn().mockResolvedValue(TONE_OF_VOICE),
        })

        axiosMock.onGet('PHRASE_PREDICTION_URL').reply(200, [])
    })

    const goals = [
        {
            cta: 'Automate support with AI',
            firstExpectedMessage:
                conversationExamples.orderStatusAndTracking.messages[0].content,
        },
        {
            cta: 'Boost Sales with a Personal Shopping Assistant',
            firstExpectedMessage:
                conversationExamples.productRecommendations.messages[0].content,
        },
        {
            cta: 'Automate Support and Boost Sales',
            firstExpectedMessage:
                conversationExamples.discountCode.messages[0].content,
        },
    ]

    it.each(goals)(
        'renders the correct preview for the goal: %s',
        async ({ cta, firstExpectedMessage }) => {
            renderComponent()

            userEvent.click(screen.getByText(cta))

            expect(screen.getByText(firstExpectedMessage)).toBeInTheDocument()
        },
    )
})

describe('<SkillsetStep /> - Shop name and type provided', () => {
    beforeEach(() => {
        // Populate the return values of the mocked hooks
        mockUseShopifyIntegrationAndScope.mockReturnValue({
            integration: true,
        })
        mockUseEmailIntegrations.mockReturnValue({
            emailIntegrations: true,
            defaultIntegration: true,
        })
        mockUseGetOnboardingData.mockReturnValue({
            data: defaultOnboardingData,
        })

        mockUseUpdateOnboarding.mockReturnValue({
            mutate: mockUpdateOnboarding,
            isLoading: false,
        })

        mockUseCreateOnboarding.mockReturnValue({
            mutate: mockCreateOnboarding,
            isLoading: false,
        })

        useGenerateToneOfVoiceMock.mockReturnValue({
            isLoading: false,
            generateToneOfVoice: jest.fn().mockResolvedValue(TONE_OF_VOICE),
        })

        axiosMock.onGet('PHRASE_PREDICTION_URL').reply(200, [])
    })

    it('should include shop name and type on create onboarding', async () => {
        renderComponent()

        act(() => {
            fireEvent.click(screen.getByText('Automate support with AI'))
        })

        fireEvent.click(screen.getByText(/Next/i))

        await waitFor(() => {
            expect(mockCreateOnboarding).toHaveBeenCalledWith(
                expect.objectContaining({
                    scopes: ['support'],
                    shopName: shopifyIntegration.name,
                    shopType: shopifyIntegration.type,
                    toneOfVoice: ToneOfVoice.Custom,
                    customToneOfVoiceGuidance: TONE_OF_VOICE,
                }),
                expect.objectContaining({ onSuccess: expect.any(Function) }),
            )
        })
    })

    it('should include shop name and type on update onboarding', async () => {
        const data = { ...defaultOnboardingData, scopes: [], id: '1' }
        mockUseGetOnboardingData.mockReturnValue({
            data,
        })

        renderComponent()

        act(() => {
            fireEvent.click(screen.getByText('Automate support with AI'))
        })

        fireEvent.click(screen.getByText(/Next/i))

        await waitFor(() => {
            expect(mockUpdateOnboarding).toHaveBeenCalledWith(
                expect.objectContaining({
                    id: '1',
                    data: expect.objectContaining({
                        scopes: ['support'],
                        shopName: shopifyIntegration.name,
                        shopType: shopifyIntegration.type,
                        toneOfVoice: ToneOfVoice.Custom,
                        customToneOfVoiceGuidance: TONE_OF_VOICE,
                    }),
                }),
                expect.objectContaining({ onSuccess: expect.any(Function) }),
            )
        })
    })
})
