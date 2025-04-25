import { ComponentProps } from 'react'

import { QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AxiosError } from 'axios'
import { fromJS } from 'immutable'
import { mockFlags } from 'jest-launchdarkly-mock'
import { keyBy } from 'lodash'
import moment from 'moment'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import { SentryTeam } from 'common/const/sentryTeamNames'
import { logEvent } from 'common/segment'
import { FeatureFlagKey } from 'config/featureFlags'
import { useCustomFieldDefinitions } from 'custom-fields/hooks/queries/useCustomFieldDefinitions'
import { billingState } from 'fixtures/billing'
import * as useLocalStorageImports from 'hooks/useLocalStorage'
import { useSearchParam } from 'hooks/useSearchParam'
import { AiAgentScope, StoreConfiguration } from 'models/aiAgent/types'
import { HelpCenter } from 'models/helpCenter/types'
import { IntegrationType } from 'models/integration/types'
import { INITIAL_FORM_VALUES, ToneOfVoice } from 'pages/aiAgent/constants'
import { applicationsAutomationSettingsAiAgentEnabledFixture } from 'pages/aiAgent/fixtures/applicationAutomationSettings.fixture'
import { mockChatChannels } from 'pages/aiAgent/fixtures/chatChannels.fixture'
import { useAccountStoreConfiguration } from 'pages/aiAgent/hooks/useAccountStoreConfiguration'
import { useAiAgentEnabled } from 'pages/aiAgent/hooks/useAiAgentEnabled'
import { useAiAgentOnboardingNotification } from 'pages/aiAgent/hooks/useAiAgentOnboardingNotification'
import { useConfigurationForm } from 'pages/aiAgent/hooks/useConfigurationForm'
import { useFileIngestion } from 'pages/aiAgent/hooks/useFileIngestion'
import { useGetOrCreateSnippetHelpCenter } from 'pages/aiAgent/hooks/useGetOrCreateSnippetHelpCenter'
import { usePublicResources } from 'pages/aiAgent/hooks/usePublicResources'
import { useAiAgentFormChangesContext } from 'pages/aiAgent/providers/AiAgentFormChangesContext'
import AiAgentFormChangesProvider from 'pages/aiAgent/providers/AiAgentFormChangesProvider'
import { useAiAgentStoreConfigurationContext } from 'pages/aiAgent/providers/AiAgentStoreConfigurationContext'
import { FormValues } from 'pages/aiAgent/types'
import * as util from 'pages/aiAgent/util'
import useSelfServiceChatChannels from 'pages/automate/common/hooks/useSelfServiceChatChannels'
import history from 'pages/history'
import { ContactFormFixture } from 'pages/settings/contactForm/fixtures/contacForm'
import { getSingleHelpCenterResponseFixture } from 'pages/settings/helpCenter/fixtures/getHelpCentersResponse.fixture'
import { getHasAutomate } from 'state/billing/selectors'
import { initialState as articlesState } from 'state/entities/helpCenter/articles'
import { initialState as categoriesState } from 'state/entities/helpCenter/categories'
import { mockQueryClient } from 'tests/reactQueryTestingUtils'
import { reportError } from 'utils/errors'
import { renderWithRouter } from 'utils/testing'

import { StoreConfigForm } from '../StoreConfigForm'

const queryClient = mockQueryClient()

jest.mock('utils/errors')
// eslint-disable-next-line @typescript-eslint/no-unsafe-return
jest.mock('common/segment', () => ({
    ...jest.requireActual('common/segment'),
    logEvent: jest.fn(),
}))
const mockLogEvent = jest.mocked(logEvent)

jest.mock('state/notifications/actions')
jest.mock('pages/aiAgent/providers/AiAgentStoreConfigurationContext', () => ({
    useAiAgentStoreConfigurationContext: jest.fn(),
}))
jest.mock('pages/aiAgent/providers/AiAgentFormChangesContext', () => ({
    ...jest.requireActual('pages/aiAgent/providers/AiAgentFormChangesContext'),
    useAiAgentFormChangesContext: jest.fn(),
}))
jest.mock('pages/aiAgent/hooks/useAccountStoreConfiguration')
jest.mock('pages/aiAgent/hooks/useGetOrCreateSnippetHelpCenter', () => ({
    useGetOrCreateSnippetHelpCenter: jest.fn(),
}))
jest.mock('pages/aiAgent/hooks/useConfigurationForm')
jest.mock('pages/aiAgent/hooks/usePublicResources', () => ({
    usePublicResources: jest.fn(),
}))
jest.mock('../../PublicSourcesSection/PublicSourcesSection', () => ({
    PublicSourcesSection: jest.fn(() => <p>Public Source Section</p>),
}))

// This mocked component is a child of one of the components rendered in the StoreConfigForm (ChatConfigurationFormComponent).
// By implementing this mock, we're isolating the StoreConfigForm for more focused testing, avoiding not relevant rendering and mocking of components and dependencies that are tested elsewhere.
jest.mock(
    '../../HandoverCustomization/HandoverCustomizationChatSettingsComponent',
    () => ({
        HandoverCustomizationChatSettingsComponent: () => (
            <div data-testid="mocked-handover-settings">
                Mocked Handover Settings
            </div>
        ),
    }),
)

// mocking the prompt modal
jest.mock('../FormComponents/StoreConfigUnsavedChangesPrompt', () => ({
    StoreConfigUnsavedChangesPrompt: () => (
        <div data-testid="mocked-unsaved-changes-prompt"></div>
    ),
}))

jest.mock('pages/aiAgent/hooks/useAiAgentOnboardingNotification', () => ({
    useAiAgentOnboardingNotification: jest.fn(),
}))
jest.mock('state/billing/selectors', () => ({
    __esModule: true,
    getHasAutomate: jest.fn(),
}))
jest.mock('pages/automate/common/hooks/useSelfServiceChatChannels')

jest.mock('pages/aiAgent/providers/AiAgentStoreConfigurationContext')

jest.mock('hooks/useSearchParam', () => ({
    useSearchParam: jest.fn(),
}))
jest.mock('pages/aiAgent/hooks/useAiAgentEnabled')

const mockUseSearchParam = jest.mocked(useSearchParam)
const mockSetSearchParam = jest.fn()

const spyIsAiAgentEnabled = jest.spyOn(util, 'isAiAgentEnabled')

const mockedUseAiAgentStoreConfigurationContext = jest.mocked(
    useAiAgentStoreConfigurationContext,
)

const mockedUseAiAgentFormChangesContext = jest.mocked(
    useAiAgentFormChangesContext,
)

const mockedUseAccountStoreConfiguration = jest.mocked(
    useAccountStoreConfiguration,
)

const mockedUseGetOrCreateSnippetHelpCenter = jest.mocked(
    useGetOrCreateSnippetHelpCenter,
)
const mockedUseSelfServiceChatChannels = jest.mocked(useSelfServiceChatChannels)
const mockedUseConfigurationForm = jest.mocked(useConfigurationForm)
const mockedUsePublicResources = jest.mocked(usePublicResources)
const mockGetHasAutomate = jest.mocked(getHasAutomate)
const mockUseEnableAiAgent = jest.mocked(useAiAgentEnabled)
const mockUseAiAgentOnboardingNotification = jest.mocked(
    useAiAgentOnboardingNotification,
)

mockedUsePublicResources.mockReturnValue({
    sourceItems: [],
    isSourceItemsListLoading: false,
} as unknown as ReturnType<typeof usePublicResources>)

const mockDispatch = jest.fn()
jest.mock('hooks/useAppDispatch', () => () => mockDispatch)

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
                        order_management: { enabled: false },
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
    .mockImplementation((props: { onSuccess: () => void }) => {
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
    'default',
) as jest.Mock

const findToggle = (type: 'email' | 'chat') =>
    screen
        .queryAllByLabelText('Enable AI Agent')
        .find(
            (toggle) =>
                toggle.getAttribute('name') === `toggle-ai-agent-${type}`,
        )

const renderComponent = (
    props?: Partial<ComponentProps<typeof StoreConfigForm>>,
) =>
    renderWithRouter(
        <Provider store={mockedStore}>
            <QueryClientProvider client={queryClient}>
                <AiAgentFormChangesProvider>
                    <StoreConfigForm
                        shopName="test-shop"
                        accountDomain="test-domain"
                        shopType="shopify"
                        faqHelpCenters={
                            [
                                { id: 1, name: 'help center 1', type: 'faq' },
                                { id: 2, name: 'help center 2', type: 'faq' },
                            ] as unknown as HelpCenter[]
                        }
                        {...props}
                    />
                </AiAgentFormChangesProvider>
            </QueryClientProvider>
        </Provider>,
    )

const getDrawer = () => screen.getByRole('dialog')

jest.mock('pages/aiAgent/hooks/useFileIngestion', () => ({
    useFileIngestion: jest.fn(),
}))

const mockedUseFileIngestion = jest.mocked(useFileIngestion)

jest.mock('custom-fields/hooks/queries/useCustomFieldDefinitions', () => ({
    useCustomFieldDefinitions: jest.fn(),
}))

const mockedUseCustomFieldDefinitions = jest.mocked(useCustomFieldDefinitions)

describe('<StoreConfigForm />', () => {
    const storeConfiguration: StoreConfiguration = {
        shopType: 'shopify',
        chatChannelDeactivatedDatetime: null,
        emailChannelDeactivatedDatetime: null,
        trialModeActivatedDatetime: '2024-07-30T12:33:02.750Z',
        previewModeActivatedDatetime: '2024-07-30T12:33:02.750Z',
        previewModeValidUntilDatetime: '2024-08-06T12:33:02.750Z',
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
        floatingChatInputConfigurationId: null,
        scopes: [AiAgentScope.Support],
        createdDatetime: moment().toISOString(),
        salesDiscountMax: null,
        salesDiscountStrategyLevel: null,
        salesPersuasionLevel: null,
        isConversationStartersEnabled: false,
        customFieldIds: [],
    }

    const initialFormValues: FormValues = {
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
        monitoredEmailIntegrations: [{ id: 1, email: MOCK_EMAIL_ADDRESS }],
        wizard: undefined,
        customFieldIds: [],
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

    const defaultUseAiAgentOnboardingNotification = {
        isAdmin: true,
        onboardingNotificationState: undefined,
        handleOnSave: jest.fn(),
        handleOnSendOrCancelNotification: jest.fn(),
        handleOnEnablementPostReceivedNotification: jest.fn(),
        handleOnPerformActionPostReceivedNotification: jest.fn(),
        handleOnTriggerActivateAiAgentNotification: jest.fn(),
        handleOnCancelActivateAiAgentNotification: jest.fn(),
        isLoading: false,
        isAiAgentOnboardingNotificationEnabled: true,
    }

    beforeEach(() => {
        updateValueMocked.mockReset()
        mockLogEvent.mockClear()
        mockedUseAiAgentStoreConfigurationContext.mockReset()
        mockedUseAiAgentFormChangesContext.mockReset()
        mockedUseSelfServiceChatChannels.mockReturnValue(mockChatChannels)
        mockGetHasAutomate.mockReturnValue(true)
        mockedUseAiAgentStoreConfigurationContext.mockReturnValue({
            storeConfiguration,
            isLoading: false,
            updateStoreConfiguration: mockUpdateStoreConfiguration,
            createStoreConfiguration: mockCreateStoreConfiguration,
            isPendingCreateOrUpdate: false,
        })
        mockedUseAiAgentFormChangesContext.mockReturnValue({
            isFormDirty: false,
            setIsFormDirty: jest.fn(),
            setActionCallback: jest.fn(),
            dirtySections: [],
            onModalSave: jest.fn(),
            onModalDiscard: jest.fn(),
            promptTriggerRef: null,
            onLeaveContext: jest.fn(),
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
            aiAgentPreviewTicketViewId: 2,
        })
        mockUseAiAgentOnboardingNotification.mockReturnValue(
            defaultUseAiAgentOnboardingNotification,
        )
        mockedUsePublicResources.mockReturnValue({
            sourceItems: [],
            isSourceItemsListLoading: false,
        })
        mockedUseFileIngestion.mockReturnValue({
            ingestedFiles: [],
            isLoading: false,
            isIngesting: false,
            ingestFile: jest.fn(),
            deleteIngestedFile: jest.fn(),
        })

        useLocalStorageSpy.mockReturnValue([[], jest.fn()])
        mockedUseCustomFieldDefinitions.mockReturnValue({
            data: {
                data: [
                    {
                        id: 123,
                        name: 'Test Field',
                        label: 'Test Field',
                        type: 'text',
                        required: false,
                        description: 'Test Description',
                        managed_type: null,
                        requirement_type: 'visible',
                    },
                ],
            },
        } as any)
    })

    afterAll(() => {
        spyIsAiAgentEnabled.mockRestore()
    })

    it('should render the component', () => {
        renderComponent()

        expect(screen.getByText('General')).toBeInTheDocument()
    })

    it('should render new email integration caption', () => {
        renderComponent()
        expect(
            screen.getByText(
                'AI Agent will also respond to any contact forms linked to these email addresses.',
            ),
        ).toBeInTheDocument()
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
                    tags: { team: SentryTeam.AI_AGENT },
                    extra: {
                        context: 'Error during disabling AI Agent',
                    },
                })
            })
        } catch {}
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
                screen.getByText('Select one or more chat integrations'),
            ).toBeInTheDocument()
        })

        it('should not display dropdown if feature flag is false', async () => {
            mockFlags({
                [FeatureFlagKey.AiAgentChat]: false,
            })
            renderComponent()

            await waitFor(() => {
                expect(
                    screen.queryByText('Select one or more chat integrations'),
                ).not.toBeInTheDocument()
            })
        })

        it('should filter chat channels correctly and populate currentChatChannels', async () => {
            renderComponent()

            const dropdown = screen.getByText(
                'Select one or more chat integrations',
            )
            fireEvent.focus(dropdown)

            await waitFor(() => {
                for (const channel of mockChatChannels) {
                    expect(
                        screen.getByText(channel.value.name),
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
                expect(screen.getByText(chatIntegration.value.name)),
            )
        })

        it('chat toggle should be disabled if user does not have automate', () => {
            mockFlags({
                [FeatureFlagKey.AiAgentChat]: true,
            })
            mockGetHasAutomate.mockReturnValue(false)
            renderComponent()

            const chatToggle = findToggle('chat')

            expect(chatToggle).toBeDisabled()
        })
    })

    it('email toggle should be disabled if user does not have automate', () => {
        mockGetHasAutomate.mockReturnValue(false)
        renderComponent()

        const emailToggle = findToggle('email')
        expect(emailToggle).toBeDisabled()
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
            screen.getByText('One or more addresses required.'),
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
            screen.getAllByText('This response was created by AI').length,
        ).toBeGreaterThan(0)
    })

    it('should not render error when email channel is disabled', () => {
        mockedUseConfigurationForm.mockReturnValue({
            ...defaultUseConfigurationFormValues,
            formValues: {
                ...initialFormValues,
                emailChannelDeactivatedDatetime: '2024-07-30T12:33:02.750Z',
                signature: '',
            },
        })

        renderComponent()

        expect(
            screen.queryByText('Email signature is required.'),
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
            screen.getByText('Email signature is required.'),
        ).toBeInTheDocument()
    })

    it('should trigger monitoredChatIntegrations with correct values on dropdown item click', async () => {
        mockFlags({
            [FeatureFlagKey.AiAgentChat]: true,
        })

        renderComponent()

        const channelToSelect = mockChatChannels[0]

        const dropdown = screen.getByText(
            'Select one or more chat integrations',
        )
        fireEvent.focus(dropdown)

        const channelCheckbox = screen.getByText(/25 Shopify Chat/)
        fireEvent.click(channelCheckbox)

        await waitFor(() => {
            expect(updateValueMocked).toHaveBeenCalledWith(
                'monitoredChatIntegrations',
                [channelToSelect.value?.id],
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
                emailChannelDeactivatedDatetime: '2024-07-30T12:33:02.750Z',
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
                emailChannelDeactivatedDatetime: '2024-07-30T12:33:02.750Z',
                helpCenterId: 1,
            },
        })

        renderComponent()

        const dropdown = screen.getByText('Select one or more email addresses')
        fireEvent.focus(dropdown)
        const emailCheckbox = screen.getByText(
            MOCK_EMAIL_INTEGRATION.meta.address,
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
                ],
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
        mockedUseConfigurationForm.mockReturnValue({
            ...defaultUseConfigurationFormValues,
            formValues: {
                ...initialFormValues,
                chatChannelDeactivatedDatetime: '2024-07-30T12:33:02.750Z',
                emailChannelDeactivatedDatetime: '2024-07-30T12:33:02.750Z',
                trialModeActivatedDatetime: null,
                previewModeActivatedDatetime: null,
            },
        })

        renderComponent({})

        // Simulate the user selecting 'enabled' mode
        const radioButton = screen.getByLabelText(
            'Directly respond to customers',
        )
        userEvent.click(radioButton)

        // Check that updateValue was called with the correct arguments
        // emailChannelDeactivatedDatetime + chatChannelDeactivatedDatetime + trialModeActivatedDatetime + previewModeActivatedDatetime
        expect(updateValueMocked).toHaveBeenCalledTimes(4)
        expect(updateValueMocked).toHaveBeenCalledWith(
            'emailChannelDeactivatedDatetime',
            null,
        )
        expect(updateValueMocked).toHaveBeenCalledWith(
            'trialModeActivatedDatetime',
            null,
        )
        expect(updateValueMocked).toHaveBeenCalledWith(
            'previewModeActivatedDatetime',
            null,
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
            'Draft responses for agents to review before sending',
        )
        userEvent.click(radioButton)

        // Check that updateValue was called with the correct arguments
        // emailChannelDeactivatedDatetime + chatChannelDeactivatedDatetime + trialModeActivatedDatetime + previewModeActivatedDatetime
        expect(updateValueMocked).toHaveBeenCalledTimes(4)
        expect(updateValueMocked).toHaveBeenCalledWith(
            'emailChannelDeactivatedDatetime',
            expect.any(String),
        )
        expect(updateValueMocked).toHaveBeenCalledWith(
            'trialModeActivatedDatetime',
            expect.any(String),
        )
        expect(updateValueMocked).toHaveBeenCalledWith(
            'previewModeActivatedDatetime',
            expect.any(String),
        )
    })

    it('should handle disabled mode correctly', () => {
        mockFlags({
            [FeatureFlagKey.AiAgentTrialMode]: true,
            [FeatureFlagKey.AiAgentChat]: false,
        })
        renderComponent({})

        // Simulate the user selecting 'disabled' mode
        const radioButton = screen.getByLabelText('Disabled')
        userEvent.click(radioButton)

        // Check that updateValue was called with the correct arguments
        // emailChannelDeactivatedDatetime + chatChannelDeactivatedDatetime + trialModeActivatedDatetime + previewModeActivatedDatetime
        expect(updateValueMocked).toHaveBeenCalledTimes(4)
        expect(updateValueMocked).toHaveBeenCalledWith(
            'emailChannelDeactivatedDatetime',
            expect.any(String),
        )
        expect(updateValueMocked).toHaveBeenCalledWith(
            'trialModeActivatedDatetime',
            null,
        )
        expect(updateValueMocked).toHaveBeenCalledWith(
            'previewModeActivatedDatetime',
            null,
        )
    })

    it('should deactivate email channel', () => {
        mockedUseConfigurationForm.mockReturnValue({
            ...defaultUseConfigurationFormValues,
            formValues: {
                ...initialFormValues,
                chatChannelDeactivatedDatetime: null,
            },
        })

        renderComponent()
        const emailChannelCheckbox = findToggle('email')!
        fireEvent.click(emailChannelCheckbox)

        expect(updateValueMocked).toHaveBeenCalledWith(
            'emailChannelDeactivatedDatetime',
            expect.any(String),
        )
    })

    it('should deactivate chat channel', () => {
        mockFlags({
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
        const chatChannelCheckbox = findToggle('chat')!
        fireEvent.click(chatChannelCheckbox)
        expect(updateValueMocked).toHaveBeenCalledWith(
            'chatChannelDeactivatedDatetime',
            expect.any(String),
        )
    })

    it('should activate chat channel', () => {
        mockFlags({
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
        const chatChannelCheckbox = findToggle('chat')!
        fireEvent.click(chatChannelCheckbox)

        expect(updateValueMocked).toHaveBeenCalledTimes(1)
        expect(updateValueMocked).toHaveBeenLastCalledWith(
            'chatChannelDeactivatedDatetime',
            null,
        )
    })

    it('set ai agent enabled toggles correctly if default form values are set', async () => {
        mockedUseAccountStoreConfiguration.mockReturnValue({
            accountConfiguration: undefined,
            aiAgentTicketViewId: 1,
            aiAgentPreviewTicketViewId: 2,
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
                emailChannelDeactivatedDatetime: undefined,
                chatChannelDeactivatedDatetime: undefined,
            },
        })

        renderComponent()

        await waitFor(() => {
            expect(spyIsAiAgentEnabled).toHaveBeenCalledWith(
                INITIAL_FORM_VALUES.emailChannelDeactivatedDatetime,
            )
            expect(spyIsAiAgentEnabled).toHaveBeenCalledWith(
                INITIAL_FORM_VALUES.chatChannelDeactivatedDatetime,
            )
        })
    })

    it('should trigger cancelation call on activate AI agent notification when AI agent email is activated', () => {
        mockedUseAiAgentStoreConfigurationContext.mockReturnValue({
            storeConfiguration: {
                ...storeConfiguration,
                emailChannelDeactivatedDatetime: '2024-07-30T12:33:02.750Z',
            },
            isLoading: false,
            updateStoreConfiguration: mockUpdateStoreConfiguration,
            createStoreConfiguration: jest
                .fn()
                .mockRejectedValue(new Error('Test error')),
            isPendingCreateOrUpdate: false,
        })

        mockedUseConfigurationForm.mockReturnValue({
            ...defaultUseConfigurationFormValues,
            formValues: {
                ...initialFormValues,
                trialModeActivatedDatetime: null,
                previewModeActivatedDatetime: null,
                emailChannelDeactivatedDatetime: null,
            },
        })

        renderComponent()
        const saveChangesButton = screen.getByText('Save Changes')
        fireEvent.click(saveChangesButton)

        renderComponent()

        expect(
            defaultUseAiAgentOnboardingNotification.handleOnCancelActivateAiAgentNotification,
        ).toHaveBeenCalled()
    })

    it('should trigger cancelation call on activate AI agent notification when AI agent chat is activated', () => {
        mockedUseAiAgentStoreConfigurationContext.mockReturnValue({
            storeConfiguration: {
                ...storeConfiguration,
                chatChannelDeactivatedDatetime: '2024-07-30T12:33:02.750Z',
            },
            isLoading: false,
            updateStoreConfiguration: mockUpdateStoreConfiguration,
            createStoreConfiguration: jest
                .fn()
                .mockRejectedValue(new Error('Test error')),
            isPendingCreateOrUpdate: false,
        })

        mockedUseConfigurationForm.mockReturnValue({
            ...defaultUseConfigurationFormValues,
            formValues: {
                ...initialFormValues,
                trialModeActivatedDatetime: null,
                previewModeActivatedDatetime: null,
                chatChannelDeactivatedDatetime: null,
            },
        })

        renderComponent()
        const saveChangesButton = screen.getByText('Save Changes')
        fireEvent.click(saveChangesButton)

        renderComponent()

        expect(
            defaultUseAiAgentOnboardingNotification.handleOnCancelActivateAiAgentNotification,
        ).toHaveBeenCalled()
    })

    describe('AI Agent ticket view modal', () => {
        it('should not modal if AI Agent is enabled', async () => {
            mockedUseAccountStoreConfiguration.mockReturnValue({
                accountConfiguration: undefined,
                aiAgentTicketViewId: 1,
                aiAgentPreviewTicketViewId: 2,
            })

            mockedUseAiAgentStoreConfigurationContext.mockReturnValue({
                storeConfiguration: {
                    ...storeConfiguration,
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
                aiAgentPreviewTicketViewId: 2,
            })

            mockedUseAiAgentStoreConfigurationContext.mockReturnValue({
                storeConfiguration: {
                    ...storeConfiguration,
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

        it('should not display modal if the shop has already viewed the modal and persisted in the local storage', async () => {
            useLocalStorageSpy.mockReturnValue([['test-shop'], null])
            mockedUseAccountStoreConfiguration.mockReturnValue({
                accountConfiguration: undefined,
                aiAgentTicketViewId: 1,
                aiAgentPreviewTicketViewId: 2,
            })

            mockedUseAiAgentStoreConfigurationContext.mockReturnValue({
                storeConfiguration: {
                    ...storeConfiguration,
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
                aiAgentPreviewTicketViewId: 2,
            })

            mockedUseAiAgentStoreConfigurationContext.mockReturnValue({
                storeConfiguration: {
                    ...storeConfiguration,
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
                screen.getByLabelText(/Select one or more Chats/i),
            ).toBeInvalid()

            expect(
                screen.getByLabelText(/Select one or more emails/i),
            ).toBeInvalid()
        })

        it('should not show model when trial mode is enabled', async () => {
            mockFlags({
                [FeatureFlagKey.AiAgentTrialMode]: false,
            })
            mockedUseAccountStoreConfiguration.mockReturnValue({
                accountConfiguration: undefined,
                aiAgentTicketViewId: 1,
                aiAgentPreviewTicketViewId: 2,
            })

            mockedUseAiAgentStoreConfigurationContext.mockReturnValue({
                storeConfiguration: {
                    ...storeConfiguration,
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
                aiAgentPreviewTicketViewId: 2,
            })

            mockedUseAiAgentStoreConfigurationContext.mockReturnValue({
                storeConfiguration: {
                    ...storeConfiguration,
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

        it('should display banner if AI Agent on Preview mode', () => {
            mockFlags({
                [FeatureFlagKey.FollowUpAiAgentPreviewMode]: true,
            })
            mockedUseAiAgentStoreConfigurationContext.mockReturnValue({
                storeConfiguration: {
                    ...storeConfiguration,
                    chatChannelDeactivatedDatetime: '2024-07-30T12:33:02.750Z',
                    emailChannelDeactivatedDatetime: '2024-07-30T12:33:02.750Z',
                    trialModeActivatedDatetime: '2024-07-30T12:33:02.750Z',
                    previewModeActivatedDatetime: '2024-07-30T12:33:02.750Z',
                    previewModeValidUntilDatetime: '2024-07-30T12:33:02.750Z',
                    isPreviewModeActive: true,
                },
                isLoading: false,
                updateStoreConfiguration: mockUpdateStoreConfiguration,
                createStoreConfiguration: mockCreateStoreConfiguration,
                isPendingCreateOrUpdate: false,
            })

            renderComponent({})

            expect(
                screen.getByText('You’re currently using AI Agent Preview.'),
            ).toBeInTheDocument()
            expect(screen.getByText('Review Drafts')).toBeInTheDocument()
        })

        it('should display banner if AI Agent on Preview mode with new method', () => {
            mockFlags({
                [FeatureFlagKey.FollowUpAiAgentPreviewMode]: true,
            })
            mockedUseAiAgentStoreConfigurationContext.mockReturnValue({
                storeConfiguration: {
                    ...storeConfiguration,
                    trialModeActivatedDatetime: null,
                    chatChannelDeactivatedDatetime: '2024-07-30T12:33:02.750Z',
                    emailChannelDeactivatedDatetime: '2024-07-30T12:33:02.750Z',
                    previewModeValidUntilDatetime: '2024-07-30T12:33:02.750Z',
                    previewModeActivatedDatetime: '2024-07-30T12:33:02.750Z',
                    isPreviewModeActive: true,
                },
                isLoading: false,
                updateStoreConfiguration: mockUpdateStoreConfiguration,
                createStoreConfiguration: mockCreateStoreConfiguration,
                isPendingCreateOrUpdate: false,
            })

            renderComponent({})

            expect(
                screen.getByText('You’re currently using AI Agent Preview.'),
            ).toBeInTheDocument()
            expect(screen.getByText('Review Drafts')).toBeInTheDocument()
        })

        it('should redirect to AI Agent Preview ticket views if button on Preview banner is clicked', () => {
            mockFlags({
                [FeatureFlagKey.FollowUpAiAgentPreviewMode]: true,
            })
            mockedUseAccountStoreConfiguration.mockReturnValue({
                accountConfiguration: undefined,
                aiAgentTicketViewId: null,
                aiAgentPreviewTicketViewId: 2,
            })
            mockedUseAiAgentStoreConfigurationContext.mockReturnValue({
                storeConfiguration: {
                    ...storeConfiguration,
                    chatChannelDeactivatedDatetime: '2024-07-30T12:33:02.750Z',
                    emailChannelDeactivatedDatetime: '2024-07-30T12:33:02.750Z',
                    trialModeActivatedDatetime: '2024-07-30T12:33:02.750Z',
                    previewModeActivatedDatetime: '2024-07-30T12:33:02.750Z',
                    isPreviewModeActive: true,
                },
                isLoading: false,
                updateStoreConfiguration: mockUpdateStoreConfiguration,
                createStoreConfiguration: mockCreateStoreConfiguration,
                isPendingCreateOrUpdate: false,
            })

            renderComponent({})

            expect(
                screen.getByText('You’re currently using AI Agent Preview.'),
            ).toBeInTheDocument()

            const reviewDraftsButton = screen.getByText('Review Drafts')
            expect(reviewDraftsButton).toBeInTheDocument()
            fireEvent.click(reviewDraftsButton)

            expect(history.push).toHaveBeenCalledWith('/app/views/2')
        })

        it('should not show Review Drafts button if Preview ticket views id is null', () => {
            mockFlags({
                [FeatureFlagKey.FollowUpAiAgentPreviewMode]: true,
            })
            mockedUseAccountStoreConfiguration.mockReturnValue({
                accountConfiguration: undefined,
                aiAgentTicketViewId: null,
                aiAgentPreviewTicketViewId: null,
            })
            mockedUseAiAgentStoreConfigurationContext.mockReturnValue({
                storeConfiguration: {
                    ...storeConfiguration,
                    chatChannelDeactivatedDatetime: '2024-07-30T12:33:02.750Z',
                    emailChannelDeactivatedDatetime: '2024-07-30T12:33:02.750Z',
                    trialModeActivatedDatetime: '2024-07-30T12:33:02.750Z',
                    previewModeActivatedDatetime: '2024-07-30T12:33:02.750Z',
                },
                isLoading: false,
                updateStoreConfiguration: mockUpdateStoreConfiguration,
                createStoreConfiguration: mockCreateStoreConfiguration,
                isPendingCreateOrUpdate: false,
            })

            renderComponent({})

            const reviewDraftsButton = screen.queryByText('Review Drafts')
            expect(reviewDraftsButton).not.toBeInTheDocument()
        })

        it('should update form values when changing tags', async () => {
            const mockOnSubmit = jest.fn()
            mockedUseConfigurationForm.mockReturnValue({
                ...defaultUseConfigurationFormValues,
                handleOnSave: mockOnSubmit,
            })

            renderComponent()

            // Add tags
            await userEvent.click(
                screen.getByRole('button', { name: 'Add Tag' }),
            )

            // Save changes
            const saveButton = screen.getByRole('button', {
                name: /save changes/i,
            })
            await userEvent.click(saveButton)

            expect(mockOnSubmit).toHaveBeenCalled()
        })

        it('should update form values when changing tags', async () => {
            mockFlags({
                [FeatureFlagKey.AiAgentUsesStoreConfigurationCustomFields]:
                    true,
            })

            const mockOnSubmit = jest.fn()
            mockedUseConfigurationForm.mockReturnValue({
                ...defaultUseConfigurationFormValues,
                handleOnSave: mockOnSubmit,
            })

            renderComponent()

            // Add tags
            await userEvent.click(
                screen.getByRole('button', { name: 'Add Tag' }),
            )

            // Save changes
            const saveButton = screen.getByRole('button', {
                name: /save changes/i,
            })
            await userEvent.click(saveButton)

            expect(mockOnSubmit).toHaveBeenCalled()
        })

        describe('AI Autofill section', () => {
            it('should display the legacy section for tags and hide the new section if the FF is deactivated', () => {
                mockFlags({
                    [FeatureFlagKey.AiAgentUsesStoreConfigurationCustomFields]:
                        false,
                })

                const { container } = renderComponent()
                const legacyH2 = within(container).queryByRole('heading', {
                    level: 2,
                    name: /AI ticket tagging/i, // case-insensitive
                })
                const newH2 = within(container).queryByRole('heading', {
                    level: 2,
                    name: /AI Autofill: Tags & Ticket Fields/i, // case-insensitive
                })
                const customFieldsFormComponent = within(
                    container,
                ).queryByTestId(
                    'ai-agent-store-configuration-custom-fields-form-component',
                )
                expect(customFieldsFormComponent).not.toBeInTheDocument()
                expect(legacyH2).toBeInTheDocument()
                expect(newH2).not.toBeInTheDocument()
            })
            it('should display the new section for AI Autofill and hide the legacy section if the FF is activated', () => {
                mockFlags({
                    [FeatureFlagKey.AiAgentUsesStoreConfigurationCustomFields]:
                        true,
                })

                const { container } = renderComponent()
                const legacyH2 = within(container).queryByRole('heading', {
                    level: 2,
                    name: /AI ticket tagging/i, // case-insensitive
                })
                const newH2 = within(container).queryByRole('heading', {
                    level: 2,
                    name: /AI Autofill: Tags & Ticket Fields/i, // case-insensitive
                })
                const customFieldsFormComponent = within(
                    container,
                ).queryByTestId(
                    'ai-agent-store-configuration-custom-fields-form-component',
                )
                expect(customFieldsFormComponent).not.toBeInTheDocument()
                expect(legacyH2).not.toBeInTheDocument()
                expect(newH2).toBeInTheDocument()
            })
        })
    })

    describe('Preview Mode', () => {
        it('should display banner if AI Agent on Preview mode', () => {
            mockFlags({
                [FeatureFlagKey.FollowUpAiAgentPreviewMode]: true,
            })
            mockedUseAiAgentStoreConfigurationContext.mockReturnValue({
                storeConfiguration: {
                    ...storeConfiguration,
                    chatChannelDeactivatedDatetime: '2024-07-30T12:33:02.750Z',
                    emailChannelDeactivatedDatetime: '2024-07-30T12:33:02.750Z',
                    trialModeActivatedDatetime: '2024-07-30T12:33:02.750Z',
                    previewModeActivatedDatetime: '2024-07-30T12:33:02.750Z',
                    previewModeValidUntilDatetime: '2024-07-30T12:33:02.750Z',
                    isPreviewModeActive: true,
                },
                isLoading: false,
                updateStoreConfiguration: mockUpdateStoreConfiguration,
                createStoreConfiguration: mockCreateStoreConfiguration,
                isPendingCreateOrUpdate: false,
            })

            renderComponent({})

            expect(
                screen.getByText('You’re currently using AI Agent Preview.'),
            ).toBeInTheDocument()
            expect(screen.getByText('Review Drafts')).toBeInTheDocument()
        })

        it('should not show Review Drafts button if Preview ticket views id is null', () => {
            mockFlags({
                [FeatureFlagKey.FollowUpAiAgentPreviewMode]: true,
            })
            mockedUseAccountStoreConfiguration.mockReturnValue({
                accountConfiguration: undefined,
                aiAgentTicketViewId: null,
                aiAgentPreviewTicketViewId: null,
            })
            mockedUseAiAgentStoreConfigurationContext.mockReturnValue({
                storeConfiguration: {
                    ...storeConfiguration,
                    chatChannelDeactivatedDatetime: '2024-07-30T12:33:02.750Z',
                    emailChannelDeactivatedDatetime: '2024-07-30T12:33:02.750Z',
                    trialModeActivatedDatetime: '2024-07-30T12:33:02.750Z',
                    previewModeActivatedDatetime: '2024-07-30T12:33:02.750Z',
                },
                isLoading: false,
                updateStoreConfiguration: mockUpdateStoreConfiguration,
                createStoreConfiguration: mockCreateStoreConfiguration,
                isPendingCreateOrUpdate: false,
            })

            renderComponent({})

            const reviewDraftsButton = screen.queryByText('Review Drafts')
            expect(reviewDraftsButton).not.toBeInTheDocument()
        })
    })

    describe('Ai Agent Settings Revamp', () => {
        it('should display drawer when AiAgentSettingsRevamp is enabled', async () => {
            mockFlags({
                [FeatureFlagKey.AiAgentSettingsRevamp]: true,
            })

            renderComponent()

            // Click on the Tags row to open the drawer
            await userEvent.click(screen.getAllByText('Tags')[0])

            expect(getDrawer()).toBeVisible()
            expect(getDrawer()).toBeInTheDocument()
            expect(
                within(getDrawer()).getByText('Save Changes'),
            ).toBeInTheDocument()
            expect(within(getDrawer()).getByText('Cancel')).toBeInTheDocument()
        })

        it('should not display drawer when AiAgentSettingsRevamp is disabled', async () => {
            mockFlags({
                [FeatureFlagKey.AiAgentSettingsRevamp]: false,
            })

            renderComponent()

            expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
        })

        it('should update form values when saving drawer content', async () => {
            mockFlags({
                [FeatureFlagKey.AiAgentSettingsRevamp]: true,
            })

            const mockOnSubmit = jest.fn()
            mockedUseConfigurationForm.mockReturnValue({
                ...defaultUseConfigurationFormValues,
                handleOnSave: mockOnSubmit,
            })

            renderComponent()

            // Open the drawer by clicking on Tags
            await userEvent.click(screen.getAllByText('Tags')[0])

            // Save changes
            const saveButton = within(getDrawer()).getByRole('button', {
                name: /save changes/i,
            })
            await userEvent.click(saveButton)

            expect(mockOnSubmit).toHaveBeenCalled()
        })

        it('should update form values when saving drawer content with new tags', async () => {
            mockFlags({
                [FeatureFlagKey.AiAgentSettingsRevamp]: true,
            })

            renderComponent()

            // Open the drawer by clicking on Tags
            await userEvent.click(screen.getAllByText('Tags')[0])

            await userEvent.click(
                screen.getByRole('button', { name: /add tag/i }),
            )
            await userEvent.click(screen.getByText(/choose tag/i))
            await userEvent.type(screen.getAllByRole('textbox')[1], 'Test')

            // Save changes
            const saveButton = within(getDrawer()).getByRole('button', {
                name: /save changes/i,
            })
            await userEvent.click(saveButton)

            expect(updateValueMocked).toHaveBeenCalledWith('tags', [
                {
                    name: '',
                    description: 'Test',
                },
            ])
        })

        it('should update form values when saving drawer content with new ticket fields', async () => {
            mockFlags({
                [FeatureFlagKey.AiAgentSettingsRevamp]: true,
            })

            renderComponent()

            // Open the drawer by clicking on Ticket Fields
            await userEvent.click(screen.getAllByText('Ticket Fields')[0])
            await userEvent.click(
                screen.getByRole('button', { name: /add ticket field/i }),
            )
            await userEvent.click(screen.getByText(/test field/i))

            // Save changes
            const saveButton = within(getDrawer()).getByRole('button', {
                name: /save changes/i,
            })
            await userEvent.click(saveButton)

            expect(updateValueMocked).toHaveBeenCalledWith('customFieldIds', [
                123,
            ])
        })

        it('should update form values when saving drawer content with new handover topics', async () => {
            mockFlags({
                [FeatureFlagKey.AiAgentSettingsRevamp]: true,
            })

            renderComponent()

            // Open the drawer by clicking on Handover Topics
            await userEvent.click(screen.getByText('Handover topics'))
            await userEvent.click(
                screen.getByRole('button', { name: /add topic/i }),
            )
            await userEvent.type(screen.getAllByRole('textbox')[1], 'Test')

            // Save changes
            const saveButton = within(getDrawer()).getByRole('button', {
                name: /save changes/i,
            })
            await userEvent.click(saveButton)

            expect(updateValueMocked).toHaveBeenCalledWith('excludedTopics', [
                'Test',
            ])
        })

        it('should not update form values when closing drawer', async () => {
            mockFlags({
                [FeatureFlagKey.AiAgentSettingsRevamp]: true,
            })

            const mockOnSubmit = jest.fn()
            mockedUseConfigurationForm.mockReturnValue({
                ...defaultUseConfigurationFormValues,
                handleOnSave: mockOnSubmit,
            })

            renderComponent()

            // Open the drawer by clicking on Tags
            await userEvent.click(screen.getAllByText('Tags')[0])

            // Add tags
            await userEvent.click(
                screen.getByRole('button', { name: 'Add Tag' }),
            )

            // Cancel changes
            const cancelButton = screen.getByRole('button', { name: /cancel/i })
            await userEvent.click(cancelButton)

            expect(mockOnSubmit).not.toHaveBeenCalled()
        })

        it('should switch drawer content when clicking on different features', async () => {
            mockFlags({
                [FeatureFlagKey.AiAgentSettingsRevamp]: true,
            })

            renderComponent()

            // Open Tags drawer
            await userEvent.click(screen.getAllByText('Tags')[0])
            expect(within(getDrawer()).getByText('Tags')).toBeVisible()

            // Close drawer
            const cancelButton = within(getDrawer()).getByRole('button', {
                name: /cancel/i,
            })
            await userEvent.click(cancelButton)

            // Open Ticket Fields drawer
            await userEvent.click(screen.getAllByText('Ticket Fields')[0])
            expect(
                within(getDrawer()).getAllByText('Ticket Fields')[0],
            ).toBeVisible()
        })

        it('should not render the drawer when isOpen is false', () => {
            mockFlags({
                [FeatureFlagKey.AiAgentSettingsRevamp]: true,
            })

            renderComponent()

            expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
        })
    })

    describe('Agent Deactivation', () => {
        it('should not deactivate agent when isCreate is true', async () => {
            mockedUseAiAgentStoreConfigurationContext.mockReturnValue({
                storeConfiguration: undefined,
                isLoading: false,
                updateStoreConfiguration: mockUpdateStoreConfiguration,
                createStoreConfiguration: mockCreateStoreConfiguration,
                isPendingCreateOrUpdate: false,
            })

            renderComponent()

            await waitFor(() => {
                expect(mockUpdateStoreConfiguration).not.toHaveBeenCalled()
                expect(mockDispatch).not.toHaveBeenCalled()
            })
        })

        it('should deactivate agent silently when silentUpdate is true', async () => {
            mockedUseConfigurationForm.mockReturnValue({
                ...defaultUseConfigurationFormValues,
                formValues: {
                    ...initialFormValues,
                    chatChannelDeactivatedDatetime: '2024-07-30T12:33:02.750Z',
                    emailChannelDeactivatedDatetime: '2024-07-30T12:33:02.750Z',
                    trialModeActivatedDatetime: '2024-07-30T12:33:02.750Z',
                    previewModeValidUntilDatetime: '2024-07-30T12:33:02.750Z',
                },
            })

            mockedUseAiAgentStoreConfigurationContext.mockReturnValue({
                storeConfiguration: {
                    ...storeConfiguration,
                    chatChannelDeactivatedDatetime: '2024-07-30T12:33:02.750Z',
                    emailChannelDeactivatedDatetime: '2024-07-30T12:33:02.750Z',
                    trialModeActivatedDatetime: '2024-07-30T12:33:02.750Z',
                    previewModeValidUntilDatetime: '2024-07-30T12:33:02.750Z',
                    isPreviewModeActive: true,
                },
                isLoading: false,
                updateStoreConfiguration: mockUpdateStoreConfiguration,
                createStoreConfiguration: mockCreateStoreConfiguration,
                isPendingCreateOrUpdate: false,
            })

            renderComponent()

            await waitFor(() => {
                expect(mockUpdateStoreConfiguration).toHaveBeenCalledWith(
                    expect.objectContaining({
                        emailChannelDeactivatedDatetime: expect.any(String),
                        chatChannelDeactivatedDatetime: expect.any(String),
                        trialModeActivatedDatetime: null,
                        previewModeActivatedDatetime: null,
                        previewModeValidUntilDatetime: null,
                    }),
                )
                expect(mockDispatch).not.toHaveBeenCalled()
            })
        })

        it('should handle error during deactivation', async () => {
            const mockError = new Error('Test error')
            mockedUseConfigurationForm.mockReturnValue({
                ...defaultUseConfigurationFormValues,
                formValues: {
                    ...initialFormValues,
                    chatChannelDeactivatedDatetime: '2024-07-30T12:33:02.750Z',
                    emailChannelDeactivatedDatetime: '2024-07-30T12:33:02.750Z',
                    trialModeActivatedDatetime: '2024-07-30T12:33:02.750Z',
                    previewModeValidUntilDatetime: '2024-07-30T12:33:02.750Z',
                },
            })

            mockedUseAiAgentStoreConfigurationContext.mockReturnValue({
                storeConfiguration: {
                    ...storeConfiguration,
                    chatChannelDeactivatedDatetime: '2024-07-30T12:33:02.750Z',
                    emailChannelDeactivatedDatetime: '2024-07-30T12:33:02.750Z',
                    trialModeActivatedDatetime: '2024-07-30T12:33:02.750Z',
                    previewModeValidUntilDatetime: '2024-07-30T12:33:02.750Z',
                    isPreviewModeActive: true,
                },
                isLoading: false,
                updateStoreConfiguration: jest
                    .fn()
                    .mockRejectedValue(mockError),
                createStoreConfiguration: mockCreateStoreConfiguration,
                isPendingCreateOrUpdate: false,
            })

            renderComponent()

            await waitFor(() => {
                expect(reportError).toHaveBeenCalledWith(mockError, {
                    tags: { team: SentryTeam.AI_AGENT },
                    extra: {
                        context: 'Error during disabling AI Agent',
                    },
                })
            })
        })
    })

    describe('Handover Modal', () => {
        beforeEach(() => {
            mockFlags({
                [FeatureFlagKey.AiAgentChat]: true,
            })
        })

        it('should open handover modal when clicking on handover topics link', async () => {
            renderComponent()

            const handoverLink = screen.getByText('Define')
            await userEvent.click(handoverLink)

            expect(screen.getByRole('dialog')).toBeInTheDocument()
            expect(screen.getByText('Handover Topics')).toBeInTheDocument()
        })

        it('should close handover modal when clicking on close button', async () => {
            renderComponent()

            const handoverLink = screen.getByText('Define')
            await userEvent.click(handoverLink)

            const closeButton = screen.getByRole('button', { name: '' })
            await userEvent.click(closeButton)

            await waitFor(() => {
                expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
            })
        })

        it('should cancel changes when clicking on cancel button', async () => {
            renderComponent()

            const handoverLink = screen.getByText('Define')
            await userEvent.click(handoverLink)

            const cancelButton = screen.getByRole('button', { name: 'Cancel' })
            await userEvent.click(cancelButton)

            await waitFor(() => {
                expect(mockUpdateStoreConfiguration).not.toHaveBeenCalled()
                expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
            })
        })

        it('should show error notification when saving fails', async () => {
            const mockError = new AxiosError('Network Error')
            mockedUseAiAgentStoreConfigurationContext.mockReturnValue({
                storeConfiguration,
                isLoading: false,
                updateStoreConfiguration: jest
                    .fn()
                    .mockRejectedValue(mockError),
                createStoreConfiguration: mockCreateStoreConfiguration,
                isPendingCreateOrUpdate: false,
            })

            renderComponent()

            const handoverLink = screen.getByText('Define')
            await userEvent.click(handoverLink)

            const saveButton = screen.getByRole('button', {
                name: 'Confirm Topics',
            })
            await userEvent.click(saveButton)

            await waitFor(() => {
                expect(reportError).toHaveBeenCalledWith(mockError, {
                    tags: { team: SentryTeam.AI_AGENT },
                    extra: {
                        accountDomain: 'test-domain',
                        shopName: 'test-shop',
                    },
                })
            })
        })
    })

    describe('External Knowledge Sources', () => {
        beforeEach(() => {
            mockFlags({
                [FeatureFlagKey.AiAgentChat]: true,
            })
        })

        it('should filter knowledge source URLs', async () => {
            mockedUsePublicResources.mockReturnValue({
                sourceItems: [
                    {
                        id: 1,
                        url: 'https://test.com',
                        status: 'done',
                        createdDatetime: '2024-07-30T12:33:02.750Z',
                    },
                    {
                        id: 2,
                        url: 'https://testd.com',
                        status: 'error',
                        createdDatetime: '2024-07-30T12:33:02.750Z',
                    },
                ],
                isSourceItemsListLoading: false,
            })

            mockedUseFileIngestion.mockReturnValue({
                ingestedFiles: [
                    {
                        id: 1,
                        help_center_id: 1,
                        snippets_article_ids: [],
                        filename: 'test.pdf',
                        google_storage_url: 'https://test.com',
                        status: 'SUCCESSFUL',
                        uploaded_datetime: '2024-07-30T12:33:02.750Z',
                    },
                    {
                        id: 2,
                        help_center_id: 1,
                        snippets_article_ids: [],
                        filename: 'testd.pdf',
                        google_storage_url: 'https://testd.com',
                        status: 'FAILED',
                        uploaded_datetime: '2024-07-30T12:33:02.750Z',
                    },
                ],
                isLoading: false,
                isIngesting: false,
                ingestFile: jest.fn(),
                deleteIngestedFile: jest.fn(),
            })

            const mockOnSubmit = jest.fn()
            mockedUseConfigurationForm.mockReturnValue({
                ...defaultUseConfigurationFormValues,
                handleOnSave: mockOnSubmit,
            })

            renderComponent()

            await userEvent.click(
                screen.getByRole('button', { name: 'Save Changes' }),
            )

            expect(mockOnSubmit).toHaveBeenCalledWith({
                publicUrls: ['https://test.com'],
                hasExternalFiles: true,
                aiAgentMode: 'enabled',
                onSuccess: expect.any(Function),
                shopName: 'test-shop',
                silentNotification: true,
            })
        })
    })
})
