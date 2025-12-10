import { FeatureFlagKey } from '@repo/feature-flags'
import { assumeMock } from '@repo/testing'
import { QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, screen, waitFor } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { createMemoryHistory } from 'history'
import type { Map } from 'immutable'
import { fromJS } from 'immutable'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import { useFlag } from 'core/flags'
import { account } from 'fixtures/account'
import { billingState } from 'fixtures/billing'
import { chatIntegrationFixtures } from 'fixtures/chat'
import { integrationsState, shopifyIntegration } from 'fixtures/integrations'
import type { StoreConfiguration } from 'models/aiAgent/types'
import type { EmailItem } from 'pages/aiAgent/components/EmailIntegrationListSelection/EmailIntegrationListSelection'
import { useStoreConfigurationForAccount } from 'pages/aiAgent/hooks/useStoreConfigurationForAccount'
import {
    ChannelsStep,
    chatSortingCallback,
    emailSortingCallback,
} from 'pages/aiAgent/Onboarding/components/steps/ChannelsStep/ChannelsStep'
import { usePreselectedChat } from 'pages/aiAgent/Onboarding/components/steps/ChannelsStep/hooks/usePreselectedChat'
import { usePreselectedEmails } from 'pages/aiAgent/Onboarding/components/steps/ChannelsStep/hooks/usePreselectedEmails'
import { useSelectedEmailsBeforeRedirect } from 'pages/aiAgent/Onboarding/components/steps/ChannelsStep/hooks/useSelectedEmailsBeforeRedirect'
import { useShouldDisplayEmailIntegrationsLink } from 'pages/aiAgent/Onboarding/components/steps/ChannelsStep/hooks/useShouldDisplayEmailIntegrationsLink'
import { conversationExamples } from 'pages/aiAgent/Onboarding/components/steps/PersonalityPreviewStep/conversationsExamples'
import { DiscountStrategy } from 'pages/aiAgent/Onboarding/components/steps/PersonalityStep/DiscountStrategy'
import { PersuasionLevel } from 'pages/aiAgent/Onboarding/components/steps/PersonalityStep/PersuasionLevel'
import type { StepProps } from 'pages/aiAgent/Onboarding/components/steps/types'
import { useAiAgentScopesForAutomationPlan } from 'pages/aiAgent/Onboarding/hooks/useAiAgentScopesForAutomationPlan'
import { useCreateOnboarding } from 'pages/aiAgent/Onboarding/hooks/useCreateOnboarding'
import { useGetOnboardingData } from 'pages/aiAgent/Onboarding/hooks/useGetOnboardingData'
import { useGetOnboardings } from 'pages/aiAgent/Onboarding/hooks/useGetOnboardings'
import { useTransformToneOfVoiceConversations } from 'pages/aiAgent/Onboarding/hooks/useTransformToneOfVoiceConversations'
import { useUpdateOnboarding } from 'pages/aiAgent/Onboarding/hooks/useUpdateOnboarding'
import { AiAgentScopes, WizardStepEnum } from 'pages/aiAgent/Onboarding/types'
import type { SelfServiceChatChannel } from 'pages/automate/common/hooks/useSelfServiceChatChannels'
import { useShopifyIntegrationAndScope } from 'pages/common/hooks/useShopifyIntegrationAndScope'
import { notify } from 'state/notifications/actions'
import { NotificationStatus } from 'state/notifications/types'
import type { RootState, StoreDispatch } from 'state/types'
import { mockQueryClient } from 'tests/reactQueryTestingUtils'
import { renderWithRouter } from 'utils/testing'

const mockStore = configureMockStore<RootState, StoreDispatch>([thunk])

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
jest.mock('services/socketManager')
jest.mock('state/notifications/actions')
const notifyMock = assumeMock(notify)

jest.mock('pages/aiAgent/hooks/useStoreConfigurationForAccount')
const useStoreConfigurationForAccountMock = assumeMock(
    useStoreConfigurationForAccount,
)

jest.mock('pages/aiAgent/Onboarding/hooks/useGetOnboardingData')
const useGetOnboardingDataMock = assumeMock(useGetOnboardingData)

jest.mock('pages/aiAgent/Onboarding/hooks/useGetOnboardings')
const useGetOnboardingsMock = assumeMock(useGetOnboardings)

const mutateUpdateOnboardingMock = jest.fn()
jest.mock('pages/aiAgent/Onboarding/hooks/useUpdateOnboarding')
const useUpdateOnboardingMock = assumeMock(useUpdateOnboarding)

const mutateCreateOnboardingMock = jest.fn()
jest.mock('pages/aiAgent/Onboarding/hooks/useCreateOnboarding')
const useCreateOnboardingMock = assumeMock(useCreateOnboarding)

jest.mock('pages/aiAgent/Onboarding/hooks/useCheckStoreIntegration', () => ({
    __esModule: true,
    default: jest.fn(),
}))

jest.mock(
    'pages/aiAgent/Onboarding/components/steps/ChannelsStep/hooks/usePreselectedChat',
)
const usePreselectedChatMock = assumeMock(usePreselectedChat)

jest.mock(
    'pages/aiAgent/Onboarding/components/steps/ChannelsStep/hooks/usePreselectedEmails',
)
const usePreselectedEmailsMock = assumeMock(usePreselectedEmails)

jest.mock(
    'pages/aiAgent/Onboarding/components/steps/ChannelsStep/hooks/useShouldDisplayEmailIntegrationsLink',
)
const useShouldDisplayEmailIntegrationsLinkMock = assumeMock(
    useShouldDisplayEmailIntegrationsLink,
)

jest.mock(
    'pages/aiAgent/Onboarding/components/steps/ChannelsStep/hooks/useSelectedEmailsBeforeRedirect',
)
const useSelectedEmailsBeforeRedirectMock = assumeMock(
    useSelectedEmailsBeforeRedirect,
)

jest.mock('pages/aiAgent/Onboarding/hooks/useTransformToneOfVoiceConversations')
const useTransformToneOfVoiceConversationsMock = assumeMock(
    useTransformToneOfVoiceConversations,
)

jest.mock('pages/aiAgent/Onboarding/hooks/useAiAgentScopesForAutomationPlan')
const useAiAgentScopesForAutomationPlanMock = assumeMock(
    useAiAgentScopesForAutomationPlan,
)

jest.mock('core/flags', () => ({
    useFlag: jest.fn(),
}))
const mockUseFlag = jest.mocked(useFlag)

const goToStep = jest.fn()

const firstStepTitle = /Welcome to AI Agent!/
const notFirstStepTitle = /Next, which channels would you like/

const history = createMemoryHistory({
    initialEntries: [
        `/app/ai-agent/shopify/${shopifyIntegration.meta.shop_name}/onboarding/channels`,
    ],
})

const defaultProps: StepProps = {
    currentStep: 1,
    totalSteps: 4,
    goToStep,
}

const defaultOnboardingData = {
    id: 1,
    salesPersuasionLevel: PersuasionLevel.Moderate,
    salesDiscountStrategyLevel: DiscountStrategy.Balanced,
    salesDiscountMax: 0.8,
    scopes: [AiAgentScopes.SUPPORT, AiAgentScopes.SALES],
    shopName: shopifyIntegration.meta.shop_name,
    currentStepName: 'channels',
    emailIntegrationIds: [],
    chatIntegrationIds: [],
}

const renderWithProvider = (state?: RootState, props = defaultProps) => {
    return renderWithRouter(
        <QueryClientProvider client={mockQueryClient()}>
            <Provider store={mockStore(state ?? defaultState)}>
                <ChannelsStep {...props} />
            </Provider>
        </QueryClientProvider>,
        {
            history,
            path: '/app/ai-agent/:shopType/:shopName/onboarding/:step',
            route: `/app/ai-agent/shopify/${shopifyIntegration.meta.shop_name}/onboarding/channels`,
        },
    )
}

const mockChatAndEmailDisabled = () => {
    usePreselectedEmailsMock.mockReturnValue([])
    usePreselectedChatMock.mockReturnValue([])
    useGetOnboardingDataMock.mockReturnValue({
        data: {
            salesPersuasionLevel: PersuasionLevel.Moderate,
            salesDiscountStrategyLevel: DiscountStrategy.Balanced,
            salesDiscountMax: 0.8,
            scopes: [AiAgentScopes.SUPPORT, AiAgentScopes.SALES],
            shopName: shopifyIntegration.meta.shop_name,
            emailIntegrationIds: [],
            chatIntegrationIds: [],
            currentStepName: WizardStepEnum.PERSONALITY_PREVIEW,
        },
        isLoading: false,
    } as any)
}

const applyMocks = () => {
    usePreselectedEmailsMock.mockReturnValue([])
    usePreselectedChatMock.mockReturnValue([])

    useSelectedEmailsBeforeRedirectMock.mockReturnValue({
        selectedEmailsBeforeRedirect: [],
        setSelectedEmailsBeforeRedirect: jest.fn(),
        clearSelectedEmailsBeforeRedirect: jest.fn(),
    })

    useAiAgentScopesForAutomationPlanMock.mockReturnValue([
        AiAgentScopes.SUPPORT,
        AiAgentScopes.SALES,
    ])

    useCreateOnboardingMock.mockReturnValue({
        mutate: mutateCreateOnboardingMock,
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
    mutateCreateOnboardingMock.mockImplementation(
        (data: any, { onSuccess }: { onSuccess: () => {} }) => {
            onSuccess()
        },
    )

    useShouldDisplayEmailIntegrationsLinkMock.mockReturnValue(true)
}

describe('ChannelsStep', () => {
    describe('ChannelsStep - empty state', () => {
        beforeEach(() => {
            applyMocks()
            mockUseShopifyIntegrationAndScope.mockReturnValue({
                integration: true,
            })

            useGetOnboardingsMock.mockReturnValue({
                data: [defaultOnboardingData],
                isLoading: false,
            } as any)

            useGetOnboardingDataMock.mockReturnValue({
                data: {
                    salesPersuasionLevel: PersuasionLevel.Moderate,
                    salesDiscountStrategyLevel: DiscountStrategy.Balanced,
                    salesDiscountMax: 0.8,
                    scopes: [AiAgentScopes.SUPPORT, AiAgentScopes.SALES],
                    shopName: shopifyIntegration.meta.shop_name,
                    currentStepName: WizardStepEnum.SHOPIFY_INTEGRATION,
                },
                isLoading: false,
            } as any)

            useStoreConfigurationForAccountMock.mockReturnValue({
                storeConfigurations: [
                    {
                        helpCenterId: 123,
                        chatChannelDeactivatedDatetime: '2024-01-01',
                        emailChannelDeactivatedDatetime: '2024-01-01',
                        previewModeActivatedDatetime: '2024-02-01',
                        previewModeValidUntilDatetime: '2024-02-08',
                        monitoredEmailIntegrations: [
                            { id: 1, email: 'email1@example.com' },
                            { id: 2, email: 'email2@example.com' },
                        ],
                        monitoredChatIntegrations: [1, 2],
                        customToneOfVoiceGuidance: 'Be friendly',
                        signature: 'Best regards, Store',
                        silentHandover: true,
                        tags: [],
                        excludedTopics: ['topic1', 'topic2'],
                        ticketSampleRate: 0.5,
                        wizard: undefined,
                    } as unknown as StoreConfiguration,
                ],
                isLoading: false,
            })

            useTransformToneOfVoiceConversationsMock.mockReturnValue({
                previewConversation: conversationExamples.default,
                isLoading: false,
                isPreviewLoading: false,
                preview: undefined,
            })
        })

        it('renders with the checkbox enabled by default if the step is channels', async () => {
            useGetOnboardingDataMock.mockReturnValue({
                data: defaultOnboardingData,
                isLoading: false,
            } as any)

            renderWithProvider()

            expect(screen.getAllByRole('checkbox')[0]).toBeChecked()
            expect(screen.getAllByRole('checkbox')[1]).toBeChecked()
        })

        it('renders the component with main title and cards', async () => {
            renderWithProvider(undefined, {
                ...defaultProps,
                currentStep: 1,
                totalSteps: 4,
            })

            // Components are rendered
            await waitFor(() => {
                expect(screen.getByText(firstStepTitle)).toBeInTheDocument()

                expect(
                    screen.getByText(
                        'Enable your AI Agent to respond to customers via email.',
                    ),
                ).toBeInTheDocument()
            })
        })

        it('renders the component with main title and cards', async () => {
            renderWithProvider(undefined, {
                ...defaultProps,
                currentStep: 2,
                totalSteps: 5,
            })

            // Components are rendered
            await waitFor(() => {
                expect(screen.getByText(notFirstStepTitle)).toBeInTheDocument()

                expect(
                    screen.getByText(
                        'Enable your AI Agent to respond to customers via email.',
                    ),
                ).toBeInTheDocument()
            })
        })

        // TODO(React18): Fix this flaky test
        it.skip('selects an additional email and proceeds to next step', async () => {
            const user = userEvent.setup()
            mockChatAndEmailDisabled()
            renderWithProvider()

            // Ensure email card is visible and click it to enable
            await waitFor(() => {
                expect(
                    screen.getByText(
                        'Enable your AI Agent to respond to customers via email.',
                    ),
                ).toBeInTheDocument()
            })

            user.click(
                screen.getByText(
                    'Enable your AI Agent to respond to customers via email.',
                ),
            )

            await waitFor(() => {
                expect(
                    screen.getByText(
                        /AI agent will respond to the following emails/,
                    ),
                ).toBeInTheDocument()
            })

            const emailCombobox = screen.getByRole('combobox')
            fireEvent.focus(emailCombobox)

            await waitFor(() => {
                expect(
                    screen.getByText('support@acme.gorgias.io'),
                ).toBeInTheDocument()
                expect(
                    screen.getByText('billing+1@acme.gorgias.io'),
                ).toBeInTheDocument()
            })

            user.click(screen.getByText('billing+1@acme.gorgias.io'))

            const nextButton = screen.getByText('Next')
            user.click(nextButton)

            await waitFor(() => {
                expect(mutateCreateOnboardingMock).toHaveBeenCalledWith(
                    expect.objectContaining({
                        emailIntegrationIds: [7],
                    }),
                    expect.anything(),
                )
                expect(defaultProps.goToStep).toHaveBeenCalledWith(
                    WizardStepEnum.SALES_PERSONALITY,
                )
            })
        })

        // TODO(React18): Fix this flaky test
        it.skip('renders the dropdowns and allow next step (click on card)', async () => {
            const user = userEvent.setup()
            mockChatAndEmailDisabled()
            renderWithProvider()

            await waitFor(() => {
                expect(
                    screen.getByText(
                        'Enable your AI Agent to respond to customers via email.',
                    ),
                ).toBeInTheDocument()
                expect(
                    screen.getByText(
                        'Enable your AI Agent to respond to customers via chat.',
                    ),
                ).toBeInTheDocument()
            })

            // Setup chat
            const chatContainer = screen.getByText(
                'Enable your AI Agent to respond to customers via chat.',
            )
            user.click(chatContainer)

            await waitFor(() => {
                expect(
                    screen.queryByText(
                        /AI Agent responds to tickets sent to the following Chats/,
                    ),
                ).toBeInTheDocument()
            })

            const chatDropdown = screen.getByText(
                'Select one or more chat integrations',
            )
            user.click(chatDropdown)
            fireEvent.focus(
                screen.getByText('Select one or more chat integrations'),
            )
            user.click(screen.getByText('New chat'))

            // Click on next button
            const nextButton = screen.getByText('Next')
            user.click(nextButton)

            await waitFor(() => {
                expect(defaultProps.goToStep).toHaveBeenCalledWith(
                    WizardStepEnum.SALES_PERSONALITY,
                )
            })
        })

        // TODO(React18): Fix this flaky test
        it.skip('renders the dropdowns and allow next step (click on checkbox)', async () => {
            const user = userEvent.setup()
            mockChatAndEmailDisabled()
            renderWithProvider()

            user.click(screen.getByText('Chat'))

            const chatDropdown = screen.getByText(
                'Select one or more chat integrations',
            )
            user.click(chatDropdown)
            fireEvent.focus(
                screen.getByText('Select one or more chat integrations'),
            )
            user.click(screen.getByText('New chat'))

            // Click on next button
            const nextButton = screen.getByText('Next')
            user.click(nextButton)

            await waitFor(() => {
                expect(defaultProps.goToStep).toHaveBeenCalledWith(
                    WizardStepEnum.SALES_PERSONALITY,
                )
            })
        })

        // TODO(React18): Fix this flaky test
        it.skip('should disable email integration from another onboarding', async () => {
            const user = userEvent.setup()
            mockChatAndEmailDisabled()
            useGetOnboardingsMock.mockReturnValue({
                data: [
                    {
                        ...defaultOnboardingData,
                        shopName: 'another-shop-name',
                        emailIntegrationIds: [1, 15],
                    },
                ],
                isLoading: false,
            } as any)

            const customState = {
                ...defaultState,
                integrations: (
                    fromJS(integrationsState) as Map<any, any>
                ).mergeDeep({
                    integrations: [
                        shopifyIntegration,
                        ...chatIntegrationFixtures,
                        { ...shopifyIntegration, name: 'another-shop-name' },
                    ],
                }),
            }

            renderWithProvider(customState)

            user.click(screen.getByText('Email'))

            await waitFor(() => {
                expect(
                    screen.queryByText(
                        /AI agent will respond to the following emails/,
                    ),
                ).toBeInTheDocument()
            })

            const dropdown = screen.getByRole('combobox')
            fireEvent.focus(dropdown)

            await waitFor(() => {
                expect(
                    screen.getByText('support@acme.gorgias.io'),
                ).toBeInTheDocument()
                expect(
                    screen.queryAllByText(
                        'Email already used by AI Agent in another store',
                    ),
                ).toHaveLength(2)
            })
        })

        it('handles error on no channel', async () => {
            const user = userEvent.setup()
            mockChatAndEmailDisabled()
            renderWithProvider()

            await waitFor(() => {
                expect(screen.getAllByRole('checkbox')[0]).not.toBeChecked()
                expect(screen.getAllByRole('checkbox')[1]).not.toBeChecked()
            })

            const nextButton = screen.getByText('Next')
            await user.click(nextButton)
            expect(defaultProps.goToStep).not.toHaveBeenCalled()

            await waitFor(() => {
                expect(
                    screen.getByText(
                        'Please select at least one option to continue.',
                    ),
                ).toBeInTheDocument()
            })
        })

        it('handles error on no selecting email', async () => {
            const user = userEvent.setup()
            mockChatAndEmailDisabled()
            renderWithProvider()

            // Components are rendered
            await waitFor(() => {
                expect(screen.getByText(firstStepTitle)).toBeInTheDocument()

                expect(
                    screen.getByText(
                        'Enable your AI Agent to respond to customers via email.',
                    ),
                ).toBeInTheDocument()
                expect(
                    screen.getByText(
                        'Enable your AI Agent to respond to customers via chat.',
                    ),
                ).toBeInTheDocument()
            })

            // Setup email
            const emailCheckbox = screen.getByText(
                'Enable your AI Agent to respond to customers via email.',
            )
            user.click(emailCheckbox)
            await waitFor(() => {
                expect(
                    screen.queryByText(
                        /AI agent will respond to the following emails/,
                    ),
                ).toBeInTheDocument()
            })

            // Click on next button
            const nextButton = screen.getByText('Next')
            user.click(nextButton)
            expect(defaultProps.goToStep).not.toHaveBeenCalled()

            await waitFor(() => {
                expect(
                    screen.getByText(
                        /You must select at least one email integration./,
                    ),
                ).toBeInTheDocument()
            })
        })

        it('handles error on no selecting chat', async () => {
            const user = userEvent.setup()
            mockChatAndEmailDisabled()
            renderWithProvider()

            // Components are rendered
            await waitFor(() => {
                expect(screen.getByText(firstStepTitle)).toBeInTheDocument()

                expect(
                    screen.getByText(
                        'Enable your AI Agent to respond to customers via email.',
                    ),
                ).toBeInTheDocument()
                expect(
                    screen.getByText(
                        'Enable your AI Agent to respond to customers via chat.',
                    ),
                ).toBeInTheDocument()
            })

            // Setup chat
            const chatCheckbox = screen.getByText(
                'Enable your AI Agent to respond to customers via chat.',
            )
            user.click(chatCheckbox)
            await waitFor(() => {
                expect(
                    screen.queryByText(
                        /AI Agent responds to tickets sent to the following Chats/,
                    ),
                ).toBeInTheDocument()
            })

            // Click on next button
            const nextButton = screen.getByText('Next')
            user.click(nextButton)
            expect(defaultProps.goToStep).not.toHaveBeenCalled()

            await waitFor(() => {
                expect(
                    screen.getByText(
                        /You must select at least one chat integration./,
                    ),
                ).toBeInTheDocument()
            })
        })

        it('renders the chat creation', async () => {
            const user = userEvent.setup()
            mockedDispatch.mockImplementationOnce(() => Promise.resolve())
            useGetOnboardingDataMock.mockReturnValue({
                data: defaultOnboardingData,
                isLoading: false,
            } as any)

            const screen = renderWithProvider({
                ...defaultState,
                integrations: (
                    fromJS(integrationsState) as Map<any, any>
                ).mergeDeep({
                    integrations: [shopifyIntegration],
                }),
            })

            // Components are rendered
            await waitFor(() => {
                expect(screen.getByText(firstStepTitle)).toBeInTheDocument()

                expect(
                    screen.getByText(
                        'Enable your AI Agent to respond to customers via email.',
                    ),
                ).toBeInTheDocument()
                expect(
                    screen.getByText(
                        'Enable your AI Agent to respond to customers via chat.',
                    ),
                ).toBeInTheDocument()
            })

            // Setup chat
            user.click(screen.getByText('Email'))

            await waitFor(() => {
                expect(
                    screen.queryByText(/Personalize your Chat widget/),
                ).toBeInTheDocument()
            })

            // Find the color field input (based on label)
            const colorInput = screen.getByPlaceholderText('ex: #eeeeee')
            expect(colorInput).toBeInTheDocument()

            // Change color value (simulate user input)
            fireEvent.change(colorInput, { target: { value: '#ff00ff' } })

            // Click on next button
            const nextButton = screen.getByText('Next')
            user.click(nextButton)

            await waitFor(() => {
                // Wait for goToStep to be called

                expect(mutateUpdateOnboardingMock).toHaveBeenCalled()
                expect(defaultProps.goToStep).toHaveBeenCalledWith(
                    WizardStepEnum.SALES_PERSONALITY,
                )
            })
        })

        it('renders the chat creation error', async () => {
            const user = userEvent.setup()
            mockChatAndEmailDisabled()
            mockedDispatch.mockImplementationOnce(() =>
                Promise.reject(new Error('Error message')),
            )

            renderWithProvider({
                ...defaultState,
                integrations: (
                    fromJS(integrationsState) as Map<any, any>
                ).mergeDeep({
                    integrations: [shopifyIntegration],
                }),
            })

            // Components are rendered
            await waitFor(() => {
                expect(screen.getByText(firstStepTitle)).toBeInTheDocument()

                expect(
                    screen.getByText(
                        'Enable your AI Agent to respond to customers via email.',
                    ),
                ).toBeInTheDocument()
            })

            // Setup chat
            const chatCheckbox = screen.getByText(
                'Enable your AI Agent to respond to customers via chat.',
            )
            user.click(chatCheckbox)
            await waitFor(() => {
                expect(
                    screen.queryByText(/Personalize your Chat widget/),
                ).toBeInTheDocument()
            })

            // Click on next button
            const nextButton = screen.getByText('Next')
            user.click(nextButton)

            await waitFor(() => {
                expect(notifyMock).toHaveBeenCalledWith(
                    expect.objectContaining({
                        message: 'Could not create chat integration',
                        status: NotificationStatus.Error,
                    }),
                )
            })
        })

        it('handles no store', async () => {
            const user = userEvent.setup()
            mockChatAndEmailDisabled()
            mockedDispatch.mockImplementationOnce(() => Promise.resolve())

            renderWithProvider()

            // Setup chat
            const chatCheckbox = screen.getByText(
                'Enable your AI Agent to respond to customers via chat.',
            )
            user.click(chatCheckbox)
            await waitFor(() => {
                expect(
                    screen.queryByText(
                        /AI Agent responds to tickets sent to the following Chats/,
                    ),
                ).toBeInTheDocument()
            })

            // Click on next button
            const nextButton = screen.getByText('Next')
            user.click(nextButton)
            expect(defaultProps.goToStep).not.toHaveBeenCalled()
        })

        it('renders the email integration creation link', async () => {
            mockedDispatch.mockImplementationOnce(() => Promise.resolve())
            useGetOnboardingDataMock.mockReturnValue({
                data: defaultOnboardingData,
                isLoading: false,
            } as any)

            const screen = renderWithProvider(defaultState)

            await waitFor(() => {
                expect(
                    screen.queryByText(
                        'Don’t see the email you want? Click here',
                    ),
                ).toBeInTheDocument()
            })
        })

        it('does not render the email integration creation link when useShowEmailIntegrationsLink returns false', async () => {
            useShouldDisplayEmailIntegrationsLinkMock.mockReturnValue(false)

            mockedDispatch.mockImplementationOnce(() => Promise.resolve())
            useGetOnboardingDataMock.mockReturnValue({
                data: defaultOnboardingData,
                isLoading: false,
            } as any)

            const screen = renderWithProvider(defaultState)

            await waitFor(() => {
                expect(
                    screen.queryByText(
                        'Don’t see the email you want? Click here',
                    ),
                ).not.toBeInTheDocument()
            })
        })

        it('renders chat preview section', () => {
            renderWithProvider()

            expect(
                screen.getByText('Hi, I’m after a moisturizer for dry skin.'),
            ).toBeInTheDocument()
        })

        it('renders the loading preview', async () => {
            useTransformToneOfVoiceConversationsMock.mockReturnValue({
                previewConversation: undefined,
                isLoading: true,
                isPreviewLoading: true,
                preview: undefined,
            })

            renderWithProvider()

            expect(
                screen.getByTestId('typing-message-bubble'),
            ).toBeInTheDocument()
        })

        it('navigates to the shopify integration step when Back is clicked and there is no integration', async () => {
            const user = userEvent.setup()
            mockUseShopifyIntegrationAndScope.mockReturnValue({
                integration: false,
            })
            renderWithProvider(undefined, {
                ...defaultProps,
                currentStep: 2,
                totalSteps: 5,
            })

            user.click(screen.getByText(/Back/i))

            await waitFor(() => {
                expect(goToStep).toHaveBeenCalledWith(
                    WizardStepEnum.SHOPIFY_INTEGRATION,
                )
            })
        })

        it('should disable email channel (isEmailChannelEnabled=false) and hide email integration when in standalone mode, not backtracking, with no preselected emails', async () => {
            mockUseFlag.mockImplementation(
                (key) =>
                    key === FeatureFlagKey.StandaloneHandoverCapabilities ||
                    true,
            )

            // Set currentStepName to CHANNELS to simulate not backtracking (isBacktracking = false)
            useGetOnboardingDataMock.mockReturnValue({
                data: {
                    ...defaultOnboardingData,
                    currentStepName: WizardStepEnum.CHANNELS,
                    emailIntegrationIds: [],
                    chatIntegrationIds: [],
                },
                isLoading: false,
            } as any)

            usePreselectedEmailsMock.mockReturnValue([])
            usePreselectedChatMock.mockReturnValue([])

            renderWithProvider()

            await waitFor(() => {
                expect(screen.queryByText('Email')).not.toBeInTheDocument()
                expect(
                    screen.queryByText(
                        'Enable your AI Agent to respond to customers via email.',
                    ),
                ).not.toBeInTheDocument()
                expect(
                    screen.queryByText(
                        /AI agent will respond to the following emails/,
                    ),
                ).not.toBeInTheDocument()

                expect(screen.getByText('Chat')).toBeInTheDocument()
                expect(screen.getByRole('checkbox')).toBeChecked()
            })
        })
    })

    describe('ChannelsStep - With preloaded data', () => {
        beforeEach(() => {
            jest.clearAllMocks()
            mockUseFlag.mockReturnValue(false)
            applyMocks()

            mockUseShopifyIntegrationAndScope.mockReturnValue({
                integration: true,
            })

            useGetOnboardingsMock.mockReturnValue({
                data: [defaultOnboardingData],
                isLoading: false,
            } as any)

            useGetOnboardingDataMock.mockReturnValue({
                data: {
                    id: 1,
                    salesPersuasionLevel: PersuasionLevel.Moderate,
                    salesDiscountStrategyLevel: DiscountStrategy.Balanced,
                    salesDiscountMax: 0.8,
                    scopes: [AiAgentScopes.SUPPORT, AiAgentScopes.SALES],
                    shopName: shopifyIntegration.meta.shop_name,
                    emailIntegrationIds: [5],
                    chatIntegrationIds: [3],
                },
                isLoading: false,
            } as any)

            useUpdateOnboardingMock.mockReturnValue({
                mutate: mutateUpdateOnboardingMock,
                isLoading: false,
            } as any)

            useTransformToneOfVoiceConversationsMock.mockReturnValue({
                previewConversation: conversationExamples.default,
                isLoading: false,
                isPreviewLoading: false,
                preview: undefined,
            })
        })

        const testIntegrationDisabling = async (
            integrationType: 'Email' | 'Chat',
            expectedUpdate: object,
        ) => {
            const user = userEvent.setup()
            usePreselectedChatMock.mockReturnValue([3])
            usePreselectedEmailsMock.mockReturnValue([5])

            useGetOnboardingDataMock.mockReturnValue({
                data: {
                    id: 1,
                    salesPersuasionLevel: PersuasionLevel.Moderate,
                    salesDiscountStrategyLevel: DiscountStrategy.Balanced,
                    salesDiscountMax: 0.8,
                    scopes: [AiAgentScopes.SUPPORT, AiAgentScopes.SALES],
                    shopName: shopifyIntegration.meta.shop_name,
                    emailIntegrationIds: [5],
                    chatIntegrationIds: [3],
                },
                isLoading: false,
            } as any)

            const screen = renderWithProvider()

            await waitFor(() => {
                expect(screen.getAllByRole('checkbox')[1]).toBeChecked()
                expect(screen.getAllByRole('checkbox')[0]).toBeChecked()
            })

            const integration = screen.getByText(integrationType)
            await waitFor(() => {
                expect(integration).toBeInTheDocument()
            })

            user.click(integration)
            await waitFor(() => {
                expect(integration).not.toBeChecked()
            })

            const nextButton = screen.getByText('Next')

            await waitFor(() => {
                user.click(nextButton)
            })

            await waitFor(() => {
                expect(mutateUpdateOnboardingMock).toHaveBeenCalledWith(
                    expect.objectContaining({
                        data: expect.objectContaining(expectedUpdate),
                    }),
                    expect.anything(),
                )
            })
        }

        it('should not send the ids when the email integration is disabled', async () => {
            await testIntegrationDisabling('Email', {
                emailIntegrationIds: [],
                chatIntegrationIds: [3],
                shopName: expect.any(String),
                currentStepName: expect.any(String),
            })
        })

        it('should not send the ids when the chat integration is disabled', async () => {
            await testIntegrationDisabling('Chat', {
                emailIntegrationIds: [5],
                chatIntegrationIds: [],
                shopName: expect.any(String),
                currentStepName: expect.any(String),
            })
        })
    })

    describe('Sorting Callbacks', () => {
        describe('emailSortingCallback', () => {
            it('should sort by isDisabled', () => {
                const a = {
                    isDisabled: true,
                    isDefault: false,
                    email: 'a@example.com',
                } as EmailItem
                const b = {
                    isDisabled: false,
                    isDefault: false,
                    email: 'b@example.com',
                } as EmailItem
                expect(emailSortingCallback(a, b)).toBe(1)
                expect(emailSortingCallback(b, a)).toBe(-1)
            })

            it('should sort by isDefault', () => {
                const a = {
                    isDisabled: false,
                    isDefault: true,
                    email: 'a@example.com',
                } as EmailItem
                const b = {
                    isDisabled: false,
                    isDefault: false,
                    email: 'b@example.com',
                } as EmailItem
                expect(emailSortingCallback(a, b)).toBe(-1)
                expect(emailSortingCallback(b, a)).toBe(1)
            })

            it('should sort by email', () => {
                const a = {
                    isDisabled: false,
                    isDefault: false,
                    email: 'a@example.com',
                } as EmailItem
                const b = {
                    isDisabled: false,
                    isDefault: false,
                    email: 'b@example.com',
                } as EmailItem
                expect(emailSortingCallback(a, b)).toBe(-1)
                expect(emailSortingCallback(b, a)).toBe(1)
            })
        })

        describe('chatSortingCallback', () => {
            it('should sort by isDisabled', () => {
                const a = {
                    value: { isDisabled: true, name: 'a' },
                } as SelfServiceChatChannel
                const b = {
                    value: { isDisabled: false, name: 'b' },
                } as SelfServiceChatChannel
                expect(chatSortingCallback(a, b)).toBe(1)
                expect(chatSortingCallback(b, a)).toBe(-1)
            })

            it('should sort by name', () => {
                const a = {
                    value: { isDisabled: false, name: 'a' },
                } as SelfServiceChatChannel
                const b = {
                    value: { isDisabled: false, name: 'b' },
                } as SelfServiceChatChannel
                expect(chatSortingCallback(a, b)).toBe(-1)
                expect(chatSortingCallback(b, a)).toBe(1)
            })
        })
    })

    describe('ChannelsStep - loading state', () => {
        beforeEach(() => {
            mockUseShopifyIntegrationAndScope.mockReturnValue({
                integration: true,
            })

            usePreselectedEmailsMock.mockReturnValue([])
            usePreselectedChatMock.mockReturnValue([])

            useGetOnboardingsMock.mockReturnValue({
                data: [defaultOnboardingData],
                isLoading: false,
            } as any)

            useGetOnboardingDataMock.mockReturnValue({
                data: {
                    id: '1',
                    salesPersuasionLevel: PersuasionLevel.Moderate,
                    salesDiscountStrategyLevel: DiscountStrategy.Balanced,
                    salesDiscountMax: 0.8,
                    scopes: [AiAgentScopes.SUPPORT, AiAgentScopes.SALES],
                    shopName: shopifyIntegration.meta.shop_name,
                    currentStepName: WizardStepEnum.SHOPIFY_INTEGRATION,
                },
                isLoading: false,
            })

            useUpdateOnboardingMock.mockReturnValue({
                mutate: mutateUpdateOnboardingMock,
                isLoading: false,
            } as any)

            useStoreConfigurationForAccountMock.mockReturnValue({
                storeConfigurations: [
                    {
                        helpCenterId: 123,
                        chatChannelDeactivatedDatetime: '2024-01-01',
                        emailChannelDeactivatedDatetime: '2024-01-01',
                        previewModeActivatedDatetime: '2024-02-01',
                        previewModeValidUntilDatetime: '2024-02-08',
                        monitoredEmailIntegrations: [
                            { id: 1, email: 'email1@example.com' },
                            { id: 2, email: 'email2@example.com' },
                        ],
                        monitoredChatIntegrations: [1, 2],
                        customToneOfVoiceGuidance: 'Be friendly',
                        signature: 'Best regards, Store',
                        silentHandover: true,
                        tags: [],
                        excludedTopics: ['topic1', 'topic2'],
                        ticketSampleRate: 0.5,
                        wizard: undefined,
                    } as unknown as StoreConfiguration,
                ],
                isLoading: false,
            })

            mutateUpdateOnboardingMock.mockImplementation(
                (data: any, { onSuccess }: { onSuccess: () => {} }) => {
                    onSuccess()
                },
            )

            useTransformToneOfVoiceConversationsMock.mockReturnValue({
                previewConversation: conversationExamples.default,
                isLoading: false,
                isPreviewLoading: false,
                preview: undefined,
            })
        })

        it('should render loading state when the onboarding data is being fetched', () => {
            useGetOnboardingDataMock.mockReturnValue({
                data: undefined,
                isLoading: true,
            })

            renderWithProvider()

            expect(screen.getByText('Loading...')).toBeInTheDocument()
        })

        it('should render loading state when the onboarding is being updated', () => {
            useUpdateOnboardingMock.mockReturnValue({
                mutate: mutateUpdateOnboardingMock,
                isLoading: true,
            } as any)

            renderWithProvider()

            expect(screen.getByText('Loading...')).toBeInTheDocument()
        })

        it('should render loading state when the store configurations is being fetched', () => {
            useStoreConfigurationForAccountMock.mockReturnValue({
                storeConfigurations: [],
                isLoading: true,
            })

            renderWithProvider()

            expect(screen.getByText('Loading...')).toBeInTheDocument()
        })
    })

    describe('ChannelsStep - isBacktracking behavior', () => {
        beforeEach(() => {
            mockUseShopifyIntegrationAndScope.mockReturnValue({
                integration: true,
            })

            usePreselectedEmailsMock.mockReturnValue([5])
            usePreselectedChatMock.mockReturnValue([3])
            useSelectedEmailsBeforeRedirectMock.mockReturnValue({
                selectedEmailsBeforeRedirect: [],
                setSelectedEmailsBeforeRedirect: jest.fn(),
                clearSelectedEmailsBeforeRedirect: jest.fn(),
            })

            useGetOnboardingsMock.mockReturnValue({
                data: [defaultOnboardingData],
                isLoading: false,
            } as any)

            useAiAgentScopesForAutomationPlanMock.mockReturnValue([
                AiAgentScopes.SUPPORT,
                AiAgentScopes.SALES,
            ])

            useUpdateOnboardingMock.mockReturnValue({
                mutate: mutateUpdateOnboardingMock,
                isLoading: false,
            } as any)

            useCreateOnboardingMock.mockReturnValue({
                mutate: mutateCreateOnboardingMock,
                isLoading: false,
            } as any)

            useStoreConfigurationForAccountMock.mockReturnValue({
                storeConfigurations: [
                    {
                        helpCenterId: 123,
                        chatChannelDeactivatedDatetime: '2024-01-01',
                        emailChannelDeactivatedDatetime: '2024-01-01',
                        previewModeActivatedDatetime: '2024-02-01',
                        previewModeValidUntilDatetime: '2024-02-08',
                        monitoredEmailIntegrations: [
                            { id: 1, email: 'email1@example.com' },
                            { id: 2, email: 'email2@example.com' },
                        ],
                        monitoredChatIntegrations: [1, 2],
                        customToneOfVoiceGuidance: 'Be friendly',
                        signature: 'Best regards, Store',
                        silentHandover: true,
                        tags: [],
                        excludedTopics: ['topic1', 'topic2'],
                        ticketSampleRate: 0.5,
                        wizard: undefined,
                    } as unknown as StoreConfiguration,
                ],
                isLoading: false,
            })

            useTransformToneOfVoiceConversationsMock.mockReturnValue({
                previewConversation: conversationExamples.default,
                isLoading: false,
                isPreviewLoading: false,
                preview: undefined,
            })
        })

        it('should check both checkboxes by default when not backtracking', async () => {
            // Set currentStepName to CHANNELS to simulate not backtracking
            useGetOnboardingDataMock.mockReturnValue({
                data: {
                    ...defaultOnboardingData,
                    currentStepName: WizardStepEnum.CHANNELS,
                },
                isLoading: false,
            } as any)

            renderWithProvider()

            await waitFor(() => {
                // Both checkboxes should be checked by default
                expect(screen.getAllByRole('checkbox')[0]).toBeChecked()
                expect(screen.getAllByRole('checkbox')[1]).toBeChecked()
            })
        })

        it('should base checkbox state on preselected values when backtracking', async () => {
            // Set currentStepName to SALES_PERSONALITY to simulate backtracking
            useGetOnboardingDataMock.mockReturnValue({
                data: {
                    ...defaultOnboardingData,
                    currentStepName: WizardStepEnum.SALES_PERSONALITY,
                    emailIntegrationIds: [5],
                    chatIntegrationIds: [],
                },
                isLoading: false,
            } as any)

            // Mock preselected emails
            usePreselectedEmailsMock.mockReturnValue([5])
            // Mock empty preselected chats
            usePreselectedChatMock.mockReturnValue([])

            renderWithProvider()

            await waitFor(() => {
                // Email checkbox should be checked because there are preselected emails
                expect(screen.getAllByRole('checkbox')[0]).toBeChecked()
                // Chat checkbox should be unchecked because there are no preselected chats
                expect(screen.getAllByRole('checkbox')[1]).not.toBeChecked()
            })
        })

        it('should uncheck both checkboxes when backtracking with no preselected values', async () => {
            // Set currentStepName to SALES_PERSONALITY to simulate backtracking
            useGetOnboardingDataMock.mockReturnValue({
                data: {
                    ...defaultOnboardingData,
                    currentStepName: WizardStepEnum.SALES_PERSONALITY,
                    emailIntegrationIds: [],
                    chatIntegrationIds: [],
                },
                isLoading: false,
            } as any)

            // Mock empty preselected values
            usePreselectedEmailsMock.mockReturnValue([])
            usePreselectedChatMock.mockReturnValue([])

            renderWithProvider()

            await waitFor(() => {
                // Both checkboxes should be unchecked because there are no preselected values
                expect(screen.getAllByRole('checkbox')[0]).not.toBeChecked()
                expect(screen.getAllByRole('checkbox')[1]).not.toBeChecked()
            })
        })

        it('should check both checkboxes when backtracking with both types preselected', async () => {
            // Set currentStepName to SALES_PERSONALITY to simulate backtracking
            useGetOnboardingDataMock.mockReturnValue({
                data: {
                    ...defaultOnboardingData,
                    currentStepName: WizardStepEnum.SALES_PERSONALITY,
                    emailIntegrationIds: [5],
                    chatIntegrationIds: [3],
                },
                isLoading: false,
            } as any)

            // Mock preselected values for both email and chat
            usePreselectedEmailsMock.mockReturnValue([5])
            usePreselectedChatMock.mockReturnValue([3])

            renderWithProvider()

            await waitFor(() => {
                // Both checkboxes should be checked because there are preselected values for both
                expect(screen.getAllByRole('checkbox')[0]).toBeChecked()
                expect(screen.getAllByRole('checkbox')[1]).toBeChecked()
            })
        })
    })
})
