import React from 'react'

import { QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createMemoryHistory } from 'history'
import { fromJS, Map } from 'immutable'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import { account } from 'fixtures/account'
import { billingState } from 'fixtures/billing'
import { chatIntegrationFixtures } from 'fixtures/chat'
import { integrationsState, shopifyIntegration } from 'fixtures/integrations'
import { StoreConfiguration } from 'models/aiAgent/types'
import { EmailItem } from 'pages/aiAgent/components/EmailIntegrationListSelection/EmailIntegrationListSelection'
import { useStoreConfigurationForAccount } from 'pages/aiAgent/hooks/useStoreConfigurationForAccount'
import {
    ChannelsStep,
    chatSortingCallback,
    emailSortingCallback,
} from 'pages/aiAgent/Onboarding/components/steps/ChannelsStep/ChannelsStep'
import { usePreselectedChat } from 'pages/aiAgent/Onboarding/components/steps/ChannelsStep/hooks/usePreselectedChat'
import { usePreselectedEmails } from 'pages/aiAgent/Onboarding/components/steps/ChannelsStep/hooks/usePreselectedEmails'
import { DiscountStrategy } from 'pages/aiAgent/Onboarding/components/steps/PersonalityStep/DiscountStrategy'
import { PersuasionLevel } from 'pages/aiAgent/Onboarding/components/steps/PersonalityStep/PersuasionLevel'
import { StepProps } from 'pages/aiAgent/Onboarding/components/steps/types'
import { useGetOnboardingData } from 'pages/aiAgent/Onboarding/hooks/useGetOnboardingData'
import { useGetOnboardings } from 'pages/aiAgent/Onboarding/hooks/useGetOnboardings'
import { useUpdateOnboarding } from 'pages/aiAgent/Onboarding/hooks/useUpdateOnboarding'
import { AiAgentScopes, WizardStepEnum } from 'pages/aiAgent/Onboarding/types'
import { SelfServiceChatChannel } from 'pages/automate/common/hooks/useSelfServiceChatChannels'
import { useShopifyIntegrationAndScope } from 'pages/common/hooks/useShopifyIntegrationAndScope'
import { notify } from 'state/notifications/actions'
import { NotificationStatus } from 'state/notifications/types'
import { RootState, StoreDispatch } from 'state/types'
import { mockQueryClient } from 'tests/reactQueryTestingUtils'
import { assumeMock, renderWithRouter } from 'utils/testing'

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

describe('ChannelsStep', () => {
    describe('ChannelsStep - empty state', () => {
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
                    id: 1,
                    salesPersuasionLevel: PersuasionLevel.Moderate,
                    salesDiscountStrategyLevel: DiscountStrategy.Balanced,
                    salesDiscountMax: 0.8,
                    scopes: [AiAgentScopes.SUPPORT, AiAgentScopes.SALES],
                    shopName: shopifyIntegration.meta.shop_name,
                    currentStepName: WizardStepEnum.SKILLSET,
                },
                isLoading: false,
            } as any)

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
                        trialModeActivatedDatetime: '2024-02-01',
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
        })

        it('renders with the checkbox enabled by default if the step is channels', async () => {
            useGetOnboardingDataMock.mockReturnValue({
                data: defaultOnboardingData,
                isLoading: false,
            } as any)

            renderWithProvider()

            await waitFor(() => {
                expect(screen.getByLabelText('Email')).toBeInTheDocument()
                expect(screen.getByLabelText('Chat')).toBeInTheDocument()
            })

            expect(screen.getByLabelText('Email')).toBeChecked()
            expect(screen.getByLabelText('Chat')).toBeChecked()
        })

        it('renders the component with main title and cards', async () => {
            renderWithProvider()

            // Components are rendered
            await waitFor(() => {
                expect(screen.getByText(title)).toBeInTheDocument()

                expect(
                    screen.getByText(
                        'Enable your AI Agent to respond to customers via email.',
                    ),
                ).toBeInTheDocument()
            })
        })

        it('renders the dropdowns and allow next step (click on card)', async () => {
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
            userEvent.click(chatContainer)

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
            userEvent.click(chatDropdown)
            fireEvent.focus(
                screen.getByText('Select one or more chat integrations'),
            )
            userEvent.click(screen.getByText('New chat'))

            // Click on next button
            const nextButton = screen.getByText('Next')
            userEvent.click(nextButton)

            await waitFor(() => {
                expect(defaultProps.goToStep).toHaveBeenCalledWith(
                    WizardStepEnum.PERSONALITY_PREVIEW,
                )
            })
        })

        it('renders the dropdowns and allow next step (click on checkbox)', async () => {
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
            const chatCheckbox = screen.getByLabelText('Chat')
            userEvent.click(chatCheckbox)

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
            userEvent.click(chatDropdown)
            fireEvent.focus(
                screen.getByText('Select one or more chat integrations'),
            )
            userEvent.click(screen.getByText('New chat'))

            // Click on next button
            const nextButton = screen.getByText('Next')
            userEvent.click(nextButton)

            await waitFor(() => {
                expect(defaultProps.goToStep).toHaveBeenCalledWith(
                    WizardStepEnum.PERSONALITY_PREVIEW,
                )
            })
        })

        it('should disable email integration from another onboarding', async () => {
            useGetOnboardingsMock.mockReturnValue({
                data: [
                    {
                        ...defaultOnboardingData,
                        shopName: "Another shop's name",
                        emailIntegrationIds: [1, 15],
                    },
                ],
                isLoading: false,
            } as any)

            renderWithProvider()

            await waitFor(() => {
                expect(
                    screen.getByText(
                        'Enable your AI Agent to respond to customers via email.',
                    ),
                ).toBeInTheDocument()
            })

            const emailCheckbox = screen.getByLabelText('Email')
            userEvent.click(emailCheckbox)

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
            renderWithProvider()

            // Components are rendered
            await waitFor(() => {
                expect(screen.getByText(title)).toBeInTheDocument()

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

            expect(screen.getByLabelText('Chat')).not.toBeChecked()
            expect(screen.getByLabelText('Email')).not.toBeChecked()

            // Click on next button
            const nextButton = screen.getByText('Next')
            userEvent.click(nextButton)
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
            renderWithProvider()

            // Components are rendered
            await waitFor(() => {
                expect(screen.getByText(title)).toBeInTheDocument()

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
            userEvent.click(emailCheckbox)
            await waitFor(() => {
                expect(
                    screen.queryByText(
                        /AI agent will respond to the following emails/,
                    ),
                ).toBeInTheDocument()
            })

            // Click on next button
            const nextButton = screen.getByText('Next')
            userEvent.click(nextButton)
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
            renderWithProvider()

            // Components are rendered
            await waitFor(() => {
                expect(screen.getByText(title)).toBeInTheDocument()

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
            userEvent.click(chatCheckbox)
            await waitFor(() => {
                expect(
                    screen.queryByText(
                        /AI Agent responds to tickets sent to the following Chats/,
                    ),
                ).toBeInTheDocument()
            })

            // Click on next button
            const nextButton = screen.getByText('Next')
            userEvent.click(nextButton)
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
            mockedDispatch.mockImplementationOnce(() => Promise.resolve())
            useGetOnboardingDataMock.mockReturnValue({
                data: defaultOnboardingData,
                isLoading: false,
            } as any)

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
                expect(screen.getByText(title)).toBeInTheDocument()

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
            const emailCheckbox = screen.getByText('Email')
            userEvent.click(emailCheckbox)

            expect(screen.getByLabelText('Email')).not.toBeChecked()
            expect(screen.getByLabelText('Chat')).toBeChecked()

            await waitFor(() => {
                expect(
                    screen.queryByText(/Personalize your Chat widget/),
                ).toBeInTheDocument()
            })

            // Click on next button
            const nextButton = screen.getByText('Next')
            userEvent.click(nextButton)

            await waitFor(() => {
                // Wait for goToStep to be called

                expect(mutateUpdateOnboardingMock).toHaveBeenCalled()
                expect(defaultProps.goToStep).toHaveBeenCalledWith(
                    WizardStepEnum.PERSONALITY_PREVIEW,
                )
            })
        })

        it('renders the chat creation error', async () => {
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
                expect(screen.getByText(title)).toBeInTheDocument()

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
            userEvent.click(chatCheckbox)
            await waitFor(() => {
                expect(
                    screen.queryByText(/Personalize your Chat widget/),
                ).toBeInTheDocument()
            })

            // Click on next button
            const nextButton = screen.getByText('Next')
            userEvent.click(nextButton)

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
            mockedDispatch.mockImplementationOnce(() => Promise.resolve())

            renderWithProvider()

            // Setup chat
            const chatCheckbox = screen.getByText(
                'Enable your AI Agent to respond to customers via chat.',
            )
            userEvent.click(chatCheckbox)
            await waitFor(() => {
                expect(
                    screen.queryByText(
                        /AI Agent responds to tickets sent to the following Chats/,
                    ),
                ).toBeInTheDocument()
            })

            // Click on next button
            const nextButton = screen.getByText('Next')
            userEvent.click(nextButton)
            expect(defaultProps.goToStep).not.toHaveBeenCalled()
        })

        it('renders chat preview section', () => {
            renderWithProvider()

            expect(
                screen.getByText(
                    'Hi, I’m after a long dress for everyday wear, something comfortable and cute.',
                ),
            ).toBeInTheDocument()
        })

        it('navigates to the skillset step when Back is clicked and there is an integration', async () => {
            renderWithProvider()

            userEvent.click(screen.getByText(/Back/i))

            await waitFor(() => {
                expect(goToStep).toHaveBeenCalledWith(WizardStepEnum.SKILLSET)
            })
        })

        it('navigates to the shopify integration step when Back is clicked and there is no integration', async () => {
            mockUseShopifyIntegrationAndScope.mockReturnValue({
                integration: false,
            })
            renderWithProvider(undefined, { ...defaultProps, currentStep: 3 })

            userEvent.click(screen.getByText(/Back/i))

            await waitFor(() => {
                expect(goToStep).toHaveBeenCalledWith(
                    WizardStepEnum.SHOPIFY_INTEGRATION,
                )
            })
        })
    })

    describe('ChannelsStep - With preloaded data', () => {
        beforeEach(() => {
            jest.clearAllMocks()

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
        })

        const testIntegrationDisabling = async (
            integrationType: 'Email' | 'Chat',
            expectedUpdate: object,
        ) => {
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
                expect(screen.getByLabelText('Email')).toBeChecked()
                expect(screen.getByLabelText('Chat')).toBeChecked()
            })

            const integration = screen.getByText(integrationType)
            userEvent.click(integration)
            await waitFor(() => {
                expect(integration).not.toBeChecked()
            })

            const nextButton = screen.getByText('Next')
            userEvent.click(nextButton)

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
})
