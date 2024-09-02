import {fireEvent, screen, waitFor} from '@testing-library/react'
import React, {ComponentProps} from 'react'
import {Provider} from 'react-redux'
import {fromJS} from 'immutable'
import thunk from 'redux-thunk'
import configureMockStore from 'redux-mock-store'
import {mockFlags} from 'jest-launchdarkly-mock'
import {keyBy} from 'lodash'
import {QueryClientProvider} from '@tanstack/react-query'

import {notify} from 'state/notifications/actions'
import {IntegrationType} from 'models/integration/types'
import {renderWithRouter} from 'utils/testing'
import {
    useConfigurationForm,
    validateConfigurationFormValues,
} from 'pages/automate/aiAgent/hooks/useConfigurationForm'
import {NotificationStatus} from 'state/notifications/types'
import {FeatureFlagKey} from 'config/featureFlags'
import {AI_AGENT_SENTRY_TEAM} from 'common/const/sentryTeamNames'
import {usePublicResources} from 'pages/automate/aiAgent/hooks/usePublicResources'
import {
    getHelpCentersResponseFixture,
    getSingleHelpCenterResponseFixture,
} from 'pages/settings/helpCenter/fixtures/getHelpCentersResponse.fixture'
import {useGetOrCreateSnippetHelpCenter} from 'pages/automate/aiAgent/hooks/useGetOrCreateSnippetHelpCenter'
import {getHasAutomate} from 'state/billing/selectors'
import {HelpCenter} from 'models/helpCenter/types'
import {StoreConfiguration} from 'models/aiAgent/types'
import {useAiAgentStoreConfigurationContext} from 'pages/automate/aiAgent/providers/AiAgentStoreConfigurationContext'
import {mockQueryClient} from 'tests/reactQueryTestingUtils'
import {billingState} from 'fixtures/billing'
import {ContactFormFixture} from 'pages/settings/contactForm/fixtures/contacForm'
import {FormValues, ValidFormValues} from 'pages/automate/aiAgent/types'
import useSelfServiceChatChannels from 'pages/automate/common/hooks/useSelfServiceChatChannels'
import {mockChatChannels} from 'pages/automate/aiAgent/fixtures/chatChannels.fixture'
import {applicationsAutomationSettingsAiAgentEnabledFixture} from 'pages/automate/aiAgent/fixtures/applicationAutomationSettings.fixture'

import {useSearchParam} from 'hooks/useSearchParam'
import {initialState as articlesState} from '../../../../../../state/entities/helpCenter/articles'
import {initialState as categoriesState} from '../../../../../../state/entities/helpCenter/categories'
import {StoreConfigForm} from '../StoreConfigForm'

const queryClient = mockQueryClient()

jest.mock('state/notifications/actions')
jest.mock('../../../providers/AiAgentStoreConfigurationContext', () => ({
    useAiAgentStoreConfigurationContext: jest.fn(),
}))
jest.mock('../../../hooks/useGetOrCreateSnippetHelpCenter', () => ({
    useGetOrCreateSnippetHelpCenter: jest.fn(),
}))
jest.mock('../../../hooks/useConfigurationForm')
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
const mockUseSearchParam = jest.mocked(useSearchParam)
const mockSetSearchParam = jest.fn()

const mockedUseAiAgentStoreConfigurationContext = jest.mocked(
    useAiAgentStoreConfigurationContext
)
const mockedUseGetOrCreateSnippetHelpCenter = jest.mocked(
    useGetOrCreateSnippetHelpCenter
)
const mockedUseConfigurationForm = jest.mocked(useConfigurationForm)
const mockedUsePublicResources = jest.mocked(usePublicResources)
const mockGetHasAutomate = jest.mocked(getHasAutomate)
const mockedValidateConfigurationFormValues = jest.mocked(
    validateConfigurationFormValues
)

const mockDispatch = jest.fn()
jest.mock('hooks/useAppDispatch', () => () => mockDispatch)
const updateValueMocked = jest.fn()

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

const mockUpdateStoreConfiguration = jest
    .fn()
    .mockImplementation((c: StoreConfiguration) => c)
const mockCreateStoreConfiguration = jest
    .fn()
    .mockImplementation((c: StoreConfiguration) => c)

const renderComponent = (
    props: Partial<ComponentProps<typeof StoreConfigForm>>
) => {
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
}

describe('<StoreConfigForm />', () => {
    const storeConfiguration = {
        deactivatedDatetime: null,
        trialModeActivatedDatetime: '2024-07-30T12:33:02.750Z',
        storeName: 'test-shop',
        helpCenterId: 1,
        snippetHelpCenterId: 1,
        guidanceHelpCenterId: 1,
        toneOfVoice: 'Friendly',
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
    }

    const initialFormValues: FormValues = {
        deactivatedDatetime: null,
        trialModeActivatedDatetime: '2024-07-30T12:55:07.585Z',
        ticketSampleRate: null,
        silentHandover: false,
        tags: [],
        excludedTopics: [],
        signature: 'This response was created by AI',
        toneOfVoice: 'Friendly',
        customToneOfVoiceGuidance:
            "Be concise. Use an empathetic, proactive, and reassuring tone. Acknowledge the customer's feelings with apologies and empathetic expressions. You can include emojis for a personal touch (e.g., 👍) and exclamation points.",
        helpCenterId: 1,
        monitoredChatIntegrations: [],
        monitoredEmailIntegrations: [{id: 1, email: MOCK_EMAIL_ADDRESS}],
    }

    const validFormValues = {
        ...initialFormValues,
        monitoredEmailIntegrations: [
            {
                email: MOCK_EMAIL_ADDRESS,
                id: MOCK_EMAIL_INTEGRATION.id,
            },
        ],
        monitoredChatIntegrations: [],
    } as ValidFormValues

    beforeEach(() => {
        updateValueMocked.mockReset()
        mockedUseAiAgentStoreConfigurationContext.mockReset()
        ;(useSelfServiceChatChannels as jest.Mock).mockReturnValue(
            mockChatChannels
        )
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
            formValues: initialFormValues,
            resetForm: jest.fn(),
            isFormDirty: false,
            updateValue: updateValueMocked,
            isFieldDirty: jest.fn(),
        })
        mockFlags({
            [FeatureFlagKey.AiAgentTrialMode]: false,
            [FeatureFlagKey.AiAgentChat]: false,
            [FeatureFlagKey.AiAgentSupportContactForm]: false,
        })
        mockUseSearchParam.mockReturnValue([null, mockSetSearchParam])
    })
    it('should render the component', () => {
        renderComponent({})

        expect(screen.getByText('General settings')).toBeInTheDocument()
    })

    it('should render new email integration caption', () => {
        mockFlags({
            [FeatureFlagKey.AiAgentSupportContactForm]: true,
        })

        renderComponent({})
        expect(
            screen.getByText(
                'Select one or more email addresses for AI Agent to use. It will also reply to contact forms linked to these email addresses.'
            )
        ).toBeInTheDocument()
    })

    it('should deactivate AI agent if agentMode is in trial and AiAgentTrialMode flag is false', () => {
        renderComponent({})

        expect(mockUpdateStoreConfiguration).toHaveBeenCalledWith({
            ...storeConfiguration,
            deactivatedDatetime: expect.any(String),
            trialModeActivatedDatetime: null,
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
        renderComponent({})

        expect(mockUpdateStoreConfiguration).toHaveBeenCalledWith({
            ...storeConfiguration,
            deactivatedDatetime: expect.any(String),
            trialModeActivatedDatetime: null,
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

        renderComponent({})

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
            renderComponent({})

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

        renderComponent({})

        await waitFor(() => {
            expect(mockUpdateStoreConfiguration).toHaveBeenCalledWith({
                ...mockStoreIntegration,
                deactivatedDatetime: expect.any(String),
                trialModeActivatedDatetime: null,
            })

            expect(mockDispatch).toHaveBeenCalled()
            expect(notify).toHaveBeenCalledWith({
                message:
                    'AI Agent has been disabled, because no Knowledge source is connected.',
                status: NotificationStatus.Warning,
            })
        })
    })

    it('should display chat dropdown', () => {
        mockFlags({
            [FeatureFlagKey.AiAgentChat]: true,
        })

        renderComponent({})

        expect(screen.getByTestId('chat-dropdown')).toBeInTheDocument()
    })

    it('should not display dropdown if feature flag is false', async () => {
        mockFlags({
            [FeatureFlagKey.AiAgentChat]: false,
        })
        renderComponent({})

        await waitFor(() => {
            expect(
                screen.queryByTestId('chat-dropdown')
            ).not.toBeInTheDocument()
        })
    })

    it('should render error email integration caption when there is none selected', () => {
        mockedUseConfigurationForm.mockReturnValue({
            formValues: {
                ...initialFormValues,
                monitoredEmailIntegrations: null,
            },
            resetForm: jest.fn(),
            isFormDirty: false,
            updateValue: jest.fn(),
            isFieldDirty: jest.fn(),
        })

        renderComponent({})
        expect(
            screen.getByText('At least one email is required.')
        ).toBeInTheDocument()
    })

    it('should render default email signature when signature in form values is null', () => {
        mockedUseConfigurationForm.mockReturnValue({
            formValues: {
                ...initialFormValues,
                monitoredEmailIntegrations: [],
            },
            resetForm: jest.fn(),
            isFormDirty: false,
            updateValue: jest.fn(),
            isFieldDirty: jest.fn(),
        })

        renderComponent({})
        expect(
            screen.getByText('This response was created by AI')
        ).toBeInTheDocument()
    })

    it('should render error email signature caption when signature is empty', () => {
        mockedUseConfigurationForm.mockReturnValue({
            formValues: {
                ...initialFormValues,
                monitoredEmailIntegrations: [],
                signature: '',
            },
            resetForm: jest.fn(),
            isFormDirty: false,
            updateValue: jest.fn(),
            isFieldDirty: jest.fn(),
        })

        renderComponent({})

        const textArea = screen.getByPlaceholderText('AI Agent email signature')
        fireEvent.blur(textArea)

        expect(
            screen.getByText('Email signature is required.')
        ).toBeInTheDocument()
    })

    it('should filter chat channels correctly and populate currentChatChannels', async () => {
        mockFlags({
            [FeatureFlagKey.AiAgentChat]: true,
        })

        renderComponent({})

        const dropdown = screen.getByTestId('chat-dropdown')
        fireEvent.focus(dropdown)

        await waitFor(() => {
            for (const channel of mockChatChannels) {
                expect(screen.getByText(channel.value.name)).toBeInTheDocument()
            }
        })
    })

    it('should trigger monitoredChatIntegrations with correct values on dropdown item click', async () => {
        mockFlags({
            [FeatureFlagKey.AiAgentChat]: true,
        })

        renderComponent({})

        const channelToSelect = mockChatChannels[0]

        const dropdown = screen.getByTestId('chat-dropdown')
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
            formValues: {
                ...initialFormValues,
                monitoredEmailIntegrations: [],
                deactivatedDatetime: '2024-07-30T12:33:02.750Z',
                helpCenterId: 1,
            },
            resetForm: jest.fn(),
            isFormDirty: false,
            updateValue: updateValueMocked,
            isFieldDirty: jest.fn(),
        })

        renderComponent({})

        const dropdown = screen.getByTestId('email-dropdown')
        fireEvent.focus(dropdown)

        const testId = `email-dropdown-item-${MOCK_EMAIL_INTEGRATION.id}`
        const emailCheckbox = screen.getByTestId(testId)
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
            formValues: initialFormValues,
            resetForm: jest.fn(),
            isFormDirty: true,
            updateValue: updateValueMocked,
            isFieldDirty: jest.fn(),
        })

        mockedValidateConfigurationFormValues.mockReturnValue(validFormValues)

        renderComponent({})

        const saveButton = screen.getByText(/Save Changes/i)
        fireEvent.click(saveButton)

        await waitFor(() => {
            expect(mockCreateStoreConfiguration).toHaveBeenCalled()
        })
    })

    it('scrolls to knowledge section if section query param equals knowledge', () => {
        const mockScrollIntoView = jest.fn()
        Element.prototype.scrollIntoView = mockScrollIntoView()

        mockUseSearchParam.mockReturnValue(['knowledge', mockSetSearchParam])

        renderComponent({})

        expect(mockUseSearchParam).toHaveBeenCalledWith('section')
        expect(mockScrollIntoView).toHaveBeenCalled()
        expect(mockSetSearchParam).toHaveBeenCalledWith(null)
    })

    it('scrolls to email section if section query param equals email', () => {
        const mockScrollIntoView = jest.fn()
        Element.prototype.scrollIntoView = mockScrollIntoView()

        mockUseSearchParam.mockReturnValue(['email', mockSetSearchParam])

        renderComponent({})

        expect(mockUseSearchParam).toHaveBeenCalledWith('section')
        expect(mockScrollIntoView).toHaveBeenCalled()
        expect(mockSetSearchParam).toHaveBeenCalledWith(null)
    })
})
