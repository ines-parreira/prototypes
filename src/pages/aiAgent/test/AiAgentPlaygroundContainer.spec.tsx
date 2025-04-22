// must be kept as first import in the file
import 'pages/aiAgent/test/mock-activation-hooks.utils'

import React from 'react'

import { screen, within } from '@testing-library/react'
import { fromJS } from 'immutable'
import { mockFlags } from 'jest-launchdarkly-mock'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'

import { FeatureFlagKey } from 'config/featureFlags'
import { account } from 'fixtures/account'
import { user } from 'fixtures/users'
import useAppDispatch from 'hooks/useAppDispatch'
import {
    useGetAccountConfiguration,
    useGetStoreConfigurationPure,
} from 'models/aiAgent/queries'
import { useAiAgentEnabled } from 'pages/aiAgent/hooks/useAiAgentEnabled'
import { notify } from 'state/notifications/actions'
import { RootState } from 'state/types'
import { assumeMock, renderWithRouter } from 'utils/testing'

import { AI_AGENT, TEST } from '../constants'
import { getAccountConfigurationWithHttpIntegrationFixture } from '../fixtures/accountConfiguration.fixture'
import { getStoreConfigurationFixture } from '../fixtures/storeConfiguration.fixtures'
import { useGetOrCreateSnippetHelpCenter } from '../hooks/useGetOrCreateSnippetHelpCenter'
import { usePublicResources } from '../hooks/usePublicResources'
import { AiAgentPlaygroundContainer } from '../Playground/AiAgentPlaygroundContainer'
import { usePlaygroundMessages } from '../Playground/hooks/usePlaygroundMessages'

const mockStore = configureMockStore()

const defaultState: Partial<RootState> = {
    currentUser: fromJS(user),
    currentAccount: fromJS(account),
}

jest.mock('utils/errors', () => ({
    reportError: jest.fn(),
}))

// Test playground chat in the different file
jest.mock('../Playground/components/PlaygroundChat/PlaygroundChat', () => ({
    PlaygroundChat: jest.fn(() => <div>PlaygroundChat</div>),
}))

jest.mock('hooks/useAppDispatch')
const mockUseAppDispatch = assumeMock(useAppDispatch)

jest.mock('state/notifications/actions')
const mockNotify = assumeMock(notify)

jest.mock('models/aiAgent/queries')
const mockUseGetStoreConfigurationPure = assumeMock(
    useGetStoreConfigurationPure,
)
const mockUseGetAccountConfiguration = assumeMock(useGetAccountConfiguration)

jest.mock('../hooks/usePublicResources')
const mockUsePublicResources = assumeMock(usePublicResources)

jest.mock('../Playground/hooks/usePlaygroundMessages')
const mockUsePlaygroundMessages = assumeMock(usePlaygroundMessages)

jest.mock('../hooks/useGetOrCreateSnippetHelpCenter', () => ({
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

const storeConfiguration = getStoreConfigurationFixture({})

const accountConfiguration = getAccountConfigurationWithHttpIntegrationFixture(
    {},
)

const renderComponent = () => {
    renderWithRouter(
        <Provider store={mockStore(defaultState)}>
            <AiAgentPlaygroundContainer />
        </Provider>,
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
            sourceItems: [{ status: 'done', id: 60 }],
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
            sourceItems: [{ status: 'done', id: 60 }],
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
        expect(screen.getByText('PlaygroundChat')).toBeInTheDocument
    })

    describe.each([
        { flag: true, title: TEST },
        { flag: false, title: AI_AGENT },
    ])(
        'with feature flag conv-ai-standalone-menu = $flag',
        ({ flag, title }) => {
            it('renders component with title = "$title"', () => {
                mockFlags({ [FeatureFlagKey.ConvAiStandaloneMenu]: flag })

                renderComponent()

                expect(
                    within(document.querySelector('.page-header')!).getByText(
                        title,
                    ),
                ).toBeInTheDocument()
            })
        },
    )
})
