import {QueryClientProvider} from '@tanstack/react-query'
import {fireEvent, screen, waitFor} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {fromJS} from 'immutable'
import {mockFlags} from 'jest-launchdarkly-mock'
import {keyBy} from 'lodash'
import React, {ComponentProps} from 'react'
import {Provider} from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import {AI_AGENT_SENTRY_TEAM} from 'common/const/sentryTeamNames'
import {SegmentEvent, logEvent} from 'common/segment'
import {FeatureFlagKey} from 'config/featureFlags'
import {billingState} from 'fixtures/billing'
import * as useLocalStorageImports from 'hooks/useLocalStorage'
import {useSearchParam} from 'hooks/useSearchParam'
import {StoreConfiguration} from 'models/aiAgent/types'
import {HelpCenter} from 'models/helpCenter/types'
import {IntegrationType} from 'models/integration/types'
import {applicationsAutomationSettingsAiAgentEnabledFixture} from 'pages/automate/aiAgent/fixtures/applicationAutomationSettings.fixture'
import {mockChatChannels} from 'pages/automate/aiAgent/fixtures/chatChannels.fixture'
import {useAccountStoreConfiguration} from 'pages/automate/aiAgent/hooks/useAccountStoreConfiguration'
import {useAiAgentEnabled} from 'pages/automate/aiAgent/hooks/useAiAgentEnabled'
import {useConfigurationForm} from 'pages/automate/aiAgent/hooks/useConfigurationForm'
import {useGetOrCreateSnippetHelpCenter} from 'pages/automate/aiAgent/hooks/useGetOrCreateSnippetHelpCenter'
import {usePublicResources} from 'pages/automate/aiAgent/hooks/usePublicResources'
import {useAiAgentStoreConfigurationContext} from 'pages/automate/aiAgent/providers/AiAgentStoreConfigurationContext'
import {FormValues} from 'pages/automate/aiAgent/types'
import useSelfServiceChatChannels from 'pages/automate/common/hooks/useSelfServiceChatChannels'
import history from 'pages/history'
import {ContactFormFixture} from 'pages/settings/contactForm/fixtures/contacForm'
import {
    getHelpCentersResponseFixture,
    getSingleHelpCenterResponseFixture,
} from 'pages/settings/helpCenter/fixtures/getHelpCentersResponse.fixture'
import {getHasAutomate} from 'state/billing/selectors'

import {initialState as articlesState} from 'state/entities/helpCenter/articles'
import {initialState as categoriesState} from 'state/entities/helpCenter/categories'
import {notify} from 'state/notifications/actions'
import {NotificationStatus} from 'state/notifications/types'
import {mockQueryClient} from 'tests/reactQueryTestingUtils'
import {renderWithRouter} from 'utils/testing'

import {INITIAL_FORM_VALUES, ToneOfVoice} from '../../../constants'
import * as util from '../../../util'
import {StoreConfigForm} from '../StoreConfigForm'

const queryClient = mockQueryClient()

// eslint-disable-next-line @typescript-eslint/no-unsafe-return
jest.mock('common/segment', () => ({
    ...jest.requireActual('common/segment'),
    logEvent: jest.fn(),
}))
const mockLogEvent = jest.mocked(logEvent)

jest.mock('state/notifications/actions')
jest.mock(
    'pages/automate/aiAgent/providers/AiAgentStoreConfigurationContext',
    () => ({
        useAiAgentStoreConfigurationContext: jest.fn(),
    })
)
jest.mock('pages/automate/aiAgent/hooks/useAccountStoreConfiguration')
jest.mock(
    'pages/automate/aiAgent/hooks/useGetOrCreateSnippetHelpCenter',
    () => ({
        useGetOrCreateSnippetHelpCenter: jest.fn(),
    })
)
jest.mock('pages/automate/aiAgent/hooks/useConfigurationForm')
jest.mock('pages/automate/aiAgent/hooks/usePublicResources', () => ({
    usePublicResources: jest.fn(),
}))
jest.mock('../../PublicSourcesSection/PublicSourcesSection', () => ({
    PublicSourcesSection: jest.fn(() => <p>Public Source Section</p>),
}))
jest.mock('state/billing/selectors', () => ({
    __esModule: true,
    getHasAutomate: jest.fn(),
}))
jest.mock('pages/automate/common/hooks/useSelfServiceChatChannels')

jest.mock('hooks/useSearchParam', () => ({
    useSearchParam: jest.fn(),
}))
jest.mock('pages/automate/aiAgent/hooks/useAiAgentEnabled')
const mockUseSearchParam = jest.mocked(useSearchParam)
const mockSetSearchParam = jest.fn()

const mockedUseAiAgentStoreConfigurationContext = jest.mocked(
    useAiAgentStoreConfigurationContext
)

const mockedUseAccountStoreConfiguration = jest.mocked(
    useAccountStoreConfiguration
)

const mockedUseGetOrCreateSnippetHelpCenter = jest.mocked(
    useGetOrCreateSnippetHelpCenter
)
const mockedUseSelfServiceChatChannels = jest.mocked(useSelfServiceChatChannels)
const mockedUseConfigurationForm = jest.mocked(useConfigurationForm)
const mockedUsePublicResources = jest.mocked(usePublicResources)
const mockGetHasAutomate = jest.mocked(getHasAutomate)
const mockUseEnableAiAgent = jest.mocked(useAiAgentEnabled)

const mockDispatch = jest.fn()
jest.mock('hooks/useAppDispatch', () => () => mockDispatch)

const spyIsAiAgentEnabled = jest.spyOn(util, 'isAiAgentEnabled')

const mockStore = configureMockStore([thunk])

const MOCK_EMAIL_ADDRESS = 'test@mail.com'

const MOCK_EMAIL_INTEGRATION = {
    id: 1,
    type: IntegrationType.Email,
    name: 'My email integration',
    meta: {
        address: MOCK_EMAIL_ADDRESS,
    },
}

const defaultState = {
    integrations: fromJS({
        integrations: [MOCK_EMAIL_INTEGRATION],
    }),
    billing: fromJS(billingState),
}
const contactForm = ContactFormFixture

const mockedStore = mockStore({
    ...defaultState,
    entities: {
        contactForm: {
            contactFormsAutomationSettings: {
                automationSettingsByContactFormId: {
                    [contactForm.id]: {
                        workflows: [],
                        order_management: {enabled: false},
                    },
                },
            },
            contactForms: {
                contactFormById: keyBy([contactForm], 'id'),
            },
        },
        chatsApplicationAutomationSettings:
            applicationsAutomationSettingsAiAgentEnabledFixture,
        helpCenter: {
            helpCenters: {
                helpCentersById: {
                    '1': getSingleHelpCenterResponseFixture,
                },
            },
            helpCentersAutomationSettings: {},
            articles: articlesState,
            categories: categoriesState,
        },
    },
})

const updateValueMocked = jest.fn()
const mockHandleOnSave = jest
    .fn()
    .mockImplementation((props: {onSuccess: () => void}) => {
        props.onSuccess()
    })
const mockUpdateStoreConfiguration = jest
    .fn()
    .mockImplementation((c: StoreConfiguration) => c)
const mockCreateStoreConfiguration = jest
    .fn()
    .mockImplementation((c: StoreConfiguration) => c)

const useLocalStorageSpy = jest.spyOn(
    useLocalStorageImports,
    'default'
) as jest.Mock

useLocalStorageSpy.mockReturnValue([[], jest.fn()])

const renderComponent = (
    props?: Partial<ComponentProps<typeof StoreConfigForm>>
) =>
    renderWithRouter(
        <Provider store={mockedStore}>
            <QueryClientProvider client={queryClient}>
                <StoreConfigForm
                    shopName="test-shop"
                    accountDomain="test-domain"
                    shopType="shopify"
                    faqHelpCenters={
                        [
                            {id: 1, name: 'help center 1', type: 'faq'},
                            {id: 2, name: 'help center 2', type: 'faq'},
                        ] as unknown as HelpCenter[]
                    }
                    {...props}
                />
            </QueryClientProvider>
        </Provider>
    )

describe('<StoreConfigForm />', () => {
    const storeConfiguration = {
        deactivatedDatetime: null,
        chatChannelDeactivatedDatetime: null,
        emailChannelDeactivatedDatetime: null,
        trialModeActivatedDatetime: '2024-07-30T12:33:02.750Z',
        previewModeActivatedDatetime: '2024-07-30T12:33:02.750Z',
        storeName: 'test-shop',
        helpCenterId: 1,
        snippetHelpCenterId: 1,
        guidanceHelpCenterId: 1,
        toneOfVoice: ToneOfVoice.Friendly,
        customToneOfVoiceGuidance:
            "Be concise. Use an empathetic, proactive, and reassuring tone. Acknowledge the customer's feelings with apologies and empathetic expressions. You can include emojis for a personal touch (e.g., 👍) and exclamation points.",
        signature: 'This response was created by AI',
        excludedTopics: [],
        tags: [],
        conversationBot: {
            id: 1,
            email: 'test@mail.com',
        },
        monitoredEmailIntegrations: [
            {
                id: MOCK_EMAIL_INTEGRATION.id,
                email: MOCK_EMAIL_ADDRESS,
            },
        ],
        silentHandover: false,
        ticketSampleRate: 100,
        dryRun: false,
        isDraft: false,
        monitoredChatIntegrations: [],
        wizardId: null,
    }

    const initialFormValues: FormValues = {
        deactivatedDatetime: null,
        chatChannelDeactivatedDatetime: null,
        emailChannelDeactivatedDatetime: null,
        trialModeActivatedDatetime: '2024-07-30T12:55:07.585Z',
        previewModeActivatedDatetime: '2024-07-30T12:55:07.585Z',
        ticketSampleRate: null,
        silentHandover: false,
        tags: [],
        excludedTopics: [],
        signature: 'This response was created by AI',
        toneOfVoice: ToneOfVoice.Friendly,
        customToneOfVoiceGuidance:
            "Be concise. Use an empathetic, proactive, and reassuring tone. Acknowledge the customer's feelings with apologies and empathetic expressions. You can include emojis for a personal touch (e.g., 👍) and exclamation points.",
        helpCenterId: 1,
        monitoredChatIntegrations: null,
        monitoredEmailIntegrations: [{id: 1, email: MOCK_EMAIL_ADDRESS}],
        wizard: undefined,
    }

    const defaultUseConfigurationFormValues = {
        formValues: initialFormValues,
        resetForm: jest.fn(),
        isFormDirty: false,
        updateValue: updateValueMocked,
        isFieldDirty: jest.fn(),
        setFormValues: jest.fn(),
        handleOnSave: mockHandleOnSave,
        isPendingCreateOrUpdate: false,
    }

    beforeEach(() => {
        updateValueMocked.mockReset()
        mockLogEvent.mockClear()
        mockedUseAiAgentStoreConfigurationContext.mockReset()
        mockedUseSelfServiceChatChannels.mockReturnValue(mockChatChannels)
        mockGetHasAutomate.mockReturnValue(true)
        mockedUseAiAgentStoreConfigurationContext.mockReturnValue({
            storeConfiguration,
            isLoading: false,
            updateStoreConfiguration: mockUpdateStoreConfiguration,
            createStoreConfiguration: mockCreateStoreConfiguration,
            isPendingCreateOrUpdate: false,
        })
        mockedUseGetOrCreateSnippetHelpCenter.mockReturnValue({
            isLoading: false,
            helpCenter: null,
        })
        mockedUseConfigurationForm.mockReturnValue({
            ...defaultUseConfigurationFormValues,
        })
        mockFlags({
            [FeatureFlagKey.AiAgentTrialMode]: false,
            [FeatureFlagKey.AiAgentChat]: false,
        })
        mockUseSearchParam.mockReturnValue([null, mockSetSearchParam])
        mockUseEnableAiAgent.mockReturnValue({
            updateSettingsAfterAiAgentEnabled: jest.fn(),
        })
        mockedUseAccountStoreConfiguration.mockReturnValue({
            accountConfiguration: undefined,
            aiAgentTicketViewId: 1,
        })
    })

    afterAll(() => {
        spyIsAiAgentEnabled.mockRestore()
    })

    it('should render the component', () => {
        renderComponent()

        expect(screen.getByText('General settings')).toBeInTheDocument()
    })

    it('should render new email integration caption', () => {
        renderComponent()
        expect(
            screen.getByText(
                'Select one or more email addresses for AI Agent to use. It will also reply to contact forms linked to these email addresses.'
            )
        ).toBeInTheDocument()
    })

    it('should deactivate AI agent if agentMode is in trial and AiAgentTrialMode flag is false', () => {
        renderComponent()

        expect(mockUpdateStoreConfiguration).toHaveBeenCalledWith({
            ...storeConfiguration,
            deactivatedDatetime: expect.any(String),
            emailChannelDeactivatedDatetime: expect.any(String),
            chatChannelDeactivatedDatetime: expect.any(String),
            trialModeActivatedDatetime: null,
            previewModeActivatedDatetime: null,
        })

        const actualDeactivatedDatetime =
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            mockUpdateStoreConfiguration.mock.calls[0][0].deactivatedDatetime
        const actualDate = new Date(actualDeactivatedDatetime)
        const now = new Date()

        expect(actualDate.getTime()).toBeCloseTo(now.getTime(), -3)
        expect(mockDispatch).not.toHaveBeenCalled()
        expect(notify).not.toHaveBeenCalledWith({
            message:
                'AI Agent has been disabled, because no Knowledge source is connected.',
            status: NotificationStatus.Warning,
        })
    })

    it('should deactivate AI agent if agentMode is in trial and AiAgentTrialMode flag is false', () => {
        renderComponent()

        expect(mockUpdateStoreConfiguration).toHaveBeenCalledWith({
            ...storeConfiguration,
            deactivatedDatetime: expect.any(String),
            chatChannelDeactivatedDatetime: expect.any(String),
            emailChannelDeactivatedDatetime: expect.any(String),
            trialModeActivatedDatetime: null,
            previewModeActivatedDatetime: null,
        })

        const actualDeactivatedDatetime =
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            mockUpdateStoreConfiguration.mock.calls[0][0].deactivatedDatetime
        const actualDate = new Date(actualDeactivatedDatetime)
        const now = new Date()

        expect(actualDate.getTime()).toBeCloseTo(now.getTime(), -3)

        expect(mockDispatch).not.toHaveBeenCalled()
        expect(notify).not.toHaveBeenCalledWith({
            message:
                'AI Agent has been disabled, because no Knowledge source is connected.',
            status: NotificationStatus.Warning,
        })
    })

    it('should not deactivate AI agent if agentMode is in trial and AiAgentTrialMode flag is true', () => {
        mockFlags({
            [FeatureFlagKey.AiAgentTrialMode]: true,
        })

        renderComponent()

        expect(mockUpdateStoreConfiguration).not.toHaveBeenCalled()
    })

    it('should call reportError when upsertStoreConfiguration throws an error', async () => {
        mockedUseAiAgentStoreConfigurationContext.mockReturnValue({
            storeConfiguration,
            isLoading: false,
            updateStoreConfiguration: mockUpdateStoreConfiguration,
            createStoreConfiguration: jest
                .fn()
                .mockRejectedValue(new Error('Test error')),
            isPendingCreateOrUpdate: false,
        })

        try {
            renderComponent()

            await waitFor(() => {
                expect(reportError).toHaveBeenCalledWith(expect.any(Error), {
                    tags: {team: AI_AGENT_SENTRY_TEAM},
                    extra: {
                        context: 'Error during disabling AI Agent',
                    },
                })
            })
        } catch (error) {}
    })

    it('should call deactivateAiAgent and dispatch notification when no knowledge base', async () => {
        const mockStoreIntegration = {
            ...storeConfiguration,
            helpCenterId: null,
            deactivatedDatetime: null,
        }
        mockedUseAiAgentStoreConfigurationContext.mockReturnValue({
            storeConfiguration: mockStoreIntegration,
            isLoading: false,
            updateStoreConfiguration: mockUpdateStoreConfiguration,
            createStoreConfiguration: mockCreateStoreConfiguration,
            isPendingCreateOrUpdate: false,
        })

        const helpCenter = getHelpCentersResponseFixture.data[0]
        mockedUseGetOrCreateSnippetHelpCenter.mockReturnValue({
            isLoading: false,
            helpCenter,
        })

        mockedUsePublicResources.mockReturnValue({
            sourceItems: [
                {id: 1, url: 'https://test1.com', status: 'error'},
                {id: 2, url: 'https://test2.com', status: 'error'},
            ],
            isSourceItemsListLoading: false,
        } as unknown as ReturnType<typeof usePublicResources>)

        renderComponent()

        await waitFor(() => {
            expect(mockUpdateStoreConfiguration).toHaveBeenCalledWith({
                ...mockStoreIntegration,
                deactivatedDatetime: expect.any(String),
                chatChannelDeactivatedDatetime: expect.any(String),
                emailChannelDeactivatedDatetime: expect.any(String),
                trialModeActivatedDatetime: null,
                previewModeActivatedDatetime: null,
            })

            expect(mockDispatch).toHaveBeenCalled()
            expect(notify).toHaveBeenCalledWith({
                message:
                    'AI Agent has been disabled, because no Knowledge source is connected.',
                status: NotificationStatus.Warning,
            })
        })
    })

    describe('AI Agent chat configuration', () => {
        beforeEach(() => {
            mockFlags({
                [FeatureFlagKey.AiAgentChat]: true,
            })
        })

        it('should display chat dropdown', () => {
            renderComponent()

            expect(
                screen.getByText('Select one or more chat integrations')
            ).toBeInTheDocument()
        })

        it('should not display dropdown if feature flag is false', async () => {
            mockFlags({
                [FeatureFlagKey.AiAgentChat]: false,
            })
            renderComponent()

            await waitFor(() => {
                expect(
                    screen.queryByText('Select one or more chat integrations')
                ).not.toBeInTheDocument()
            })
        })

        it('should filter chat channels correctly and populate currentChatChannels', async () => {
            renderComponent()

            const dropdown = screen.getByText(
                'Select one or more chat integrations'
            )
            fireEvent.focus(dropdown)

            await waitFor(() => {
                for (const channel of mockChatChannels) {
                    expect(
                        screen.getByText(channel.value.name)
                    ).toBeInTheDocument()
                }
            })
        })

        it('should display chat channels from store configuration in dropdown', async () => {
            const chatIntegration = mockChatChannels[0]
            mockedUseConfigurationForm.mockReturnValue({
                ...defaultUseConfigurationFormValues,
                formValues: {
                    ...initialFormValues,
                    monitoredChatIntegrations: [chatIntegration.value.id],
                },
            })

            renderComponent()

            await waitFor(() =>
                expect(screen.getByText(chatIntegration.value.name))
            )
        })
    })

    it('should render error email integration caption when there is none selected', () => {
        mockedUseConfigurationForm.mockReturnValue({
            ...defaultUseConfigurationFormValues,
            formValues: {
                ...initialFormValues,
                monitoredEmailIntegrations: null,
            },
        })

        renderComponent()
        expect(
            screen.getByText('One or more addresses required.')
        ).toBeInTheDocument()
    })

    it('should render default email signature when signature in form values is null', () => {
        mockedUseConfigurationForm.mockReturnValue({
            ...defaultUseConfigurationFormValues,
            formValues: {
                ...initialFormValues,
                monitoredEmailIntegrations: [],
            },
        })

        renderComponent()
        expect(
            screen.getByText('This response was created by AI')
        ).toBeInTheDocument()
    })

    it('should not render error when email channel is disabled and multichannel enabled', () => {
        mockedUseConfigurationForm.mockReturnValue({
            ...defaultUseConfigurationFormValues,
            formValues: {
                ...initialFormValues,
                emailChannelDeactivatedDatetime: '2024-07-30T12:33:02.750Z',
                signature: '',
            },
        })
        mockFlags({
            [FeatureFlagKey.AiAgentMultiChannelEnablement]: true,
        })

        renderComponent()

        expect(
            screen.queryByText('Email signature is required.')
        ).not.toBeInTheDocument()
    })

    it('should render error email signature caption when signature is empty', () => {
        mockedUseConfigurationForm.mockReturnValue({
            ...defaultUseConfigurationFormValues,
            formValues: {
                ...initialFormValues,
                monitoredEmailIntegrations: [],
                signature: '',
            },
        })

        renderComponent()

        const textArea = screen.getByPlaceholderText('AI Agent email signature')
        fireEvent.blur(textArea)

        expect(
            screen.getByText('Email signature is required.')
        ).toBeInTheDocument()
    })

    it('should trigger monitoredChatIntegrations with correct values on dropdown item click', async () => {
        mockFlags({
            [FeatureFlagKey.AiAgentChat]: true,
        })

        renderComponent()

        const channelToSelect = mockChatChannels[0]

        const dropdown = screen.getByText(
            'Select one or more chat integrations'
        )
        fireEvent.focus(dropdown)

        const channelCheckbox = screen.getByText(/25 Shopify Chat/)
        fireEvent.click(channelCheckbox)

        await waitFor(() => {
            expect(updateValueMocked).toHaveBeenCalledWith(
                'monitoredChatIntegrations',
                [channelToSelect.value?.id]
            )
        })
    })

    it('should trigger monitoredEmailIntegration with correct values on dropdown item click', async () => {
        mockFlags({
            [FeatureFlagKey.AiAgentChat]: true,
        })

        mockedUseAiAgentStoreConfigurationContext.mockReturnValue({
            storeConfiguration: {
                ...storeConfiguration,
                monitoredEmailIntegrations: [],
                deactivatedDatetime: '2024-07-30T12:33:02.750Z',
                helpCenterId: 1,
            },
            isLoading: false,
            updateStoreConfiguration: mockUpdateStoreConfiguration,
            createStoreConfiguration: mockCreateStoreConfiguration,
            isPendingCreateOrUpdate: false,
        })
        mockedUseGetOrCreateSnippetHelpCenter.mockReturnValue({
            helpCenter: null,
            isLoading: false,
        })
        mockedUseConfigurationForm.mockReturnValue({
            ...defaultUseConfigurationFormValues,
            formValues: {
                ...initialFormValues,
                monitoredEmailIntegrations: [],
                deactivatedDatetime: '2024-07-30T12:33:02.750Z',
                helpCenterId: 1,
            },
        })

        renderComponent()

        const dropdown = screen.getByText('Select one or more email addresses')
        fireEvent.focus(dropdown)
        const emailCheckbox = screen.getByText(
            MOCK_EMAIL_INTEGRATION.meta.address
        )
        fireEvent.click(emailCheckbox)

        await waitFor(() => {
            expect(updateValueMocked).toHaveBeenCalledWith(
                'monitoredEmailIntegrations',
                [
                    {
                        id: MOCK_EMAIL_INTEGRATION.id,
                        email: MOCK_EMAIL_INTEGRATION.meta.address,
                    },
                ]
            )
        })
    })

    it('should call createStoreConfiguration when creating a new configuration', async () => {
        mockedUseAiAgentStoreConfigurationContext.mockReturnValue({
            storeConfiguration: undefined,
            isLoading: false,
            updateStoreConfiguration: mockUpdateStoreConfiguration,
            createStoreConfiguration: mockCreateStoreConfiguration,
            isPendingCreateOrUpdate: false,
        })
        mockedUseConfigurationForm.mockReturnValue({
            ...defaultUseConfigurationFormValues,
        })

        renderComponent()

        const saveButton = screen.getByText(/Save Changes/i)
        fireEvent.click(saveButton)

        await waitFor(() => {
            expect(mockHandleOnSave).toHaveBeenCalled()
        })
    })

    it('scrolls to knowledge section if section query param equals knowledge', () => {
        const mockScrollIntoView = jest.fn()
        Element.prototype.scrollIntoView = mockScrollIntoView()

        mockUseSearchParam.mockReturnValue(['knowledge', mockSetSearchParam])

        renderComponent()

        expect(mockUseSearchParam).toHaveBeenCalledWith('section')
        expect(mockScrollIntoView).toHaveBeenCalled()
        expect(mockSetSearchParam).toHaveBeenCalledWith(null)
    })

    it('scrolls to email section if section query param equals email', () => {
        const mockScrollIntoView = jest.fn()
        Element.prototype.scrollIntoView = mockScrollIntoView()

        mockUseSearchParam.mockReturnValue(['email', mockSetSearchParam])

        renderComponent()

        expect(mockUseSearchParam).toHaveBeenCalledWith('section')
        expect(mockScrollIntoView).toHaveBeenCalled()
        expect(mockSetSearchParam).toHaveBeenCalledWith(null)
    })

    it('should handle enabled mode correctly', () => {
        mockFlags({
            [FeatureFlagKey.AiAgentTrialMode]: true,
            [FeatureFlagKey.AiAgentChat]: false,
        })
        renderComponent({})

        // Simulate the user selecting 'enabled' mode
        const radioButton = screen.getByLabelText(
            'Directly respond to customers'
        )
        userEvent.click(radioButton)

        // Check that updateValue was called with the correct arguments
        // deactivatedDatetime + emailChannelDeactivatedDatetime + chatChannelDeactivatedDatetime + trialModeActivatedDatetime + previewModeActivatedDatetime
        expect(updateValueMocked).toHaveBeenCalledTimes(5)
        expect(updateValueMocked).toHaveBeenCalledWith(
            'deactivatedDatetime',
            null
        )
        expect(updateValueMocked).toHaveBeenCalledWith(
            'trialModeActivatedDatetime',
            null
        )
        expect(updateValueMocked).toHaveBeenCalledWith(
            'previewModeActivatedDatetime',
            null
        )
    })

    it('should handle trial mode correctly', () => {
        mockFlags({
            [FeatureFlagKey.AiAgentTrialMode]: true,
            [FeatureFlagKey.AiAgentChat]: false,
        })
        mockedUseConfigurationForm.mockReturnValue({
            ...defaultUseConfigurationFormValues,
            formValues: {
                ...initialFormValues,
                trialModeActivatedDatetime: null,
                previewModeActivatedDatetime: null,
            },
        })

        renderComponent({})

        const radioButton = screen.getByLabelText(
            'Draft responses for agents to review before sending'
        )
        userEvent.click(radioButton)

        // Check that updateValue was called with the correct arguments
        // deactivatedDatetime + emailChannelDeactivatedDatetime + chatChannelDeactivatedDatetime + trialModeActivatedDatetime + previewModeActivatedDatetime
        expect(updateValueMocked).toHaveBeenCalledTimes(5)
        expect(updateValueMocked).toHaveBeenCalledWith(
            'deactivatedDatetime',
            null
        )
        expect(updateValueMocked).toHaveBeenCalledWith(
            'trialModeActivatedDatetime',
            expect.any(String)
        )
        expect(updateValueMocked).toHaveBeenCalledWith(
            'previewModeActivatedDatetime',
            expect.any(String)
        )
    })

    it('should handle disabled mode correctly', () => {
        mockFlags({
            [FeatureFlagKey.AiAgentTrialMode]: true,
            [FeatureFlagKey.AiAgentChat]: false,
            [FeatureFlagKey.AiAgentMultiChannelEnablement]: false,
        })
        renderComponent({})

        // Simulate the user selecting 'disabled' mode
        const radioButton = screen.getByLabelText('Disabled')
        userEvent.click(radioButton)

        // Check that updateValue was called with the correct arguments
        // deactivatedDatetime + emailChannelDeactivatedDatetime + chatChannelDeactivatedDatetime + trialModeActivatedDatetime + previewModeActivatedDatetime
        expect(updateValueMocked).toHaveBeenCalledTimes(5)
        expect(updateValueMocked).toHaveBeenCalledWith(
            'deactivatedDatetime',
            expect.any(String)
        )
        expect(updateValueMocked).toHaveBeenCalledWith(
            'trialModeActivatedDatetime',
            null
        )
        expect(updateValueMocked).toHaveBeenCalledWith(
            'previewModeActivatedDatetime',
            null
        )
    })

    it('should call segment event when disabling email channel', () => {
        mockFlags({
            [FeatureFlagKey.AiAgentMultiChannelEnablement]: false,
        })
        mockedUseAiAgentStoreConfigurationContext.mockReturnValue({
            storeConfiguration: {
                ...storeConfiguration,
                deactivatedDatetime: null,
            },
            isLoading: false,
            updateStoreConfiguration: mockUpdateStoreConfiguration,
            createStoreConfiguration: jest
                .fn()
                .mockRejectedValue(new Error('Test error')),
            isPendingCreateOrUpdate: false,
        })

        renderComponent({})

        const toggleCheckbox = screen.getByLabelText('Enable AI Agent')
        // Toggle working only with fire event
        fireEvent.click(toggleCheckbox)

        expect(mockLogEvent).toHaveBeenCalledTimes(1)
        expect(mockLogEvent).toHaveBeenCalledWith(
            SegmentEvent.AiAgentConfigurationDisabled
        )
    })

    it('should deactivate email channel', () => {
        mockFlags({
            [FeatureFlagKey.AiAgentMultiChannelEnablement]: true,
        })
        mockedUseConfigurationForm.mockReturnValue({
            ...defaultUseConfigurationFormValues,
            formValues: {
                ...initialFormValues,
                chatChannelDeactivatedDatetime: null,
            },
        })

        renderComponent()
        const emailChannelCheckbox = screen.getByLabelText(
            'Enable AI Agent on Email'
        )
        fireEvent.click(emailChannelCheckbox)

        expect(updateValueMocked).toHaveBeenCalledWith(
            'emailChannelDeactivatedDatetime',
            expect.any(String)
        )
    })

    it('should deactivate chat channel', () => {
        mockFlags({
            [FeatureFlagKey.AiAgentMultiChannelEnablement]: true,
            [FeatureFlagKey.AiAgentChat]: true,
        })

        mockedUseConfigurationForm.mockReturnValue({
            ...defaultUseConfigurationFormValues,
            formValues: {
                ...initialFormValues,
                chatChannelDeactivatedDatetime: null,
            },
        })
        renderComponent()
        const chatChannelCheckbox = screen.getByLabelText(
            'Enable AI Agent on Chat'
        )
        fireEvent.click(chatChannelCheckbox)
        expect(updateValueMocked).toHaveBeenCalledWith(
            'chatChannelDeactivatedDatetime',
            expect.any(String)
        )
    })

    it('should activate chat channel', () => {
        mockFlags({
            [FeatureFlagKey.AiAgentMultiChannelEnablement]: true,
            [FeatureFlagKey.AiAgentChat]: true,
        })

        mockedUseConfigurationForm.mockReturnValue({
            ...defaultUseConfigurationFormValues,
            formValues: {
                ...initialFormValues,
                trialModeActivatedDatetime: null,
                previewModeActivatedDatetime: null,
                chatChannelDeactivatedDatetime: '2024-07-30T12:33:02.750Z',
            },
        })

        renderComponent()
        const chatChannelCheckbox = screen.getByLabelText(
            'Enable AI Agent on Chat'
        )
        fireEvent.click(chatChannelCheckbox)

        expect(updateValueMocked).toHaveBeenCalledTimes(1)
        expect(updateValueMocked).toHaveBeenLastCalledWith(
            'chatChannelDeactivatedDatetime',
            null
        )
    })

    it('set ai agent enabled toggles correctly if default form values are set', async () => {
        mockedUseAccountStoreConfiguration.mockReturnValue({
            accountConfiguration: undefined,
            aiAgentTicketViewId: 1,
        })

        mockedUseAiAgentStoreConfigurationContext.mockReturnValue({
            storeConfiguration: undefined,
            isLoading: false,
            updateStoreConfiguration: mockUpdateStoreConfiguration,
            createStoreConfiguration: mockCreateStoreConfiguration,
            isPendingCreateOrUpdate: false,
        })

        mockedUseConfigurationForm.mockReturnValue({
            ...defaultUseConfigurationFormValues,
            isFormDirty: true,
            formValues: {
                ...initialFormValues,
                deactivatedDatetime: undefined,
                emailChannelDeactivatedDatetime: undefined,
                chatChannelDeactivatedDatetime: undefined,
            },
        })

        renderComponent()

        await waitFor(() => {
            expect(spyIsAiAgentEnabled).toHaveBeenCalledWith(
                INITIAL_FORM_VALUES.deactivatedDatetime
            )
            expect(spyIsAiAgentEnabled).toHaveBeenCalledWith(
                INITIAL_FORM_VALUES.emailChannelDeactivatedDatetime
            )
            expect(spyIsAiAgentEnabled).toHaveBeenCalledWith(
                INITIAL_FORM_VALUES.chatChannelDeactivatedDatetime
            )
        })
    })

    describe('AI Agent ticket view modal', () => {
        it('should not modal if AI Agent is enabled', async () => {
            mockedUseAccountStoreConfiguration.mockReturnValue({
                accountConfiguration: undefined,
                aiAgentTicketViewId: 1,
            })

            mockedUseAiAgentStoreConfigurationContext.mockReturnValue({
                storeConfiguration: {
                    ...storeConfiguration,
                    deactivatedDatetime: null,
                    chatChannelDeactivatedDatetime: null,
                    emailChannelDeactivatedDatetime: '2024-07-30T12:33:02.750Z',
                    trialModeActivatedDatetime: null,
                },
                isLoading: false,
                updateStoreConfiguration: mockUpdateStoreConfiguration,
                createStoreConfiguration: mockCreateStoreConfiguration,
                isPendingCreateOrUpdate: false,
            })

            mockedUseConfigurationForm.mockReturnValue({
                ...defaultUseConfigurationFormValues,
                isFormDirty: true,
                formValues: {
                    ...initialFormValues,
                    trialModeActivatedDatetime: null,
                    deactivatedDatetime: null,
                    chatChannelDeactivatedDatetime: null,
                    emailChannelDeactivatedDatetime: null,
                },
            })

            renderComponent({})

            const saveButton = screen.getByText(/Save Changes/i)
            fireEvent.click(saveButton)

            await waitFor(() => {
                expect(mockHandleOnSave).toHaveBeenCalled()

                const ticketViewButton = screen.queryByRole('button', {
                    name: 'Show Me',
                })
                expect(ticketViewButton).not.toBeInTheDocument()
            })
        })

        it('should not display modal if there is no AI Agent view', async () => {
            mockedUseAccountStoreConfiguration.mockReturnValue({
                accountConfiguration: undefined,
                aiAgentTicketViewId: null,
            })

            mockedUseAiAgentStoreConfigurationContext.mockReturnValue({
                storeConfiguration: {
                    ...storeConfiguration,
                    deactivatedDatetime: '2024-07-30T12:33:02.750Z',
                    chatChannelDeactivatedDatetime: '2024-07-30T12:33:02.750Z',
                    emailChannelDeactivatedDatetime: '2024-07-30T12:33:02.750Z',
                },
                isLoading: false,
                updateStoreConfiguration: mockUpdateStoreConfiguration,
                createStoreConfiguration: mockCreateStoreConfiguration,
                isPendingCreateOrUpdate: false,
            })

            mockedUseConfigurationForm.mockReturnValue({
                ...defaultUseConfigurationFormValues,
                isFormDirty: true,
                formValues: {
                    ...initialFormValues,
                    trialModeActivatedDatetime: null,
                    deactivatedDatetime: null,
                    chatChannelDeactivatedDatetime: null,
                    emailChannelDeactivatedDatetime: null,
                },
            })

            renderComponent({})

            const saveButton = screen.getByText(/Save Changes/i)
            fireEvent.click(saveButton)

            await waitFor(() => {
                expect(mockHandleOnSave).toHaveBeenCalled()

                const ticketViewButton = screen.queryByRole('button', {
                    name: 'Show Me',
                })
                expect(ticketViewButton).not.toBeInTheDocument()
            })
        })

        it('should not display modal if data persisted in localStorage', async () => {
            useLocalStorageSpy.mockReturnValueOnce([['test-shop'], null])
            mockedUseAccountStoreConfiguration.mockReturnValue({
                accountConfiguration: undefined,
                aiAgentTicketViewId: 1,
            })

            mockedUseAiAgentStoreConfigurationContext.mockReturnValue({
                storeConfiguration: {
                    ...storeConfiguration,
                    deactivatedDatetime: '2024-07-30T12:33:02.750Z',
                    chatChannelDeactivatedDatetime: '2024-07-30T12:33:02.750Z',
                    emailChannelDeactivatedDatetime: '2024-07-30T12:33:02.750Z',
                },
                isLoading: false,
                updateStoreConfiguration: mockUpdateStoreConfiguration,
                createStoreConfiguration: mockCreateStoreConfiguration,
                isPendingCreateOrUpdate: false,
            })

            mockedUseConfigurationForm.mockReturnValue({
                ...defaultUseConfigurationFormValues,
                isFormDirty: true,
                formValues: {
                    ...initialFormValues,
                    trialModeActivatedDatetime: null,
                    deactivatedDatetime: '2024-07-30T12:33:02.750Z',
                    chatChannelDeactivatedDatetime: null,
                    emailChannelDeactivatedDatetime: '2024-07-30T12:33:02.750Z',
                },
            })

            renderComponent({})

            const saveButton = screen.getByText(/Save Changes/i)
            fireEvent.click(saveButton)

            await waitFor(() => {
                expect(mockHandleOnSave).toHaveBeenCalled()

                const ticketViewButton = screen.queryByRole('button', {
                    name: 'Show Me',
                })
                expect(ticketViewButton).not.toBeInTheDocument()
            })
        })

        it('should display ai agent configuration modal', async () => {
            mockedUseAccountStoreConfiguration.mockReturnValue({
                accountConfiguration: undefined,
                aiAgentTicketViewId: 1,
            })

            mockedUseAiAgentStoreConfigurationContext.mockReturnValue({
                storeConfiguration: {
                    ...storeConfiguration,
                    deactivatedDatetime: '2024-07-30T12:33:02.750Z',
                    chatChannelDeactivatedDatetime: '2024-07-30T12:33:02.750Z',
                    emailChannelDeactivatedDatetime: '2024-07-30T12:33:02.750Z',
                },
                isLoading: false,
                updateStoreConfiguration: mockUpdateStoreConfiguration,
                createStoreConfiguration: mockCreateStoreConfiguration,
                isPendingCreateOrUpdate: false,
            })

            mockedUseConfigurationForm.mockReturnValue({
                ...defaultUseConfigurationFormValues,
                isFormDirty: true,
                formValues: {
                    ...initialFormValues,
                    trialModeActivatedDatetime: null,
                    deactivatedDatetime: '2024-07-30T12:33:02.750Z',
                    chatChannelDeactivatedDatetime: null,
                    emailChannelDeactivatedDatetime: '2024-07-30T12:33:02.750Z',
                },
            })

            renderComponent({})

            const saveButton = screen.getByText(/Save Changes/i)
            fireEvent.click(saveButton)

            await waitFor(() => {
                expect(mockHandleOnSave).toHaveBeenCalled()

                const ticketViewButton = screen.getByRole('button', {
                    name: 'Show Me',
                })
                ticketViewButton.click()
                expect(history.push).toHaveBeenCalledWith('/app/views/1', {
                    skipRedirect: true,
                })
            })
        })

        it('should show error when chat or email enabled but no integrations selected', () => {
            mockFlags({
                [FeatureFlagKey.AiAgentMultiChannelEnablement]: true,
                [FeatureFlagKey.AiAgentChat]: true,
            })

            mockedUseConfigurationForm.mockReturnValue({
                ...defaultUseConfigurationFormValues,
                formValues: {
                    ...initialFormValues,
                    chatChannelDeactivatedDatetime: null,
                    emailChannelDeactivatedDatetime: null,
                    monitoredEmailIntegrations: [],
                    monitoredChatIntegrations: [],
                },
            })

            renderComponent()

            expect(
                screen.getByLabelText(
                    /AI Agent responds to tickets sent to the following Chats/i
                )
            ).toBeInvalid()

            expect(
                screen.getByLabelText(
                    /AI Agent responds to tickets sent to the following email addresses/i
                )
            ).toBeInvalid()
        })

        it('should not show model when trial mode is enabled', async () => {
            mockFlags({
                [FeatureFlagKey.AiAgentTrialMode]: false,
            })
            mockedUseAccountStoreConfiguration.mockReturnValue({
                accountConfiguration: undefined,
                aiAgentTicketViewId: 1,
            })

            mockedUseAiAgentStoreConfigurationContext.mockReturnValue({
                storeConfiguration: {
                    ...storeConfiguration,
                    deactivatedDatetime: null,
                    chatChannelDeactivatedDatetime: null,
                    emailChannelDeactivatedDatetime: '2024-07-30T12:33:02.750Z',
                    trialModeActivatedDatetime: null,
                },
                isLoading: false,
                updateStoreConfiguration: mockUpdateStoreConfiguration,
                createStoreConfiguration: mockCreateStoreConfiguration,
                isPendingCreateOrUpdate: false,
            })

            mockedUseConfigurationForm.mockReturnValue({
                ...defaultUseConfigurationFormValues,
                isFormDirty: true,
                formValues: {
                    ...initialFormValues,
                    trialModeActivatedDatetime: '2024-07-30T12:33:02.750Z',
                    deactivatedDatetime: null,
                    chatChannelDeactivatedDatetime: null,
                    emailChannelDeactivatedDatetime: null,
                },
            })

            renderComponent({})

            const saveButton = screen.getByText(/Save Changes/i)
            fireEvent.click(saveButton)

            await waitFor(() => {
                expect(mockHandleOnSave).toHaveBeenCalled()

                const ticketViewButton = screen.queryByRole('button', {
                    name: 'Show Me',
                })
                expect(ticketViewButton).not.toBeInTheDocument()
            })
        })

        it('should show model when switching form trial mode to live mode', async () => {
            mockFlags({
                [FeatureFlagKey.AiAgentTrialMode]: false,
            })
            mockedUseAccountStoreConfiguration.mockReturnValue({
                accountConfiguration: undefined,
                aiAgentTicketViewId: 1,
            })

            mockedUseAiAgentStoreConfigurationContext.mockReturnValue({
                storeConfiguration: {
                    ...storeConfiguration,
                    deactivatedDatetime: '2024-07-30T12:33:02.750Z',
                    chatChannelDeactivatedDatetime: '2024-07-30T12:33:02.750Z',
                    emailChannelDeactivatedDatetime: '2024-07-30T12:33:02.750Z',
                    trialModeActivatedDatetime: '2024-07-30T12:33:02.750Z',
                },
                isLoading: false,
                updateStoreConfiguration: mockUpdateStoreConfiguration,
                createStoreConfiguration: mockCreateStoreConfiguration,
                isPendingCreateOrUpdate: false,
            })

            mockedUseConfigurationForm.mockReturnValue({
                ...defaultUseConfigurationFormValues,
                isFormDirty: true,
                formValues: {
                    ...initialFormValues,
                    trialModeActivatedDatetime: null,
                    deactivatedDatetime: null,
                    chatChannelDeactivatedDatetime: null,
                    emailChannelDeactivatedDatetime: null,
                },
            })

            renderComponent({})

            const saveButton = screen.getByText(/Save Changes/i)
            fireEvent.click(saveButton)

            await waitFor(() => {
                expect(mockHandleOnSave).toHaveBeenCalled()

                const ticketViewButton = screen.queryByRole('button', {
                    name: 'Show Me',
                })
                expect(ticketViewButton).toBeInTheDocument()
            })
        })
    })
})
