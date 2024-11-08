import {QueryClientProvider} from '@tanstack/react-query'
import {act, fireEvent, screen} from '@testing-library/react'
import {createMemoryHistory} from 'history'
import {fromJS} from 'immutable'
import {useFlags} from 'launchdarkly-react-client-sdk'
import {keyBy} from 'lodash'
import React from 'react'
import {Provider} from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import {FeatureFlagKey} from 'config/featureFlags'

import {account} from 'fixtures/account'
import {axiosSuccessResponse} from 'fixtures/axiosResponse'
import {billingState} from 'fixtures/billing'
import {user} from 'fixtures/users'
import {StoreConfiguration} from 'models/aiAgent/types'
import {
    useGetHelpCenterList,
    useGetArticleIngestionLogs,
    useCreateFileIngestion,
    useDeleteFileIngestion,
    useGetFileIngestion,
} from 'models/helpCenter/queries'
import {AiAgentKnowledgeContainer} from 'pages/automate/aiAgent/AiAgentKnowledgeContainer'
import {usePublicResourcesPooling} from 'pages/automate/aiAgent/hooks/usePublicResourcesPooling'
import {useAiAgentStoreConfigurationContext} from 'pages/automate/aiAgent/providers/AiAgentStoreConfigurationContext'
import {ContactFormFixture} from 'pages/settings/contactForm/fixtures/contacForm'
import {getSingleHelpCenterResponseFixture} from 'pages/settings/helpCenter/fixtures/getHelpCentersResponse.fixture'
import {RootState} from 'state/types'
import {mockQueryClient} from 'tests/reactQueryTestingUtils'
import {assumeMock, renderWithRouter} from 'utils/testing'

import {INITIAL_FORM_VALUES} from '../constants'
import {applicationsAutomationSettingsAiAgentEnabledFixture} from '../fixtures/applicationAutomationSettings.fixture'
import {getStoreConfigurationFixture} from '../fixtures/storeConfiguration.fixtures'

jest.mock('launchdarkly-react-client-sdk', () => ({
    useFlag: jest.fn(),
}))
const useFlagsMock = assumeMock(useFlags)

jest.mock(
    'pages/automate/aiAgent/providers/AiAgentStoreConfigurationContext',
    () => ({
        useAiAgentStoreConfigurationContext: jest.fn(),
    })
)
const mockedUseAiAgentStoreConfigurationContext = jest.mocked(
    useAiAgentStoreConfigurationContext
)

jest.mock('pages/automate/aiAgent/hooks/usePublicResourcesPooling', () => ({
    usePublicResourcesPooling: jest.fn(),
}))
const mockedUsePublicResourcesPooling = jest.mocked(usePublicResourcesPooling)

jest.mock('pages/automate/aiAgent/hooks/usePublicResourcesMutation', () => ({
    usePublicResourceMutation: jest.fn(() => ({
        addPublicResource: jest.fn(),
        deletePublicResource: jest.fn(),
    })),
}))

jest.mock('models/helpCenter/queries')
const mockUseGetHelpCenterList = assumeMock(useGetHelpCenterList)
const mockUseGetArticleIngestionLogs = assumeMock(useGetArticleIngestionLogs)

const mockUseCreateFileIngestion = assumeMock(useCreateFileIngestion)
const mockUseGetFileIngestion = assumeMock(useGetFileIngestion)
const mockUseDeleteFileIngestion = assumeMock(useDeleteFileIngestion)

const mockCreateStoreConfiguration = jest.fn()
const mockUpsertStoreConfiguration = jest.fn()
jest.mock('pages/automate/aiAgent/hooks/useStoreConfigurationMutation', () => ({
    useStoreConfigurationMutation: jest.fn(() => ({
        isLoading: false,
        createStoreConfiguration: mockCreateStoreConfiguration,
        upsertStoreConfiguration: mockUpsertStoreConfiguration,
    })),
}))

const queryClient = mockQueryClient()
const mockStore = configureMockStore([thunk])
const history = createMemoryHistory({
    initialEntries: ['/shopify/test-store/ai-agent/knowledge'],
})

const defaultState: Partial<RootState> = {
    currentUser: fromJS(user),
    currentAccount: fromJS(account),
    billing: fromJS(billingState),
    integrations: fromJS({
        integrations: [],
    }),
    entities: {
        contactForm: {
            contactFormsAutomationSettings: {
                automationSettingsByContactFormId: {
                    [ContactFormFixture.id]: {
                        workflows: [],
                        order_management: {enabled: false},
                    },
                },
            },
            contactForms: {
                contactFormById: keyBy([ContactFormFixture], 'id'),
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
        },
    },
} as unknown as RootState

const mockUpdateStoreConfiguration = jest
    .fn()
    .mockImplementation((c: StoreConfiguration) => c)

const storeConfiguration = getStoreConfigurationFixture()

const renderComponent = ({
    isStoreConfigLoading = false,
    isLoadingHelpCenters = false,
    noStoreConfiguration = false,
    helpCenterId = 1,
}: {
    isStoreConfigLoading?: boolean
    isLoadingHelpCenters?: boolean
    noStoreConfiguration?: boolean
    helpCenterId?: number | null
} = {}) => {
    mockedUseAiAgentStoreConfigurationContext.mockReturnValue({
        storeConfiguration: noStoreConfiguration
            ? undefined
            : {...storeConfiguration, helpCenterId},
        isLoading: isStoreConfigLoading,
        updateStoreConfiguration: mockUpdateStoreConfiguration,
        createStoreConfiguration: jest.fn(),
        isPendingCreateOrUpdate: false,
    })

    mockUseGetHelpCenterList.mockReturnValue({
        data: axiosSuccessResponse({
            data: [
                {
                    id: 1,
                    name: 'help center 1',
                    type: 'faq',
                    shop_name: 'test-store',
                },
                {
                    id: 2,
                    name: 'help center 2',
                    type: 'faq',
                    shop_name: 'test-store',
                },
            ],
        }),
        isLoading: isLoadingHelpCenters,
    } as unknown as ReturnType<typeof useGetHelpCenterList>)

    mockUseGetArticleIngestionLogs.mockReturnValue({
        data: [
            {id: 1, status: 'SUCCESSFUL', url: 'http://my-shop.com/faq'},
            {id: 2, status: 'SUCCESSFUL', url: 'http://my-shop.com/knowledge'},
        ],
    } as unknown as ReturnType<typeof useGetArticleIngestionLogs>)

    mockUseCreateFileIngestion.mockReturnValue({
        mutateAsync: jest.fn(),
    } as unknown as ReturnType<typeof useCreateFileIngestion>)

    mockUseDeleteFileIngestion.mockReturnValue({
        mutateAsync: jest.fn(),
    } as unknown as ReturnType<typeof useDeleteFileIngestion>)

    mockUseGetFileIngestion.mockReturnValue({
        data: [],
    } as unknown as ReturnType<typeof useGetFileIngestion>)

    mockedUsePublicResourcesPooling.mockReturnValue({
        articleIngestionLogsStatus: ['SUCCESSFUL', 'SUCCESSFUL'],
    })

    return renderWithRouter(
        <Provider store={mockStore(defaultState)}>
            <QueryClientProvider client={queryClient}>
                <AiAgentKnowledgeContainer />
            </QueryClientProvider>
        </Provider>,
        {
            path: `/:shopType/:shopName/ai-agent/knowledge`,
            route: '/shopify/test-store/ai-agent/knowledge',
            history,
        }
    )
}

describe('AiAgentKnowledgeContainer', () => {
    it('should correctly render the component', () => {
        renderComponent()

        expect(
            screen.getByText(
                'Select a Help Center or add at least one URL or external document in order to enable AI Agent.'
            )
        ).toBeInTheDocument()

        expect(
            screen.getByText(
                'Add external URLs for AI Agent to reference. Links to your Gorgias Help Center or main domain are not accepted, as AI Agent needs specific pages to provide accurate answers.'
            )
        ).toBeInTheDocument()

        expect(
            screen.queryByText(
                'Upload knowledge and process documents for AI Agent to reference. Do not upload files that may contain any sensitive or personal information. Images will be ignored.'
            )
        ).not.toBeInTheDocument()

        expect(screen.queryByTestId('loader')).not.toBeInTheDocument()
    })

    it('should render the external files section when feature flag is enabled', () => {
        useFlagsMock.mockReturnValue({
            [FeatureFlagKey.AiAgentSnippetsFromExternalFiles]: true,
        })

        renderComponent()

        expect(
            screen.getByText(
                'Upload knowledge and process documents for AI Agent to reference. Do not upload files that may contain any sensitive or personal information. Images will be ignored.'
            )
        ).toBeInTheDocument()
    })

    it('should show a loader if store config is still loading', () => {
        renderComponent({isStoreConfigLoading: true})
        expect(screen.queryByTestId('loader')).toBeInTheDocument()
    })

    it('should show a loader if help centers are still loading', () => {
        renderComponent({isLoadingHelpCenters: true})
        expect(screen.queryByTestId('loader')).toBeInTheDocument()
    })

    it('should submit the form with the correct data on submit if there is already a store configuration', () => {
        renderComponent()

        const dropdown = screen.getByText('help center 1')
        fireEvent.focus(dropdown)
        const option = screen.getByText('help center 2')
        fireEvent.click(option)

        const saveButton = screen.getByText(/Save Changes/i)
        fireEvent.click(saveButton)

        expect(mockUpsertStoreConfiguration).toHaveBeenCalledWith({
            ...storeConfiguration,
            helpCenterId: 2,
        })
    })

    it('should submit the form with the correct data on submit if there is no store configuration yet', () => {
        renderComponent({noStoreConfiguration: true})

        const dropdown = screen.getByText('help center 1')
        fireEvent.focus(dropdown)
        const option = screen.getByText('help center 2')
        fireEvent.click(option)

        const saveButton = screen.getByText(/Save Changes/i)
        fireEvent.click(saveButton)

        expect(mockCreateStoreConfiguration).toHaveBeenCalledWith({
            ...INITIAL_FORM_VALUES,
            customToneOfVoiceGuidance: null,
            helpCenterId: 2,
            storeName: 'test-store',
            helpCenter: undefined,
            wizard: undefined,
        })
    })

    it('should show a warning when navigating away without submitting the form', () => {
        renderComponent()

        const dropdown = screen.getByText('help center 1')
        fireEvent.focus(dropdown)
        const option = screen.getByText('help center 2')
        fireEvent.click(option)

        act(() => {
            history.push('/test')
        })

        expect(
            screen.getByText(
                'Your changes to this page will be lost if you don’t save them.'
            )
        ).toBeInTheDocument()
    })

    it('should reset the form when clicking the Cancel button', () => {
        renderComponent()

        const cancelButton = screen.getByText('Cancel')
        expect(cancelButton.closest('button')).toBeAriaDisabled()

        const dropdown = screen.getByText('help center 1')
        fireEvent.focus(dropdown)
        const option = screen.getByText('help center 2')
        fireEvent.click(option)

        expect(dropdown.innerHTML).toEqual('help center 2')
        fireEvent.click(cancelButton)
        expect(dropdown.innerHTML).toEqual('help center 1')
    })

    it('should deactivate the AI Agent when there is no knowledge source connected', () => {
        jest.useFakeTimers().setSystemTime(new Date('2024-10-16'))

        renderComponent({helpCenterId: null})

        const deleteButtons = screen.getAllByLabelText('Delete public URL')
        fireEvent.click(deleteButtons[0])
        fireEvent.click(screen.getByText('Delete'))

        expect(mockUpdateStoreConfiguration).not.toHaveBeenCalled()

        fireEvent.click(deleteButtons[1])
        fireEvent.click(screen.getByText('Delete'))

        expect(mockUpdateStoreConfiguration).toHaveBeenCalledWith({
            ...storeConfiguration,
            helpCenterId: null,
            deactivatedDatetime: new Date('2024-10-16').toISOString(),
            chatChannelDeactivatedDatetime: new Date(
                '2024-10-16'
            ).toISOString(),
            emailChannelDeactivatedDatetime: new Date(
                '2024-10-16'
            ).toISOString(),
            trialModeActivatedDatetime: null,
            previewModeActivatedDatetime: null,
        })

        jest.useRealTimers()
    })
})
