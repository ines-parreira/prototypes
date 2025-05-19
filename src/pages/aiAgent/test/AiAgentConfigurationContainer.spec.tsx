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
import { assumeMock, renderWithRouter } from 'utils/testing'

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

const useSelfServiceChatChannelsMock = assumeMock(useSelfServiceChatChannels)
const useStoreActivationsMock = assumeMock(useStoreActivations)
const useStoreConfigurationsMock = assumeMock(useStoreConfigurations)

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

        expect(screen.getByText('Tone of voice')).toBeInTheDocument()
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
        expect(screen.getByText('Chat')).toBeInTheDocument()
        expect(screen.getByText('Email')).toBeInTheDocument()
        expect(
            screen.queryByText('Handover and exclusion'),
        ).not.toBeInTheDocument()
        expect(screen.queryByText('AI ticket tagging')).not.toBeInTheDocument()
        expect(screen.getAllByText('Save Changes')[0]).toBeInTheDocument()
    })

    describe('when toggling', () => {
        const originalUseStoreConfigurationFormHook =
            useStoreConfigurationFormHookModule.useStoreConfigurationForm
        const mockUseStoreConfigurationFormHookUpdateValue = jest.fn()

        beforeEach(() => {
            jest.spyOn(
                useStoreConfigurationFormHookModule,
                'useStoreConfigurationForm',
            ).mockImplementation((...args) => {
                const originalResult = originalUseStoreConfigurationFormHook(
                    ...args,
                )
                return {
                    ...originalResult,
                    updateValue: jest.fn((...args) => {
                        originalResult.updateValue(...args)
                        mockUseStoreConfigurationFormHookUpdateValue(...args)
                    }),
                }
            })
        })

        describe('silentHandover toggle', () => {
            it.each([
                { expected: true, defaultValue: null },
                { expected: true, defaultValue: false },
                { expected: false, defaultValue: true },
            ])(
                'should set silentHandover to $expected when the default value is $defaultValue',
                ({ expected, defaultValue }) => {
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
                    expect(
                        mockUseStoreConfigurationFormHookUpdateValue,
                    ).toHaveBeenCalledWith('silentHandover', expected)
                },
            )
        })
    })
})
