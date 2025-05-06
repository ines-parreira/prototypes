import React from 'react'

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
import useAppDispatch from 'hooks/useAppDispatch'
import { useGetHelpCenterList } from 'models/helpCenter/queries'
import { IntegrationType } from 'models/integration/types'
import { applyMockActivationHook } from 'pages/aiAgent/test/mock-activation-hooks.utils'
import { ContactFormFixture } from 'pages/settings/contactForm/fixtures/contacForm'
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

    it('renders all section on settings page if standalone menu feature flag is disabled', () => {
        setupMocks()
        mockFlags({
            [FeatureFlagKey.ConvAiStandaloneMenu]: false,
            [FeatureFlagKey.AiAgentChat]: true,
        })
        renderComponent()

        expect(screen.queryByText('General')).toBeInTheDocument()
        expect(screen.queryByText('Chat settings')).toBeInTheDocument()
        expect(screen.queryByText('Email settings')).toBeInTheDocument()
        expect(screen.queryByText('Handover and exclusion')).toBeInTheDocument()
        expect(screen.queryByText('AI ticket tagging')).toBeInTheDocument()
        expect(screen.queryByText('Save Changes')).toBeInTheDocument()
    })

    it('renders only general sections on general settings page if standalone menu feature flag is enabled and :tab param not set', () => {
        setupMocks()
        mockFlags({
            [FeatureFlagKey.ConvAiStandaloneMenu]: true,
            [FeatureFlagKey.AiAgentChat]: true,
        })
        renderComponent()
        expect(screen.queryByText('General')).toBeInTheDocument()
        expect(screen.queryByText('Chat settings')).not.toBeInTheDocument()
        expect(screen.queryByText('Email settings')).not.toBeInTheDocument()
        expect(screen.queryByText('Handover and exclusion')).toBeInTheDocument()
        expect(screen.queryByText('AI ticket tagging')).toBeInTheDocument()
        expect(screen.queryByText('Save Changes')).toBeInTheDocument()
    })

    it('renders only channels section on channels settings page if standalone menu feature flag is enabled and :tab param set to "channels"', () => {
        setupMocks()
        mockFlags({
            [FeatureFlagKey.ConvAiStandaloneMenu]: true,
            [FeatureFlagKey.AiAgentChat]: true,
        })

        renderComponent({ tab: 'channels' })
        expect(screen.queryByText('General')).not.toBeInTheDocument()
        expect(screen.queryByText('Chat settings')).toBeInTheDocument()
        expect(screen.queryByText('Email settings')).toBeInTheDocument()
        expect(
            screen.queryByText('Handover and exclusion'),
        ).not.toBeInTheDocument()
        expect(screen.queryByText('AI ticket tagging')).not.toBeInTheDocument()
        expect(screen.queryByText('Save Changes')).toBeInTheDocument()
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
                        [FeatureFlagKey.ConvAiStandaloneMenu]: false,
                        [FeatureFlagKey.AiAgentChat]: true,
                    })

                    const { getByText } = renderComponent()
                    fireEvent.click(
                        getByText('Tell customers when handing over'),
                    )
                    expect(
                        mockUseStoreConfigurationFormHookUpdateValue,
                    ).toHaveBeenCalledWith('silentHandover', expected)
                },
            )
        })
    })
})
