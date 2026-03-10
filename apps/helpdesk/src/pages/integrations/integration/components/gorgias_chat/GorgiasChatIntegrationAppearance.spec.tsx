import { history } from '@repo/routing'
import { QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { fromJS } from 'immutable'
import { Provider } from 'react-redux'
import { Router } from 'react-router-dom'
import configureMockStore from 'redux-mock-store'

import { SHOPIFY_INTEGRATION_TYPE } from 'constants/integration'
import { entitiesInitialState } from 'fixtures/entities'
import { user } from 'fixtures/users'
import { useAiAgentAccess } from 'hooks/aiAgent/useAiAgentAccess'
import useShouldShowChatSettingsRevamp from 'pages/integrations/integration/components/gorgias_chat/legacy/hooks/useShouldShowChatSettingsRevamp'
import type { RootState, StoreDispatch } from 'state/types'
import { mockQueryClient } from 'tests/reactQueryTestingUtils'

import { GorgiasChatIntegrationAppearance } from './GorgiasChatIntegrationAppearance'

const mockStore = configureMockStore<RootState, StoreDispatch>()

const defaultState = {
    agents: fromJS({
        all: [user],
    }),
    entities: entitiesInitialState,
    integrations: fromJS({
        integrations: [
            {
                id: 1,
                name: 'myStore1',
                type: SHOPIFY_INTEGRATION_TYPE,
                meta: {
                    shop_name: 'myStore1',
                },
            },
        ],
    }),
    currentAccount: fromJS({
        domain: 'test-domain',
    }),
} as unknown as RootState

jest.mock('@repo/feature-flags')

jest.mock('lodash/uniqueId', () => (id?: string) => `${id || ''}42`)

jest.mock('hooks/aiAgent/useAiAgentAccess', () => ({
    useAiAgentAccess: jest.fn(),
}))

const mockUseAiAgentAccess = jest.mocked(useAiAgentAccess)
const mockUseShouldShowChatSettingsRevamp = jest.mocked(
    useShouldShowChatSettingsRevamp,
)

jest.mock('pages/common/forms/FileField', () => {
    type MockedProps = {
        required: boolean
    }

    const FileFieldMocked = ({ required }: MockedProps) => {
        return (
            <div>
                FileField component is required ? {required ? 'true' : 'false'}
            </div>
        )
    }

    return {
        __esModule: true,
        default: FileFieldMocked,
    }
})

jest.mock(
    'pages/integrations/integration/components/gorgias_chat/legacy/GorgiasChatIntegrationConnectedChannel',
    () => () => {
        return <div data-testid="GorgiasChatIntegrationConnectedChannel" />
    },
)

jest.mock(
    'pages/integrations/integration/components/gorgias_chat/legacy/GorgiasChatIntegrationHeader',
    () => () => {
        return <div data-testid="GorgiasChatIntegrationHeader" />
    },
)

jest.mock(
    'pages/integrations/integration/components/gorgias_chat/legacy/GorgiasChatIntegrationAppearance/revamp/GorgiasChatIntegrationAppearance',
    () => () => {
        return <div data-testid="revamp-appearance" />
    },
)

jest.mock(
    'pages/integrations/integration/components/gorgias_chat/revamp/ChatSettingsAppearanceSkeleton',
    () => ({
        ChatSettingsAppearanceSkeleton: () => (
            <div data-testid="appearance-skeleton" />
        ),
    }),
)

jest.mock(
    'pages/integrations/integration/components/gorgias_chat/legacy/hooks/useShouldShowChatSettingsRevamp',
    () => ({
        __esModule: true,
        default: jest.fn(),
    }),
)

const mockClient = mockQueryClient()

const minProps = {
    integration: fromJS({ id: 1 }),
    isUpdate: false,
    actions: {
        updateOrCreateIntegration: jest.fn(() => Promise.resolve()),
        deleteIntegration: jest.fn(() => Promise.resolve()),
        createGorgiasChatIntegration: jest.fn(() => Promise.resolve()),
    } as any,
    loading: fromJS({ updateIntegration: false }),
    currentUser: fromJS({ name: 'John Doe' }),
}

describe('<GorgiasChatIntegrationAppearance />', () => {
    const realCSS = global.CSS

    beforeEach(() => {
        jest.resetAllMocks()

        const fixedDate = new Date('2019-06-24')
        jest.spyOn(Date, 'now').mockImplementation(() => fixedDate.getTime())

        global.CSS = {
            ...global.CSS,
            supports: (): boolean => true,
            escape: realCSS?.escape,
        }

        mockUseAiAgentAccess.mockReturnValue({
            hasAccess: false,
            isLoading: false,
        })
    })

    afterEach(() => {
        global.CSS = realCSS
    })

    it('should render the skeleton while loading', () => {
        mockUseShouldShowChatSettingsRevamp.mockReturnValue({
            shouldShowRevamp: false,
            shouldShowPreviewForRevamp: false,
            shouldShowRevampWhenAiAgentEnabled: false,
            isLoading: true,
        })

        render(
            <Router history={history}>
                <QueryClientProvider client={mockClient}>
                    <Provider store={mockStore(defaultState)}>
                        <GorgiasChatIntegrationAppearance {...minProps} />
                    </Provider>
                </QueryClientProvider>
            </Router>,
        )

        expect(screen.getByTestId('appearance-skeleton')).toBeInTheDocument()
        expect(
            screen.queryByTestId('revamp-appearance'),
        ).not.toBeInTheDocument()
        expect(screen.queryByText('Chat title')).not.toBeInTheDocument()
    })

    it('should render the skeleton while the integration id is not yet available', () => {
        mockUseShouldShowChatSettingsRevamp.mockReturnValue({
            shouldShowRevamp: false,
            shouldShowPreviewForRevamp: false,
            shouldShowRevampWhenAiAgentEnabled: false,
            isLoading: false,
        })

        render(
            <Router history={history}>
                <QueryClientProvider client={mockClient}>
                    <Provider store={mockStore(defaultState)}>
                        <GorgiasChatIntegrationAppearance
                            {...minProps}
                            integration={fromJS({})}
                        />
                    </Provider>
                </QueryClientProvider>
            </Router>,
        )

        expect(screen.getByTestId('appearance-skeleton')).toBeInTheDocument()
        expect(
            screen.queryByTestId('revamp-appearance'),
        ).not.toBeInTheDocument()
        expect(screen.queryByText('Chat title')).not.toBeInTheDocument()
    })

    it('should render the legacy component when ChatSettingsRevamp flag is disabled', () => {
        mockUseShouldShowChatSettingsRevamp.mockReturnValue({
            shouldShowRevamp: false,
            shouldShowPreviewForRevamp: false,
            shouldShowRevampWhenAiAgentEnabled: false,
            isLoading: false,
        })

        render(
            <Router history={history}>
                <QueryClientProvider client={mockClient}>
                    <Provider store={mockStore(defaultState)}>
                        <GorgiasChatIntegrationAppearance {...minProps} />
                    </Provider>
                </QueryClientProvider>
            </Router>,
        )

        expect(
            screen.queryByTestId('revamp-appearance'),
        ).not.toBeInTheDocument()
        expect(screen.getByText('Chat title')).toBeInTheDocument()
    })

    it('should render the legacy component when flag is enabled but user has no AI Agent access', () => {
        mockUseAiAgentAccess.mockReturnValue({
            hasAccess: false,
            isLoading: false,
        })

        mockUseShouldShowChatSettingsRevamp.mockReturnValue({
            shouldShowRevamp: false,
            shouldShowPreviewForRevamp: false,
            shouldShowRevampWhenAiAgentEnabled: false,
            isLoading: false,
        })

        render(
            <Router history={history}>
                <QueryClientProvider client={mockClient}>
                    <Provider store={mockStore(defaultState)}>
                        <GorgiasChatIntegrationAppearance {...minProps} />
                    </Provider>
                </QueryClientProvider>
            </Router>,
        )

        expect(
            screen.queryByTestId('revamp-appearance'),
        ).not.toBeInTheDocument()
        expect(screen.getByText('Chat title')).toBeInTheDocument()
    })

    it('should render the revamp component when flag is enabled and user has AI Agent access', () => {
        mockUseAiAgentAccess.mockReturnValue({
            hasAccess: true,
            isLoading: false,
        })

        mockUseShouldShowChatSettingsRevamp.mockReturnValue({
            shouldShowRevamp: true,
            shouldShowPreviewForRevamp: true,
            shouldShowRevampWhenAiAgentEnabled: true,
            isLoading: false,
        })

        render(
            <Router history={history}>
                <QueryClientProvider client={mockClient}>
                    <Provider store={mockStore(defaultState)}>
                        <GorgiasChatIntegrationAppearance {...minProps} />
                    </Provider>
                </QueryClientProvider>
            </Router>,
        )

        expect(screen.getByTestId('revamp-appearance')).toBeInTheDocument()
        expect(screen.queryByText('Chat title')).not.toBeInTheDocument()
    })
})
