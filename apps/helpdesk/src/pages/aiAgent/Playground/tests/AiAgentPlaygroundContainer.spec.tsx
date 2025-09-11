// must be kept as first import in the file
import 'pages/aiAgent/test/mock-activation-hooks.utils'

import { assumeMock } from '@repo/testing'
import { QueryClientProvider } from '@tanstack/react-query'
import { screen } from '@testing-library/react'
import { fromJS } from 'immutable'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'

import { toImmutable } from 'common/utils'
import { account } from 'fixtures/account'
import { user } from 'fixtures/users'
import useAppDispatch from 'hooks/useAppDispatch'
import {
    useGetAccountConfiguration,
    useGetStoreConfigurationPure,
} from 'models/aiAgent/queries'
import {
    useStoreActivations,
    useStoreConfigurations,
} from 'pages/aiAgent/Activation/hooks/useStoreActivations'
import { useAiAgentEnabled } from 'pages/aiAgent/hooks/useAiAgentEnabled'
import { notify } from 'state/notifications/actions'
import { RootState } from 'state/types'
import { mockQueryClient } from 'tests/reactQueryTestingUtils'
import { renderWithRouter } from 'utils/testing'

import { TEST } from '../../constants'
import { getAccountConfigurationWithHttpIntegrationFixture } from '../../fixtures/accountConfiguration.fixture'
import { getStoreConfigurationFixture } from '../../fixtures/storeConfiguration.fixtures'
import { useGetOrCreateSnippetHelpCenter } from '../../hooks/useGetOrCreateSnippetHelpCenter'
import { usePublicResources } from '../../hooks/usePublicResources'
import { AiAgentPlaygroundContainer } from '../AiAgentPlaygroundContainer'
import { usePlaygroundMessages } from '../hooks/usePlaygroundMessages'

const mockStore = configureMockStore()

const defaultState: Partial<RootState> = {
    currentUser: fromJS(user),
    currentAccount: fromJS(account),
    integrations: toImmutable({
        integrations: [],
    }),
    billing: toImmutable({
        products: [],
    }),
}

jest.mock('utils/errors', () => ({
    reportError: jest.fn(),
}))

// Test playground chat in the different file
jest.mock('../components/PlaygroundChat/PlaygroundChat', () => ({
    PlaygroundChat: jest.fn(() => <div>PlaygroundChat</div>),
}))

jest.mock(
    '../components/PlaygroundActionsToggle/PlaygroundActionsToggle',
    () => {
        return function MockPlaygroundActionsToggle({ value, onChange }: any) {
            return (
                <div data-testid="playground-actions-toggle">
                    <button onClick={() => onChange(!value)}>
                        Toggle Actions {value ? 'Off' : 'On'}
                    </button>
                </div>
            )
        }
    },
)

jest.mock('hooks/useAppDispatch')
const mockUseAppDispatch = assumeMock(useAppDispatch)

jest.mock('state/notifications/actions')
const mockNotify = assumeMock(notify)

jest.mock('models/aiAgent/queries')
const mockUseGetStoreConfigurationPure = assumeMock(
    useGetStoreConfigurationPure,
)
const mockUseGetAccountConfiguration = assumeMock(useGetAccountConfiguration)

jest.mock('../../hooks/usePublicResources')
const mockUsePublicResources = assumeMock(usePublicResources)

jest.mock('../hooks/usePlaygroundMessages')
const mockUsePlaygroundMessages = assumeMock(usePlaygroundMessages)

jest.mock('../../hooks/useGetOrCreateSnippetHelpCenter', () => ({
    useGetOrCreateSnippetHelpCenter: jest.fn(),
}))
const mockUseGetOrCreateSnippetHelpCenter = jest.mocked(
    useGetOrCreateSnippetHelpCenter,
)
jest.mock('pages/aiAgent/hooks/useAiAgentEnabled')
const mockUseEnableAiAgent = jest.mocked(useAiAgentEnabled)

jest.mock('pages/aiAgent/hooks/useAccountStoreConfiguration', () => ({
    useAccountStoreConfiguration: () => ({
        aiAgentTicketViewId: 1,
    }),
}))
jest.mock('pages/aiAgent/Activation/hooks/useStoreActivations.ts')
const queryClient = mockQueryClient()

const storeConfiguration = getStoreConfigurationFixture({})

const accountConfiguration = getAccountConfigurationWithHttpIntegrationFixture(
    {},
)
const useStoreActivationsMock = assumeMock(useStoreActivations)
const useStoreConfigurationsMock = assumeMock(useStoreConfigurations)
useStoreConfigurationsMock.mockReturnValue({
    storeConfigurations: [],
} as any)
useStoreActivationsMock.mockReturnValue({
    storeActivations: {},
} as any)

const renderComponent = () => {
    renderWithRouter(
        <QueryClientProvider client={queryClient}>
            <Provider store={mockStore(defaultState)}>
                <AiAgentPlaygroundContainer />
            </Provider>
        </QueryClientProvider>,
        {
            path: `/app/automation/:shopType/:shopName/ai-agent/test`,
            route: '/app/automation/shopify/gorgias-product-demo/ai-agent/test',
        },
    )
}

describe('AiAgentPlayground', () => {
    beforeEach(() => {
        mockUseEnableAiAgent.mockReturnValue({
            updateSettingsAfterAiAgentEnabled: jest.fn(),
        })

        mockUseAppDispatch.mockReturnValue(jest.fn())
    })

    it('renders loader if data is fetching', () => {
        mockUseGetStoreConfigurationPure.mockReturnValue({
            data: undefined,
            error: undefined,
            isLoading: true,
        } as unknown as ReturnType<typeof useGetStoreConfigurationPure>)

        mockUseGetAccountConfiguration.mockReturnValue({
            data: undefined,
            error: undefined,
            isLoading: true,
        } as unknown as ReturnType<typeof useGetAccountConfiguration>)

        mockUseGetOrCreateSnippetHelpCenter.mockReturnValue({
            isLoading: false,
            helpCenter: { id: 1 },
        } as unknown as ReturnType<typeof useGetOrCreateSnippetHelpCenter>)

        renderComponent()

        expect(screen.getByText('Loading...')).toBeInTheDocument()
    })

    it('should notify when account configuration is exists but no http integration', () => {
        mockUseGetOrCreateSnippetHelpCenter.mockReturnValue({
            isLoading: false,
            helpCenter: { id: 1 },
        } as unknown as ReturnType<typeof useGetOrCreateSnippetHelpCenter>)

        mockUseGetStoreConfigurationPure.mockReturnValue({
            data: {
                data: {
                    storeConfiguration,
                },
            },
            error: undefined,
            isLoading: false,
        } as unknown as ReturnType<typeof useGetStoreConfigurationPure>)

        mockUseGetAccountConfiguration.mockReturnValue({
            data: {
                data: {
                    accountConfiguration: {
                        ...accountConfiguration,
                        httpIntegration: null,
                    },
                },
            },
            error: undefined,
            isLoading: false,
        } as unknown as ReturnType<typeof useGetAccountConfiguration>)

        renderComponent()

        expect(mockNotify).toHaveBeenCalledWith(
            expect.objectContaining({
                message:
                    'There was an error initializing the AI Agent Test mode',
            }),
        )
    })

    it('renders playground if knowledge base is present', () => {
        mockUseGetStoreConfigurationPure.mockReturnValue({
            data: {
                data: {
                    storeConfiguration,
                },
            },
            error: undefined,
            isLoading: false,
        } as unknown as ReturnType<typeof useGetStoreConfigurationPure>)

        mockUseGetAccountConfiguration.mockReturnValue({
            data: { data: { accountConfiguration } },
            error: undefined,
            isLoading: false,
        } as unknown as ReturnType<typeof useGetAccountConfiguration>)

        mockUseGetOrCreateSnippetHelpCenter.mockReturnValue({
            isLoading: false,
            helpCenter: { id: 1 },
        } as unknown as ReturnType<typeof useGetOrCreateSnippetHelpCenter>)

        mockUsePublicResources.mockReturnValue({
            sourceItems: [
                {
                    status: 'done',
                    id: 60,
                    createdDatetime: '2021-01-01T00:00:00.000Z',
                },
            ],
            isSourceItemsListLoading: false,
        })

        mockUsePlaygroundMessages.mockReturnValue({
            messages: [],
            isMessageSending: false,
            onMessageSend: jest.fn(),
            onNewConversation: jest.fn(),
            isWaitingResponse: false,
        })

        renderComponent()

        expect(screen.getByText('PlaygroundChat')).toBeInTheDocument()
    })

    it('renders alert of missing knowledge base if there is no knowledge base', () => {
        mockUseGetStoreConfigurationPure.mockReturnValue({
            data: {
                data: {
                    storeConfiguration: {
                        ...storeConfiguration,
                        helpCenterId: null,
                    },
                },
            },
            error: undefined,
            isLoading: false,
        } as unknown as ReturnType<typeof useGetStoreConfigurationPure>)
        mockUseGetAccountConfiguration.mockReturnValue({
            data: { data: { accountConfiguration } },
            error: undefined,
            isLoading: false,
        } as unknown as ReturnType<typeof useGetAccountConfiguration>)
        mockUsePublicResources.mockReturnValue({
            sourceItems: [],
            isSourceItemsListLoading: false,
        })
        mockUseGetOrCreateSnippetHelpCenter.mockReturnValue({
            isLoading: false,
            helpCenter: null,
        } as unknown as ReturnType<typeof useGetOrCreateSnippetHelpCenter>)
        renderComponent()
        expect(screen.getByRole('alert')).toHaveTextContent(
            'Test AI Agent as a customerAt least one knowledge source is required to use test mode',
        )
    })

    it('renders playground if knowledge base is present', () => {
        mockUseGetStoreConfigurationPure.mockReturnValue({
            data: {
                data: {
                    storeConfiguration,
                },
            },
            error: undefined,
            isLoading: false,
        } as unknown as ReturnType<typeof useGetStoreConfigurationPure>)
        mockUseGetAccountConfiguration.mockReturnValue({
            data: { data: { accountConfiguration } },
            error: undefined,
            isLoading: false,
        } as unknown as ReturnType<typeof useGetAccountConfiguration>)
        mockUseGetOrCreateSnippetHelpCenter.mockReturnValue({
            isLoading: false,
            helpCenter: { id: 1 },
        } as unknown as ReturnType<typeof useGetOrCreateSnippetHelpCenter>)
        mockUsePublicResources.mockReturnValue({
            sourceItems: [
                {
                    status: 'done',
                    id: 60,
                    createdDatetime: '2021-01-01T00:00:00.000Z',
                },
            ],
            isSourceItemsListLoading: false,
        })
        mockUsePlaygroundMessages.mockReturnValue({
            messages: [],
            isMessageSending: false,
            onMessageSend: jest.fn(),
            onNewConversation: jest.fn(),
            isWaitingResponse: false,
        })
        renderComponent()
        expect(screen.getByText('PlaygroundChat')).toBeInTheDocument()
        expect(
            screen.getByText(TEST, { selector: '.page-header *' }),
        ).toBeInTheDocument()
    })

    it('renders PlaygroundActionsToggle in the header', () => {
        mockUseGetStoreConfigurationPure.mockReturnValue({
            data: {
                data: {
                    storeConfiguration,
                },
            },
            error: undefined,
            isLoading: false,
        } as unknown as ReturnType<typeof useGetStoreConfigurationPure>)
        mockUseGetAccountConfiguration.mockReturnValue({
            data: { data: { accountConfiguration } },
            error: undefined,
            isLoading: false,
        } as unknown as ReturnType<typeof useGetAccountConfiguration>)
        mockUseGetOrCreateSnippetHelpCenter.mockReturnValue({
            isLoading: false,
            helpCenter: { id: 1 },
        } as unknown as ReturnType<typeof useGetOrCreateSnippetHelpCenter>)
        mockUsePublicResources.mockReturnValue({
            sourceItems: [
                {
                    status: 'done',
                    id: 60,
                    createdDatetime: '2021-01-01T00:00:00.000Z',
                },
            ],
            isSourceItemsListLoading: false,
        })
        mockUsePlaygroundMessages.mockReturnValue({
            messages: [],
            isMessageSending: false,
            onMessageSend: jest.fn(),
            onNewConversation: jest.fn(),
            isWaitingResponse: false,
        })
        renderComponent()

        expect(
            screen.getByTestId('playground-actions-toggle'),
        ).toBeInTheDocument()
        expect(screen.getByText('Toggle Actions On')).toBeInTheDocument()
    })
})
