import React from 'react'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, fireEvent, screen } from '@testing-library/react'
import AxiosMock from 'axios-mock-adapter'
import { fromJS, Map } from 'immutable'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'

import { account } from 'fixtures/account'
import { billingState } from 'fixtures/billing'
import { chatIntegrationFixtures } from 'fixtures/chat'
import { integrationsState, shopifyIntegration } from 'fixtures/integrations'
import axiosClient from 'models/api/resources'
import { SkillsetStep } from 'pages/aiAgent/Onboarding/components/steps/SkillsetStep/SkillsetStep'
import { useCreateOnboarding } from 'pages/aiAgent/Onboarding/hooks/useCreateOnboarding'
import {
    defaultOnboardingData,
    useGetOnboardingData,
} from 'pages/aiAgent/Onboarding/hooks/useGetOnboardingData'
import { useUpdateOnboarding } from 'pages/aiAgent/Onboarding/hooks/useUpdateOnboarding'
import { WizardStepEnum } from 'pages/aiAgent/Onboarding/types'
import { useShopifyIntegrationAndScope } from 'pages/common/hooks/useShopifyIntegrationAndScope'
import { useEmailIntegrations } from 'pages/settings/contactForm/hooks/useEmailIntegrations'
import { RootState, StoreDispatch } from 'state/types'
import { renderWithRouter } from 'utils/testing'

type MutationOptions = { onSuccess: () => void }

// Mock the hooks
jest.mock('pages/aiAgent/Onboarding/hooks/useGetOnboardingData', () => ({
    useGetOnboardingData: jest.fn(),
}))

jest.mock('pages/aiAgent/Onboarding/hooks/useUpdateOnboarding', () => ({
    useUpdateOnboarding: jest.fn(),
}))
jest.mock('pages/aiAgent/Onboarding/hooks/useCreateOnboarding', () => ({
    useCreateOnboarding: jest.fn(),
}))

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

jest.mock(
    'pages/aiAgent/Onboarding/components/AiAgentChatConversation/AiAgentChatConversation',
    () => ({
        __esModule: true,
        default: () => <div>AI Agent Preview</div>,
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
                />
            </Provider>
        </QueryClientProvider>,
    )
}

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
        axiosMock.onGet('PHRASE_PREDICTION_URL').reply(200, [])
    })

    beforeAll(() => {
        jest.useFakeTimers()
    })

    afterAll(() => {
        jest.useRealTimers()
    })

    it('renders', () => {
        renderComponent()

        jest.runAllTimers()

        expect(
            screen.getByText('Welcome to Conversational AI!'),
        ).toBeInTheDocument()
    })

    it('user can select a goal and click next when there is an integration', () => {
        renderComponent()

        jest.runAllTimers()

        expect(screen.getByText('Automate support with AI')).toBeInTheDocument()

        act(() => {
            fireEvent.click(screen.getByText('Automate support with AI'))
        })

        fireEvent.click(screen.getByText(/Next/i))

        expect(mockCreateOnboarding).toHaveBeenCalledWith(
            expect.objectContaining({ scopes: ['support'] }),
            expect.objectContaining({ onSuccess: expect.any(Function) }),
        )

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

    it('user can select a goal and click next when there is not an integration', () => {
        mockUseShopifyIntegrationAndScope.mockReturnValue({
            integration: false,
        })

        renderComponent()

        jest.runAllTimers()

        expect(screen.getByText('Automate support with AI')).toBeInTheDocument()

        act(() => {
            fireEvent.click(screen.getByText('Automate support with AI'))
        })

        fireEvent.click(screen.getByText(/Next/i))

        expect(mockCreateOnboarding).toHaveBeenCalledWith(
            expect.objectContaining({ scopes: ['support'] }),
            expect.objectContaining({ onSuccess: expect.any(Function) }),
        )

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

    it('user can select a goal and click next when there is no email integration', () => {
        mockUseEmailIntegrations.mockReturnValue({
            emailIntegrations: false,
            defaultIntegration: false,
        })

        renderComponent()

        jest.runAllTimers()

        expect(screen.getByText('Automate support with AI')).toBeInTheDocument()

        act(() => {
            fireEvent.click(screen.getByText('Automate support with AI'))
        })

        fireEvent.click(screen.getByText(/Next/i))

        expect(mockCreateOnboarding).toHaveBeenCalledWith(
            expect.objectContaining({ scopes: ['support'] }),
            expect.objectContaining({ onSuccess: expect.any(Function) }),
        )

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
