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
import { useShouldShowChatSettingsRevamp } from 'pages/integrations/integration/components/gorgias_chat/revamp/hooks/useShouldShowChatSettingsRevamp'
import { useStoreIntegration } from 'pages/integrations/integration/hooks/useStoreIntegration'
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

jest.mock('lodash/uniqueId', () => (id?: string) => `${id || ''}42`)

jest.mock(
    'pages/integrations/integration/components/gorgias_chat/revamp/hooks/useShouldShowChatSettingsRevamp',
)

jest.mock('pages/integrations/integration/hooks/useStoreIntegration')

const mockUseShouldShowChatSettingsRevamp =
    useShouldShowChatSettingsRevamp as jest.MockedFunction<
        typeof useShouldShowChatSettingsRevamp
    >

const mockUseStoreIntegration = useStoreIntegration as jest.MockedFunction<
    typeof useStoreIntegration
>

jest.mock('hooks/useAppSelector', () => jest.fn(() => fromJS({})))

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
        return <div data-testid="legacy-revamp-appearance" />
    },
)

jest.mock(
    'pages/integrations/integration/components/gorgias_chat/revamp/components/GorgiasChatIntegrationAppearance/ChatSettingsAppearanceSkeleton',
    () => ({
        ChatSettingsAppearanceSkeleton: () => (
            <div data-testid="appearance-skeleton" />
        ),
    }),
)

jest.mock(
    'pages/integrations/integration/components/gorgias_chat/revamp/GorgiasChatIntegrationAppearance',
    () => ({
        GorgiasChatIntegrationAppearanceRevamp: () => {
            return <div data-testid="new-revamp-appearance" />
        },
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

        mockUseStoreIntegration.mockReturnValue({
            storeIntegration: undefined,
            isConnected: false,
            isConnectedToShopify: false,
        })

        mockUseShouldShowChatSettingsRevamp.mockReturnValue({
            isChatSettingsRevampEnabled: false,
            isChatSettingsScreensRevampEnabled: false,
            shouldShowRevampWhenAiAgentEnabled: false,
            shouldShowScreensRevampWhenAiAgentEnabled: false,
            isLoading: false,
        })
    })

    afterEach(() => {
        global.CSS = realCSS
    })

    it('should render the skeleton while the integration id is not yet available', () => {
        mockUseShouldShowChatSettingsRevamp.mockReturnValue({
            isChatSettingsRevampEnabled: false,
            isChatSettingsScreensRevampEnabled: false,
            shouldShowRevampWhenAiAgentEnabled: false,
            shouldShowScreensRevampWhenAiAgentEnabled: false,
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
            screen.queryByTestId('new-revamp-appearance'),
        ).not.toBeInTheDocument()
        expect(
            screen.queryByTestId('old-revamp-appearance'),
        ).not.toBeInTheDocument()
        expect(screen.queryByText('Chat title')).not.toBeInTheDocument()
    })

    it('should render the skeleton while the revamp hooks are loading', () => {
        mockUseShouldShowChatSettingsRevamp.mockReturnValue({
            isChatSettingsRevampEnabled: false,
            isChatSettingsScreensRevampEnabled: false,
            shouldShowRevampWhenAiAgentEnabled: false,
            shouldShowScreensRevampWhenAiAgentEnabled: false,
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
            screen.queryByTestId('new-revamp-appearance'),
        ).not.toBeInTheDocument()
        expect(
            screen.queryByTestId('legacy-revamp-appearance'),
        ).not.toBeInTheDocument()
        expect(screen.queryByText('Chat title')).not.toBeInTheDocument()
    })

    it('should render the legacy component when shouldShowRevampWhenAiAgentEnabled is false', () => {
        mockUseShouldShowChatSettingsRevamp.mockReturnValue({
            isChatSettingsRevampEnabled: false,
            isChatSettingsScreensRevampEnabled: false,
            shouldShowRevampWhenAiAgentEnabled: false,
            shouldShowScreensRevampWhenAiAgentEnabled: false,
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
            screen.queryByTestId('new-revamp-appearance'),
        ).not.toBeInTheDocument()
        expect(
            screen.queryByTestId('legacy-revamp-appearance'),
        ).not.toBeInTheDocument()
        expect(screen.getByText('Chat title')).toBeInTheDocument()
    })

    it('should render the legacy revamp component when shouldShowRevampWhenAiAgentEnabled is true but shouldShowScreensRevampWhenAiAgentEnabled is false', () => {
        mockUseShouldShowChatSettingsRevamp.mockReturnValue({
            isChatSettingsRevampEnabled: true,
            isChatSettingsScreensRevampEnabled: false,
            shouldShowRevampWhenAiAgentEnabled: true,
            shouldShowScreensRevampWhenAiAgentEnabled: false,
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
            screen.getByTestId('legacy-revamp-appearance'),
        ).toBeInTheDocument()
        expect(
            screen.queryByTestId('new-revamp-appearance'),
        ).not.toBeInTheDocument()
        expect(screen.queryByText('Chat title')).not.toBeInTheDocument()
    })

    it('should render the new revamp component when shouldShowScreensRevampWhenAiAgentEnabled is true', () => {
        mockUseShouldShowChatSettingsRevamp.mockReturnValue({
            isChatSettingsRevampEnabled: true,
            isChatSettingsScreensRevampEnabled: true,
            shouldShowRevampWhenAiAgentEnabled: true,
            shouldShowScreensRevampWhenAiAgentEnabled: true,
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

        expect(screen.getByTestId('new-revamp-appearance')).toBeInTheDocument()
        expect(
            screen.queryByTestId('legacy-revamp-appearance'),
        ).not.toBeInTheDocument()
        expect(screen.queryByText('Chat title')).not.toBeInTheDocument()
    })
})
