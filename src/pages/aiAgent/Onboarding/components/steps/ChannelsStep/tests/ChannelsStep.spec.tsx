import {QueryClient, QueryClientProvider} from '@tanstack/react-query'
import {fireEvent, render, screen, waitFor} from '@testing-library/react'

import userEvent from '@testing-library/user-event'
import {fromJS, Map} from 'immutable'

import React from 'react'

import {Provider} from 'react-redux'
import configureMockStore from 'redux-mock-store'

import {account} from 'fixtures/account'
import {billingState} from 'fixtures/billing'
import {chatIntegrationFixtures} from 'fixtures/chat'
import {integrationsState, shopifyIntegration} from 'fixtures/integrations'
import {ChannelsStep} from 'pages/aiAgent/Onboarding/components/steps/ChannelsStep/ChannelsStep'
import {DiscountStrategy} from 'pages/aiAgent/Onboarding/components/steps/PersonalityStep/DiscountStrategy'
import {PersuasionLevel} from 'pages/aiAgent/Onboarding/components/steps/PersonalityStep/PersuasionLevel'
import {StepProps} from 'pages/aiAgent/Onboarding/components/steps/types'
import {
    useGetOnboardingData,
    useUpdateOnboardingCache,
} from 'pages/aiAgent/Onboarding/hooks/useGetOnboardingData'

import {AiAgentScopes, WizardStepEnum} from 'pages/aiAgent/Onboarding/types'

import {useShopifyIntegrationAndScope} from 'pages/common/hooks/useShopifyIntegrationAndScope'
import {notify} from 'state/notifications/actions'
import {NotificationStatus} from 'state/notifications/types'
import {RootState, StoreDispatch} from 'state/types'

const mockStore = configureMockStore<RootState, StoreDispatch>()

jest.mock('pages/common/hooks/useShopifyIntegrationAndScope', () => ({
    useShopifyIntegrationAndScope: jest.fn(),
}))

const mockUseShopifyIntegrationAndScope =
    useShopifyIntegrationAndScope as jest.Mock

const defaultState = {
    currentAccount: fromJS(account),
    billing: fromJS(billingState),
    integrations: (fromJS(integrationsState) as Map<any, any>).mergeDeep({
        integrations: [shopifyIntegration, ...chatIntegrationFixtures],
    }),
} as RootState

const mockedDispatch = jest.fn()
jest.mock('hooks/useAppDispatch', () => () => mockedDispatch)
jest.mock('state/integrations/actions')

jest.mock('state/notifications/actions')

jest.mock('pages/aiAgent/Onboarding/hooks/useGetOnboardingData', () => ({
    useGetOnboardingData: jest.fn(),
    useUpdateOnboardingCache: jest.fn(),
}))

jest.mock('pages/aiAgent/Onboarding/hooks/useCheckStoreIntegration', () => ({
    __esModule: true,
    default: jest.fn(),
}))

jest.useFakeTimers()

const mockUseGetOnboardingData = useGetOnboardingData as jest.Mock

const mockUseUpdateOnboardingCache = useUpdateOnboardingCache as jest.Mock

const queryClient = new QueryClient()

const goToStep = jest.fn()

describe('ChannelsStep', () => {
    beforeEach(() => {
        // Populate the return values of the mocked hooks
        mockUseGetOnboardingData.mockReturnValue({
            data: {
                persuasionLevel: PersuasionLevel.Moderate,
                discountStrategy: DiscountStrategy.Balanced,
                maxDiscountPercentage: 8,
                scope: [AiAgentScopes.SUPPORT, AiAgentScopes.SALES],
                shop: shopifyIntegration.meta.shop_name,
            },
        })

        mockUseUpdateOnboardingCache.mockReturnValue(jest.fn())
        mockUseShopifyIntegrationAndScope.mockReturnValue({integration: true})
    })

    const defaultProps: StepProps = {
        currentStep: 2,
        totalSteps: 3,
        goToStep,
    }

    const renderWithProvider = (state?: RootState, props = defaultProps) => {
        return render(
            <QueryClientProvider client={queryClient}>
                <Provider store={mockStore(state ?? defaultState)}>
                    <ChannelsStep {...props} />
                </Provider>
            </QueryClientProvider>
        )
    }

    it('renders the component with main title and cards', () => {
        renderWithProvider()

        jest.runAllTimers()

        // Components are rendered
        expect(
            screen.getByText(/Choose which channels to use with/)
        ).toBeInTheDocument()

        expect(
            screen.getByText(
                'Enable your AI Agent to respond to customers via email.'
            )
        ).toBeInTheDocument()
    })

    it('renders the dropdowns and allow next step', async () => {
        renderWithProvider()

        jest.runAllTimers()

        expect(
            screen.getByText(
                'Enable your AI Agent to respond to customers via email.'
            )
        ).toBeInTheDocument()
        expect(
            screen.getByText(
                'Enable your AI Agent to respond to customers via chat.'
            )
        ).toBeInTheDocument()

        // Setup email
        const emailCheckbox = screen.getByLabelText('Email')
        userEvent.click(emailCheckbox)
        expect(emailCheckbox).toBeChecked()

        expect(
            screen.queryByText(/AI agent will respond to the following emails/)
        ).toBeInTheDocument()

        fireEvent.focus(screen.getByText('Select one or more email addresses'))
        fireEvent.click(screen.getByText('support@acme.gorgias.io'))

        // Setup chat
        const chatCheckbox = screen.getByLabelText('Chat')
        userEvent.click(chatCheckbox)
        expect(chatCheckbox).toBeChecked()

        expect(
            screen.queryByText(
                /AI Agent responds to tickets sent to the following Chats/
            )
        ).toBeInTheDocument()

        fireEvent.focus(
            screen.getByText('Select one or more chat integrations')
        )
        fireEvent.click(screen.getByText('New chat'))

        // Click on next button
        const nextButton = screen.getByText('Next')
        userEvent.click(nextButton)

        jest.runAllTimers()

        // Wait for goToStep to be called
        await waitFor(() => {
            expect(defaultProps.goToStep).toHaveBeenCalledWith(
                WizardStepEnum.PERSONALITY_PREVIEW
            )
        })
    })

    it('handles error on no channel', async () => {
        renderWithProvider()

        jest.runAllTimers()

        // Components are rendered
        expect(
            screen.getByText(/Choose which channels to use with/)
        ).toBeInTheDocument()

        expect(
            screen.getByText(
                'Enable your AI Agent to respond to customers via email.'
            )
        ).toBeInTheDocument()
        expect(
            screen.getByText(
                'Enable your AI Agent to respond to customers via chat.'
            )
        ).toBeInTheDocument()

        expect(screen.getByLabelText('Chat')).not.toBeChecked()
        expect(screen.getByLabelText('Email')).not.toBeChecked()

        // Click on next button
        const nextButton = screen.getByText('Next')
        userEvent.click(nextButton)
        expect(defaultProps.goToStep).not.toHaveBeenCalled()

        jest.runAllTimers()

        await waitFor(() => {
            expect(
                screen.getByText(
                    'Please select at least one option to continue.'
                )
            ).toBeInTheDocument()
        })
    })

    it('handles error on no selecting email', () => {
        renderWithProvider()

        jest.runAllTimers()

        // Components are rendered
        expect(
            screen.getByText(/Choose which channels to use with/)
        ).toBeInTheDocument()

        expect(
            screen.getByText(
                'Enable your AI Agent to respond to customers via email.'
            )
        ).toBeInTheDocument()
        expect(
            screen.getByText(
                'Enable your AI Agent to respond to customers via chat.'
            )
        ).toBeInTheDocument()

        // Setup email
        const emailCheckbox = screen.getByLabelText('Email')
        userEvent.click(emailCheckbox)
        expect(emailCheckbox).toBeChecked()

        // Click on next button
        const nextButton = screen.getByText('Next')
        userEvent.click(nextButton)
        expect(defaultProps.goToStep).not.toHaveBeenCalled()
    })

    it('handles error on no selecting chat', () => {
        renderWithProvider()

        jest.runAllTimers()

        // Components are rendered
        expect(
            screen.getByText(/Choose which channels to use with/)
        ).toBeInTheDocument()

        expect(
            screen.getByText(
                'Enable your AI Agent to respond to customers via email.'
            )
        ).toBeInTheDocument()
        expect(
            screen.getByText(
                'Enable your AI Agent to respond to customers via chat.'
            )
        ).toBeInTheDocument()

        // Setup chat
        const chatCheckbox = screen.getByLabelText('Chat')
        userEvent.click(chatCheckbox)
        expect(chatCheckbox).toBeChecked()

        // Click on next button
        const nextButton = screen.getByText('Next')
        userEvent.click(nextButton)
        expect(defaultProps.goToStep).not.toHaveBeenCalled()
    })

    it('renders the chat creation', async () => {
        mockedDispatch.mockImplementationOnce(() => Promise.resolve())

        renderWithProvider({
            ...defaultState,
            integrations: (
                fromJS(integrationsState) as Map<any, any>
            ).mergeDeep({
                integrations: [shopifyIntegration],
            }),
        })

        jest.runAllTimers()

        // Components are rendered
        expect(
            screen.getByText(/Choose which channels to use with/)
        ).toBeInTheDocument()

        expect(
            screen.getByText(
                'Enable your AI Agent to respond to customers via email.'
            )
        ).toBeInTheDocument()
        expect(
            screen.getByText(
                'Enable your AI Agent to respond to customers via chat.'
            )
        ).toBeInTheDocument()

        // Setup chat
        const chatCheckbox = screen.getByLabelText('Chat')
        userEvent.click(chatCheckbox)
        expect(chatCheckbox).toBeChecked()

        expect(
            screen.queryByText(/Personalize your Chat widget/)
        ).toBeInTheDocument()

        // Click on next button
        const nextButton = screen.getByText('Next')
        userEvent.click(nextButton)

        jest.runAllTimers()

        await waitFor(() => {
            // Wait for goToStep to be called
            expect(defaultProps.goToStep).toHaveBeenCalledWith(
                WizardStepEnum.PERSONALITY_PREVIEW
            )
        })
    })

    it('renders the chat creation error', async () => {
        mockedDispatch.mockImplementationOnce(() =>
            Promise.reject(new Error('Error message'))
        )

        renderWithProvider({
            ...defaultState,
            integrations: (
                fromJS(integrationsState) as Map<any, any>
            ).mergeDeep({
                integrations: [shopifyIntegration],
            }),
        })

        jest.runAllTimers()

        // Setup chat
        const chatCheckbox = screen.getByLabelText('Chat')
        userEvent.click(chatCheckbox)
        expect(chatCheckbox).toBeChecked()

        expect(
            screen.queryByText(/Personalize your Chat widget/)
        ).toBeInTheDocument()

        // Click on next button
        const nextButton = screen.getByText('Next')
        userEvent.click(nextButton)

        jest.runAllTimers()

        await waitFor(() => {
            expect(notify).toHaveBeenCalledWith(
                expect.objectContaining({
                    message: 'Could not create chat integration',
                    status: NotificationStatus.Error,
                })
            )
        })
    })

    it('handles no store', () => {
        mockedDispatch.mockImplementationOnce(() => Promise.resolve())

        renderWithProvider()

        jest.runAllTimers()

        // Setup chat
        const chatCheckbox = screen.getByLabelText('Chat')
        userEvent.click(chatCheckbox)
        expect(chatCheckbox).toBeChecked()

        // Click on next button
        const nextButton = screen.getByText('Next')
        userEvent.click(nextButton)
        expect(defaultProps.goToStep).not.toHaveBeenCalled()
    })

    it('renders chat preview section', () => {
        renderWithProvider()

        jest.runAllTimers()

        expect(
            screen.getByText(
                'Hi, I’m after a long dress for everyday wear, something comfortable and cute.'
            )
        ).toBeInTheDocument()
    })

    it('navigates to the skillset step when Back is clicked and there is an integration', async () => {
        renderWithProvider()

        jest.runAllTimers()

        fireEvent.click(screen.getByText(/Back/i))

        await waitFor(() => {
            expect(goToStep).toHaveBeenCalledWith(WizardStepEnum.SKILLSET)
        })
    })

    it('navigates to the shopify integration step when Back is clicked and there is no integration', async () => {
        mockUseShopifyIntegrationAndScope.mockReturnValue({integration: false})
        renderWithProvider()

        jest.runAllTimers()

        fireEvent.click(screen.getByText(/Back/i))

        await waitFor(() => {
            expect(goToStep).toHaveBeenCalledWith(
                WizardStepEnum.SHOPIFY_INTEGRATION
            )
        })
    })
})
