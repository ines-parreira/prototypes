import {QueryClient, QueryClientProvider} from '@tanstack/react-query'
import {fireEvent, screen, waitFor} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {createMemoryHistory} from 'history'

import {fromJS, Map} from 'immutable'

import React from 'react'

import {Provider} from 'react-redux'
import configureMockStore from 'redux-mock-store'

import {account} from 'fixtures/account'
import {billingState} from 'fixtures/billing'
import {chatIntegrationFixtures} from 'fixtures/chat'
import {integrationsState, shopifyIntegration} from 'fixtures/integrations'
import {
    getOnboardingData,
    updateOnboardingData,
} from 'models/aiAgent/resources/configuration'
import {ChannelsStep} from 'pages/aiAgent/Onboarding/components/steps/ChannelsStep/ChannelsStep'
import {DiscountStrategy} from 'pages/aiAgent/Onboarding/components/steps/PersonalityStep/DiscountStrategy'
import {PersuasionLevel} from 'pages/aiAgent/Onboarding/components/steps/PersonalityStep/PersuasionLevel'
import {StepProps} from 'pages/aiAgent/Onboarding/components/steps/types'

import {AiAgentScopes, WizardStepEnum} from 'pages/aiAgent/Onboarding/types'

import {useShopifyIntegrationAndScope} from 'pages/common/hooks/useShopifyIntegrationAndScope'
import {notify} from 'state/notifications/actions'
import {NotificationStatus} from 'state/notifications/types'
import {RootState, StoreDispatch} from 'state/types'
import {renderWithRouter} from 'utils/testing'

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

jest.mock('pages/aiAgent/Onboarding/hooks/useCheckStoreIntegration', () => ({
    __esModule: true,
    default: jest.fn(),
}))

jest.useFakeTimers()

jest.mock('models/aiAgent/resources/configuration', () => ({
    getOnboardingData: jest.fn(),
    updateOnboardingData: jest.fn(),
}))

const mockGetOnboardingData = getOnboardingData as jest.Mock
const mockUpdateOnboardingData = updateOnboardingData as jest.Mock

const queryClient = new QueryClient()

const goToStep = jest.fn()

const title = /Next, which channels would you like/

const history = createMemoryHistory({
    initialEntries: [
        `/app/ai-agent/shopify/${shopifyIntegration.meta.shop_name}/onboarding/channels`,
    ],
})

const defaultProps: StepProps = {
    currentStep: 2,
    totalSteps: 3,
    goToStep,
}

const renderWithProvider = (state?: RootState, props = defaultProps) => {
    return renderWithRouter(
        <QueryClientProvider client={queryClient}>
            <Provider store={mockStore(state ?? defaultState)}>
                <ChannelsStep {...props} />
            </Provider>
        </QueryClientProvider>,
        {
            history,
            path: '/app/ai-agent/:shopType/:shopName/onboarding/:step',
            route: `/app/ai-agent/shopify/${shopifyIntegration.meta.shop_name}/onboarding/channels`,
        }
    )
}

describe('ChannelsStep - Empty state', () => {
    beforeEach(() => {
        mockUseShopifyIntegrationAndScope.mockReturnValue({integration: true})

        // ✅ Mock getOnboardingData function
        mockGetOnboardingData.mockResolvedValue(
            Promise.resolve([
                {
                    id: 1,
                    salesPersuasionLevel: PersuasionLevel.Moderate,
                    salesDiscountStrategyLevel: DiscountStrategy.Balanced,
                    salesDiscountMax: 0.8,
                    scopes: [AiAgentScopes.SUPPORT, AiAgentScopes.SALES],
                    shopName: shopifyIntegration.meta.shop_name,
                },
            ])
        )

        // // ✅ Mock updateOnboardingData function
        mockUpdateOnboardingData.mockResolvedValue(
            Promise.resolve({
                success: true,
            })
        )
    })

    afterAll(() => {
        queryClient.clear()
    })

    it('renders the component with main title and cards', async () => {
        renderWithProvider()

        jest.runAllTimers()

        // Components are rendered
        expect(screen.getByText(title)).toBeInTheDocument()

        await waitFor(() => {
            expect(
                screen.getByText(
                    'Enable your AI Agent to respond to customers via email.'
                )
            ).toBeInTheDocument()
        })
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
        expect(screen.getByText(title)).toBeInTheDocument()

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
        expect(screen.getByText(title)).toBeInTheDocument()

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
        expect(screen.getByText(title)).toBeInTheDocument()

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
        expect(screen.getByText(title)).toBeInTheDocument()

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
        renderWithProvider(undefined, {...defaultProps, currentStep: 3})

        jest.runAllTimers()

        fireEvent.click(screen.getByText(/Back/i))

        await waitFor(() => {
            expect(goToStep).toHaveBeenCalledWith(
                WizardStepEnum.SHOPIFY_INTEGRATION
            )
        })
    })
})

describe('ChannelsStep - With preloaded data', () => {
    beforeEach(() => {
        mockUseShopifyIntegrationAndScope.mockReturnValue({integration: true})

        // ✅ Mock getOnboardingData function
        mockGetOnboardingData.mockResolvedValue(
            Promise.resolve([
                {
                    id: 1,
                    salesPersuasionLevel: PersuasionLevel.Moderate,
                    salesDiscountStrategyLevel: DiscountStrategy.Balanced,
                    salesDiscountMax: 0.8,
                    scopes: [AiAgentScopes.SUPPORT, AiAgentScopes.SALES],
                    shopName: shopifyIntegration.meta.shop_name,
                    emailIntegrationIds: [5],
                    chatIntegrationIds: [3],
                },
            ])
        )

        // // ✅ Mock updateOnboardingData function
        mockUpdateOnboardingData.mockResolvedValue(
            Promise.resolve({
                success: true,
            })
        )
    })

    it('should allow navigating to next step when isDirty is false', async () => {
        // ✅ Mock getOnboardingData function
        mockGetOnboardingData.mockResolvedValue(
            Promise.resolve([
                {
                    id: 1,
                    salesPersuasionLevel: PersuasionLevel.Moderate,
                    salesDiscountStrategyLevel: DiscountStrategy.Balanced,
                    salesDiscountMax: 0.8,
                    scopes: [AiAgentScopes.SUPPORT, AiAgentScopes.SALES],
                    shopName: shopifyIntegration.meta.shop_name,
                    emailIntegrationIds: [5],
                    chatIntegrationIds: [3],
                },
            ])
        )

        const screen = renderWithProvider()

        jest.runAllTimers()

        // Ensure email and chat checkboxes are already checked (form is pre-filled)
        await waitFor(() => {
            expect(screen.getByLabelText('Email')).toBeChecked()
            expect(screen.getByLabelText('Chat')).toBeChecked()
        })

        // Click on Next button
        const nextButton = screen.getByText('Next')
        userEvent.click(nextButton)

        jest.runAllTimers()

        // Since isDirty is false, updateOnboardingData should NOT be called
        expect(mockUpdateOnboardingData).not.toHaveBeenCalled()

        // Wait for goToStep to be called directly
        await waitFor(() => {
            expect(defaultProps.goToStep).toHaveBeenCalledWith(
                WizardStepEnum.PERSONALITY_PREVIEW
            )
        })
    })
})
