import { assumeMock } from '@repo/testing'
import { QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, screen } from '@testing-library/react'
import { fromJS } from 'immutable'
import { mockFlags } from 'jest-launchdarkly-mock'
import { keyBy } from 'lodash'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import { FeatureFlagKey } from 'config/featureFlags'
import { account } from 'fixtures/account'
import { axiosSuccessResponse } from 'fixtures/axiosResponse'
import * as billingFixtures from 'fixtures/billing'
import useAppDispatch from 'hooks/useAppDispatch'
import { useGetHelpCenterList } from 'models/helpCenter/queries'
import { IntegrationType } from 'models/integration/types'
import {
    useStoreActivations,
    useStoreConfigurations,
} from 'pages/aiAgent/Activation/hooks/useStoreActivations'
import { applyMockActivationHook } from 'pages/aiAgent/test/mock-activation-hooks.utils'
import useSelfServiceChatChannels from 'pages/automate/common/hooks/useSelfServiceChatChannels'
import { ContactFormFixture } from 'pages/settings/contactForm/fixtures/contacForm'
import { initialState } from 'state/billing/reducers'
import { getHasAutomate } from 'state/billing/selectors'
import { mockQueryClient } from 'tests/reactQueryTestingUtils'
import { renderWithRouter } from 'utils/testing'

import AiAgentConfigurationContainer from '../AiAgentConfigurationContainer'
import { getStoreConfigurationFixture } from '../fixtures/storeConfiguration.fixtures'
import { useHandoverCustomizationChatFallbackSettingsForm } from '../hooks/handoverCustomization/useHandoverCustomizationChatFallbackSettingsForm'
import { useHandoverCustomizationChatOfflineSettingsForm } from '../hooks/handoverCustomization/useHandoverCustomizationChatOfflineSettingsForm'
import { useHandoverCustomizationChatOnlineSettingsForm } from '../hooks/handoverCustomization/useHandoverCustomizationChatOnlineSettingsForm'
import { useGetOrCreateSnippetHelpCenter } from '../hooks/useGetOrCreateSnippetHelpCenter'
import * as useStoreConfigurationFormHookModule from '../hooks/useStoreConfigurationForm'
import { useAiAgentStoreConfigurationContext } from '../providers/AiAgentStoreConfigurationContext'

jest.mock('state/billing/selectors', () => ({
    __esModule: true,
    ...jest.requireActual('state/billing/selectors'),
    getHasAutomate: jest.fn(),
}))
const mockGetHasAutomate = jest.mocked(getHasAutomate)

jest.mock('../hooks/useGetOrCreateSnippetHelpCenter', () => ({
    useGetOrCreateSnippetHelpCenter: jest.fn(),
}))
const mockUseGetOrCreateSnippetHelpCenter = jest.mocked(
    useGetOrCreateSnippetHelpCenter,
)

jest.mock(
    'pages/aiAgent/components/StoreConfigForm/hooks/useVerifyChannelsActivation',
)

jest.mock('hooks/useAppDispatch')
const mockUseAppDispatch = useAppDispatch as jest.Mock

jest.mock('models/helpCenter/queries')
const mockUseGetHelpCenterList = assumeMock(useGetHelpCenterList)

jest.mock('../providers/AiAgentStoreConfigurationContext')
const mockUseAiAgentStoreConfigurationContext = jest.mocked(
    useAiAgentStoreConfigurationContext,
)

jest.mock('pages/settings/helpCenter/hooks/useHelpCenterList', () => ({
    useHelpCenterList: () => ({
        isLoading: false,
        helpCenters: [],
    }),
}))

jest.mock('pages/aiAgent/hooks/useStoresDomainIngestionLogs', () => ({
    useStoresDomainIngestionLogs: () => ({
        isLoading: false,
        data: undefined,
    }),
}))

jest.mock('pages/automate/common/hooks/useHelpCentersArticleCount', () => ({
    useHelpCentersArticleCount: () => [],
}))

jest.mock('models/storeMapping/queries', () => ({
    useListStoreMappings: () => ({
        data: [],
    }),
}))

jest.mock('common/segment', () => ({
    logEvent: jest.fn(),
    SegmentEvent: { AiAgentEnabled: 'ai-agent-enabled' },
}))

jest.mock('pages/aiAgent/hooks/usePublicResources', () => ({
    usePublicResources: () => ({
        sourceItems: [],
        isSourceItemsListLoading: false,
    }),
}))

jest.mock('pages/aiAgent/hooks/useFileIngestion', () => ({
    useFileIngestion: () => ({
        ingestedFiles: [],
    }),
}))

jest.mock('pages/standalone/components/HandoverConfigurationDrawer', () => ({
    HandoverConfigurationDrawer: () => (
        <div data-testid="mocked-handover-drawer"></div>
    ),
}))

jest.mock(
    'pages/aiAgent/hooks/handoverCustomization/useHandoverCustomizationChatOfflineSettingsForm',
)
jest.mock(
    'pages/aiAgent/hooks/handoverCustomization/useHandoverCustomizationChatOnlineSettingsForm',
)
jest.mock(
    'pages/aiAgent/hooks/handoverCustomization/useHandoverCustomizationChatFallbackSettingsForm',
)

jest.mock('models/rule/resources', () => ({
    listRules: () => Promise.resolve({ data: [] }),
}))

jest.mock('pages/aiAgent/Activation/hooks/useStoreActivations')
jest.mock('hooks/aiAgent/useCanUseAiSalesAgent')
jest.mock('pages/automate/common/hooks/useSelfServiceChatChannels')

const getUseStoreConfigurationFormMock = () => ({
    formValues: {
        monitoredChatIntegrations: [],
        monitoredEmailIntegrations: [],
        monitoredSmsIntegrations: [],
        signature: 'This response was created by AI',
        useEmailIntegrationSignature: false,
        emailChannelDeactivatedDatetime: null,
        chatChannelDeactivatedDatetime: null,
        smsChannelDeactivatedDatetime: null,
    },
    resetForm: jest.fn(),
    isFormDirty: false,
    updateValue: jest.fn(),
    setFormValues: jest.fn(),
    isFieldDirty: jest.fn(),
    handleOnSave: jest.fn(),
    isPendingCreateOrUpdate: false,
    isEmailChannelEnabled: true,
    isChatChannelEnabled: true,
    isSmsChannelEnabled: false,
})

jest.mock('../hooks/useStoreConfigurationForm', () => ({
    useStoreConfigurationForm: jest.fn(() =>
        getUseStoreConfigurationFormMock(),
    ),
}))

const useSelfServiceChatChannelsMock = assumeMock(useSelfServiceChatChannels)
const useStoreActivationsMock = assumeMock(useStoreActivations)
const useStoreConfigurationsMock = assumeMock(useStoreConfigurations)
const mockUseStoreConfigurationForm =
    useStoreConfigurationFormHookModule.useStoreConfigurationForm as jest.Mock

const mockedUseHandoverCustomizationChatOfflineSettingsFormProps = {
    isLoading: false,
    isSaving: false,
    formValues: {},
    updateValue: jest.fn(),
    handleOnSave: jest.fn(),
    handleOnCancel: jest.fn(),
}

const mockedUseHandoverCustomizationChatOnlineSettingsFormProps = {
    isLoading: false,
    isSaving: false,
    formValues: {},
    updateValue: jest.fn(),
    handleOnSave: jest.fn(),
    handleOnCancel: jest.fn(),
}

const mockedUseHandoverCustomizationChatFallbackSettingsFormProps = {
    isLoading: false,
    isSaving: false,
    formValues: {},
}

const mockStore = configureMockStore([thunk])

const contactForm = ContactFormFixture

const getState = (accountId?: number) => ({
    currentAccount: fromJS(
        accountId !== undefined ? { ...account, id: accountId } : account,
    ),
    billing: initialState.mergeDeep(billingFixtures.billingState),
    integrations: fromJS({
        integrations: [
            {
                id: 1,
                type: IntegrationType.Shopify,
                name: 'test-shop',
                meta: {
                    shop_name: 'test-shop',
                    oauth: {
                        scope: ['read_fulfillments'],
                    },
                },
            },
            {
                id: 1,
                type: IntegrationType.Email,
                name: 'My email integration',
                meta: {
                    address: 'test@mail.com',
                },
            },
        ],
    }),
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
    },
})

const mockedAiAgentStoreConfigurationContext = {
    isLoading: false,
    storeConfiguration: undefined,
    updateStoreConfiguration: jest.fn(),
    createStoreConfiguration: jest.fn(),
    isPendingCreateOrUpdate: false,
}

const getHelpCenterListResponse = {
    data: axiosSuccessResponse({
        data: [
            { id: 1, name: 'help center 1', type: 'faq' },
            { id: 2, name: 'help center 2', type: 'faq' },
        ],
    }),
    isLoading: false,
} as unknown as ReturnType<typeof useGetHelpCenterList>

const findToggle = (type: 'email' | 'chat') =>
    screen
        .queryAllByLabelText('Enable AI Agent')
        .find(
            (toggle) =>
                toggle.getAttribute('name') === `toggle-ai-agent-${type}`,
        )

const renderComponent = ({
    accountId = undefined,
    tab = undefined,
}: { accountId?: number; tab?: string } = {}) => {
    let path = `/:shopType/:shopName/ai-agent/settings`
    let route = '/shopify/test-shop/ai-agent/settings'

    if (tab) {
        path = `${path}/:tab`
        route = `${route}/${tab}`
    }

    return renderWithRouter(
        <Provider store={mockStore(getState(accountId))}>
            <QueryClientProvider client={mockQueryClient()}>
                <AiAgentConfigurationContainer />
            </QueryClientProvider>
        </Provider>,
        {
            path,
            route,
        },
    )
}

const setupMocks = ({
    isStoreConfigurationLoading = false,
    isHelpCentersLoading = false,
    hasStoreConfiguration = true,
    storeConfigurationData = {},
} = {}) => {
    mockFlags({})

    mockGetHasAutomate.mockReturnValue(false)
    mockUseGetOrCreateSnippetHelpCenter.mockReturnValue({
        helpCenter: null,
        isLoading: false,
    })

    mockUseAppDispatch.mockReturnValue(jest.fn())

    mockUseAiAgentStoreConfigurationContext.mockReturnValue({
        ...mockedAiAgentStoreConfigurationContext,
        storeConfiguration: hasStoreConfiguration
            ? getStoreConfigurationFixture(storeConfigurationData ?? {})
            : undefined,
        isLoading: isStoreConfigurationLoading,
    })

    mockUseGetHelpCenterList.mockReturnValue({
        ...getHelpCenterListResponse,
        isLoading: isHelpCentersLoading,
    } as unknown as ReturnType<typeof useGetHelpCenterList>)

    applyMockActivationHook()
    useStoreConfigurationsMock.mockReturnValue({
        storeConfigurations: [],
    } as any)
    useStoreActivationsMock.mockReturnValue({
        storeActivations: {
            testShop: {
                name: 'testShop',
                title: 'testShop',
                alerts: [],
                configuration: {
                    shopType: 'shopify',
                    storeName: 'testShop',
                },
                support: {
                    enabled: true,
                    chat: {
                        enabled: true,
                        availableChats: [1],
                        isIntegrationMissing: false,
                    },
                    email: {
                        enabled: true,
                        isIntegrationMissing: false,
                    },
                },
            },
        },
    } as any)
    useSelfServiceChatChannelsMock.mockReturnValue([
        {
            value: {
                id: 1,
                name: 'test-chat',
                type: IntegrationType.GorgiasChat,
                isDisabled: false,
                meta: {
                    app_id: '123',
                },
            },
        } as any,
    ])
}

describe('AiAgentConfigurationContainer', () => {
    beforeEach(() => {
        jest.resetAllMocks()
        // Reset the mock to default values
        mockUseStoreConfigurationForm.mockReturnValue(
            getUseStoreConfigurationFormMock(),
        )
        ;(
            useHandoverCustomizationChatOfflineSettingsForm as jest.Mock
        ).mockReturnValue(
            mockedUseHandoverCustomizationChatOfflineSettingsFormProps,
        )
        ;(
            useHandoverCustomizationChatOnlineSettingsForm as jest.Mock
        ).mockReturnValue(
            mockedUseHandoverCustomizationChatOnlineSettingsFormProps,
        )
        ;(
            useHandoverCustomizationChatFallbackSettingsForm as jest.Mock
        ).mockReturnValue(
            mockedUseHandoverCustomizationChatFallbackSettingsFormProps,
        )
    })

    it('renders loader if loading store configuration', () => {
        setupMocks({ isStoreConfigurationLoading: true })
        renderComponent()
        expect(screen.getByLabelText('loading')).toBeInTheDocument()
    })

    it('renders loader if loading help centers', () => {
        setupMocks({ isHelpCentersLoading: true })
        renderComponent()
        expect(screen.getByLabelText('loading')).toBeInTheDocument()
    })

    it('renders configuration', () => {
        setupMocks()
        renderComponent()

        const emailToggle = findToggle('email')
        expect(emailToggle).not.toBeNull()

        screen.getByText('Save Changes')
    })

    it('renders the configuration page if the merchant already has interacted with the AI Agent', () => {
        setupMocks({
            hasStoreConfiguration: true,
        })
        renderComponent()

        const emailToggle = findToggle('email')
        expect(emailToggle).not.toBeNull()

        screen.getByText('Save Changes')
    })

    it('renders only general sections on general settings page if :tab param not set', () => {
        setupMocks()
        mockFlags({
            [FeatureFlagKey.AiAgentChat]: true,
        })
        renderComponent()

        expect(
            screen.getByText('Tone of Voice and Language'),
        ).toBeInTheDocument()
        expect(screen.queryByText('Chat')).not.toBeInTheDocument()
        expect(screen.queryByText('Email')).not.toBeInTheDocument()
        expect(screen.getByText('Handover and exclusion')).toBeInTheDocument()
        expect(screen.getByText('AI ticket tagging')).toBeInTheDocument()
        expect(screen.getByText('Save Changes')).toBeInTheDocument()
    })

    it('renders only channels section on channels settings page if :tab param set to "channels"', () => {
        setupMocks()
        mockFlags({
            [FeatureFlagKey.AiAgentChat]: true,
        })

        renderComponent({ tab: 'channels' })
        expect(screen.queryByText('General')).not.toBeInTheDocument()
        // The title will be "Settings" since the route is /settings/channels, not /deploy/chat
        const heading = screen.getByRole('heading', { level: 1 })
        expect(heading).toHaveTextContent('Settings')
        // Check for the actual content that gets rendered in channels tab
        expect(
            screen.getAllByText('Enable AI Agent on Chat')[0],
        ).toBeInTheDocument()
        expect(
            screen.getAllByText('Enable AI Agent on Email')[0],
        ).toBeInTheDocument()
        expect(
            screen.queryByText('Handover and exclusion'),
        ).not.toBeInTheDocument()
        expect(screen.queryByText('AI ticket tagging')).not.toBeInTheDocument()
        expect(screen.getAllByText('Save Changes')[0]).toBeInTheDocument()
    })

    describe('when toggling', () => {
        describe('silentHandover toggle', () => {
            it.each([
                { expected: true, defaultValue: null },
                { expected: true, defaultValue: false },
                { expected: false, defaultValue: true },
            ])(
                'should set silentHandover to $expected when the default value is $defaultValue',
                ({ expected, defaultValue }) => {
                    const mockUpdateValue = jest.fn()

                    // Update the mock to have the right initial value
                    mockUseStoreConfigurationForm.mockReturnValue({
                        ...getUseStoreConfigurationFormMock(),
                        formValues: {
                            ...getUseStoreConfigurationFormMock().formValues,
                            silentHandover: defaultValue,
                        },
                        updateValue: mockUpdateValue,
                    })

                    setupMocks({
                        storeConfigurationData: {
                            silentHandover: defaultValue,
                        },
                    })

                    mockFlags({
                        [FeatureFlagKey.AiAgentChat]: true,
                    })

                    const { getAllByRole } = renderComponent()
                    fireEvent.click(
                        getAllByRole('checkbox').find(
                            (toggle) =>
                                toggle.getAttribute('name') ===
                                'toggle-ai-agent-handover',
                        ) as HTMLInputElement,
                    )
                    expect(mockUpdateValue).toHaveBeenCalledWith(
                        'silentHandover',
                        expected,
                    )
                },
            )
        })
    })

    describe('form submission and saving', () => {
        it('should disable save button when form is not dirty', () => {
            mockUseStoreConfigurationForm.mockReturnValue(
                getUseStoreConfigurationFormMock(),
            )

            setupMocks()
            renderComponent()

            const saveButtons = screen.getAllByText('Save Changes')
            const saveButton = saveButtons[0].closest('button')
            expect(saveButton).toHaveAttribute('aria-disabled', 'true')
        })

        it('should show saving state when form is being saved', () => {
            mockUseStoreConfigurationForm.mockReturnValue(
                getUseStoreConfigurationFormMock(),
            )

            setupMocks()
            renderComponent()

            const saveButtons = screen.getAllByText('Save Changes')
            const saveButton = saveButtons[0].closest('button')
            expect(saveButton).toHaveAttribute('aria-disabled', 'true')
        })
    })

    describe('error handling', () => {
        it('should handle errors gracefully', () => {
            setupMocks()

            expect(() => renderComponent()).not.toThrow()
        })
    })

    describe('store configuration creation', () => {
        it('should show appropriate UI when no store configuration exists', () => {
            setupMocks({ hasStoreConfiguration: false })
            renderComponent()

            expect(screen.getAllByText('Save Changes')[0]).toBeInTheDocument()
        })
    })

    describe('user permissions', () => {
        it('should disable form when user lacks Automate', () => {
            setupMocks()
            mockGetHasAutomate.mockReturnValue(false)
            renderComponent()

            expect(screen.getAllByText('Save Changes')[0]).toBeInTheDocument()
        })

        it('should enable form when user has Automate', () => {
            setupMocks()
            mockGetHasAutomate.mockReturnValue(true)
            renderComponent()

            expect(screen.getAllByText('Save Changes')[0]).toBeInTheDocument()
        })
    })

    describe('tab navigation', () => {
        it('should render general tab content', () => {
            setupMocks()
            mockFlags({
                [FeatureFlagKey.AiAgentChat]: true,
            })

            renderComponent()
            expect(
                screen.getByText('Tone of Voice and Language'),
            ).toBeInTheDocument()
        })

        it('should render channels tab content', () => {
            setupMocks()
            mockFlags({
                [FeatureFlagKey.AiAgentChat]: true,
            })

            renderComponent({ tab: 'channels' })
            // Check for actual content in channels tab
            expect(
                screen.getAllByText('Enable AI Agent on Chat')[0],
            ).toBeInTheDocument()
            expect(
                screen.getAllByText('Enable AI Agent on Email')[0],
            ).toBeInTheDocument()
        })
    })

    describe('feature flag combinations', () => {
        it('should handle multiple feature flags correctly', () => {
            setupMocks()
            mockFlags({
                [FeatureFlagKey.AiAgentChat]: true,
                [FeatureFlagKey.AiAgentActivation]: true,
                [FeatureFlagKey.AiAgentNewActivationXp]: true,
            })

            renderComponent({ tab: 'channels' })

            expect(
                screen.getAllByText('Enable AI Agent on Chat')[0],
            ).toBeInTheDocument()
            expect(
                screen.getAllByText('Enable AI Agent on Email')[0],
            ).toBeInTheDocument()
        })

        it('should handle disabled feature flags', () => {
            setupMocks()
            mockFlags({
                [FeatureFlagKey.AiAgentChat]: false,
            })

            renderComponent({ tab: 'channels' })

            expect(
                screen.queryByText('Enable AI Agent on Chat'),
            ).not.toBeInTheDocument()
            expect(
                screen.getAllByText('Enable AI Agent on Email')[0],
            ).toBeInTheDocument()
        })
    })

    describe('integration state', () => {
        it('should show both chat and email toggles when configured', () => {
            setupMocks()
            mockFlags({
                [FeatureFlagKey.AiAgentChat]: true,
            })

            renderComponent({ tab: 'channels' })

            expect(
                screen.getAllByText('Enable AI Agent on Chat')[0],
            ).toBeInTheDocument()
            expect(
                screen.getAllByText('Enable AI Agent on Email')[0],
            ).toBeInTheDocument()
        })
    })

    describe('route-based section determination', () => {
        it('should determine chat section when route contains /deploy/chat and display Chat title', () => {
            setupMocks()
            mockFlags({
                [FeatureFlagKey.AiAgentChat]: true,
            })

            renderWithRouter(
                <Provider store={mockStore(getState())}>
                    <QueryClientProvider client={mockQueryClient()}>
                        <AiAgentConfigurationContainer />
                    </QueryClientProvider>
                </Provider>,
                {
                    path: '/:shopType/:shopName/ai-agent/deploy/chat',
                    route: '/shopify/test-shop/ai-agent/deploy/chat',
                },
            )

            const heading = screen.getByRole('heading', { level: 1 })
            expect(heading).toHaveTextContent('Chat')
        })

        it('should determine email section when route contains /deploy/email and display Email title', () => {
            setupMocks()

            renderWithRouter(
                <Provider store={mockStore(getState())}>
                    <QueryClientProvider client={mockQueryClient()}>
                        <AiAgentConfigurationContainer />
                    </QueryClientProvider>
                </Provider>,
                {
                    path: '/:shopType/:shopName/ai-agent/deploy/email',
                    route: '/shopify/test-shop/ai-agent/deploy/email',
                },
            )

            const heading = screen.getByRole('heading', { level: 1 })
            expect(heading).toHaveTextContent('Email')
        })

        it('should determine sms section when route contains /deploy/sms and display SMS title', () => {
            setupMocks()

            renderWithRouter(
                <Provider store={mockStore(getState())}>
                    <QueryClientProvider client={mockQueryClient()}>
                        <AiAgentConfigurationContainer />
                    </QueryClientProvider>
                </Provider>,
                {
                    path: '/:shopType/:shopName/ai-agent/deploy/sms',
                    route: '/shopify/test-shop/ai-agent/deploy/sms',
                },
            )

            const heading = screen.getByRole('heading', { level: 1 })
            expect(heading).toHaveTextContent('SMS')
        })

        it('should have undefined section when route does not match any deploy path and display Settings title', () => {
            setupMocks()

            renderWithRouter(
                <Provider store={mockStore(getState())}>
                    <QueryClientProvider client={mockQueryClient()}>
                        <AiAgentConfigurationContainer />
                    </QueryClientProvider>
                </Provider>,
                {
                    path: '/:shopType/:shopName/ai-agent/settings',
                    route: '/shopify/test-shop/ai-agent/settings',
                },
            )

            const heading = screen.getByRole('heading', { level: 1 })
            expect(heading).toHaveTextContent('Settings')
        })

        it('should handle nested deploy paths correctly and display Chat title', () => {
            setupMocks()
            mockFlags({
                [FeatureFlagKey.AiAgentChat]: true,
            })

            renderWithRouter(
                <Provider store={mockStore(getState())}>
                    <QueryClientProvider client={mockQueryClient()}>
                        <AiAgentConfigurationContainer />
                    </QueryClientProvider>
                </Provider>,
                {
                    path: '/:shopType/:shopName/ai-agent/deploy/chat/settings',
                    route: '/shopify/test-shop/ai-agent/deploy/chat/settings',
                },
            )

            const heading = screen.getByRole('heading', { level: 1 })
            expect(heading).toHaveTextContent('Chat')
        })
    })
})
