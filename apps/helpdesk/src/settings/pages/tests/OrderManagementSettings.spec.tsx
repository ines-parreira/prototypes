import type { ReactNode } from 'react'

import { assumeMock } from '@repo/testing'
import { UserRole } from '@repo/utils'
import { screen } from '@testing-library/react'
import { fromJS, Map } from 'immutable'
import { Provider } from 'react-redux'
import { Route, StaticRouter } from 'react-router-dom'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import { user } from 'fixtures/users'
import { useAiAgentAccess } from 'hooks/aiAgent/useAiAgentAccess'
import type { StoreIntegration } from 'models/integration/types'
import { IntegrationType } from 'models/integration/types'
import { useStoreSelector } from 'settings/automate'
import { getHasAutomate } from 'state/billing/selectors'
import type { RootState, StoreDispatch } from 'state/types'
import { renderWithQueryClientProvider } from 'tests/reactQueryTestingUtils'

import { BASE_PATH, OrderManagementSettings } from '../OrderManagementSettings'

jest.mock(
    'pages/integrations/integration/components/gorgias_chat/revamp/hooks/useShouldShowChatSettingsRevamp',
)

jest.mock('settings/automate', () => ({
    ...jest.requireActual('settings/automate'),
    useStoreSelector: jest.fn(),
}))

jest.mock('state/billing/selectors', () => ({ getHasAutomate: jest.fn() }))

jest.mock('hooks/aiAgent/useAiAgentAccess', () => ({
    useAiAgentAccess: jest.fn(),
}))

jest.mock(
    'pages/automate/orderManagement/legacy/OrderManagementPreviewProvider',
    () => ({
        __esModule: true,
        default: ({ children }: { children: ReactNode }) => <>{children}</>,
    }),
)

jest.mock(
    'pages/automate/orderManagement/OrderManagementViewContainer',
    () => ({
        __esModule: true,
        OrderManagementViewContainer: () => <div>OrderManagementView</div>,
    }),
)

const mockUseShouldShowChatSettingsRevamp = jest.requireMock(
    'pages/integrations/integration/components/gorgias_chat/revamp/hooks/useShouldShowChatSettingsRevamp',
).useShouldShowChatSettingsRevamp as jest.Mock
const getHasAutomateMock = assumeMock(getHasAutomate)
const useStoreSelectorMock = assumeMock(useStoreSelector)
const useAiAgentAccessMock = assumeMock(useAiAgentAccess)

const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([thunk])

const initialState = {
    currentAccount: Map({
        id: 12345,
    }),
    integrations: fromJS({
        integrations: [],
    }),
    billing: fromJS({
        products: [],
    }),
    currentUser: fromJS({
        ...user,
        role: {
            name: UserRole.Agent,
        },
    }),
}

const integrations = [
    {
        id: 1,
        type: IntegrationType.Shopify,
        name: 'my-first-store',
        meta: {},
    },
] as StoreIntegration[]

describe('OrderManagementSettings', () => {
    let onChange: jest.Mock

    beforeEach(() => {
        onChange = jest.fn()
        getHasAutomateMock.mockReturnValue(true)
        useStoreSelectorMock.mockReturnValue({
            integrations,
            onChange,
            selected: undefined,
        })
        useAiAgentAccessMock.mockReturnValue({
            hasAccess: true,
            isLoading: false,
        })
        mockUseShouldShowChatSettingsRevamp.mockReturnValue({
            shouldShowRevampWhenAiAgentEnabled: false,
            shouldShowScreensRevampWhenAiAgentEnabled: false,
            isLoading: false,
            isChatSettingsRevampEnabled: false,
            isChatSettingsScreensRevampEnabled: false,
        })
    })

    describe('legacy header', () => {
        it('should render the header title', () => {
            renderWithQueryClientProvider(
                <Provider store={mockStore(initialState)}>
                    <StaticRouter location={BASE_PATH}>
                        <Route path={`${BASE_PATH}/:shopType?/:shopName?`}>
                            <OrderManagementSettings />
                        </Route>
                    </StaticRouter>
                </Provider>,
            )
            expect(screen.getByText('Order Management')).toBeInTheDocument()
        })

        it('should not render navigation if no store is selected', () => {
            renderWithQueryClientProvider(
                <Provider store={mockStore(initialState)}>
                    <StaticRouter location={BASE_PATH}>
                        <Route path={`${BASE_PATH}/:shopType?/:shopName?`}>
                            <OrderManagementSettings />
                        </Route>
                    </StaticRouter>
                </Provider>,
            )
            expect(screen.queryByText('Configuration')).not.toBeInTheDocument()
        })

        it('should render navigation once a store has been selected', () => {
            useStoreSelectorMock.mockReturnValue({
                integrations,
                onChange,
                selected: integrations[0],
            })

            renderWithQueryClientProvider(
                <Provider store={mockStore(initialState)}>
                    <StaticRouter
                        location={`${BASE_PATH}/shopify/my-first-store`}
                    >
                        <Route path={`${BASE_PATH}/:shopType?/:shopName?`}>
                            <OrderManagementSettings />
                        </Route>
                    </StaticRouter>
                </Provider>,
            )
            expect(screen.getByText('Configuration')).toBeInTheDocument()
            expect(screen.getByText('Channels')).toBeInTheDocument()
        })

        it('should render breadcrumb with page name on a sub-page', () => {
            useStoreSelectorMock.mockReturnValue({
                integrations,
                onChange,
                selected: integrations[0],
            })

            renderWithQueryClientProvider(
                <Provider store={mockStore(initialState)}>
                    <StaticRouter
                        location={`${BASE_PATH}/shopify/my-first-store/track`}
                    >
                        <Route path={`${BASE_PATH}/:shopType?/:shopName?`}>
                            <OrderManagementSettings />
                        </Route>
                    </StaticRouter>
                </Provider>,
            )
            expect(screen.getByText('Order management')).toBeInTheDocument()
            expect(screen.getByText('Track order')).toBeInTheDocument()
        })

        it('should render breadcrumb with scenario on a scenario sub-page', () => {
            useStoreSelectorMock.mockReturnValue({
                integrations,
                onChange,
                selected: integrations[0],
            })

            renderWithQueryClientProvider(
                <Provider store={mockStore(initialState)}>
                    <StaticRouter
                        location={`${BASE_PATH}/shopify/my-first-store/report-issue/new`}
                    >
                        <Route path={`${BASE_PATH}/:shopType?/:shopName?`}>
                            <OrderManagementSettings />
                        </Route>
                    </StaticRouter>
                </Provider>,
            )
            expect(screen.getByText('Report order issue')).toBeInTheDocument()
            expect(screen.getByText(/new/i)).toBeInTheDocument()
        })
    })

    describe('revamp header', () => {
        beforeEach(() => {
            mockUseShouldShowChatSettingsRevamp.mockReturnValue({
                shouldShowRevampWhenAiAgentEnabled: true,
                shouldShowScreensRevampWhenAiAgentEnabled: true,
                isLoading: false,
                isChatSettingsRevampEnabled: false,
                isChatSettingsScreensRevampEnabled: false,
            })
        })

        it('should render the header title', () => {
            renderWithQueryClientProvider(
                <Provider store={mockStore(initialState)}>
                    <StaticRouter location={BASE_PATH}>
                        <Route path={`${BASE_PATH}/:shopType?/:shopName?`}>
                            <OrderManagementSettings />
                        </Route>
                    </StaticRouter>
                </Provider>,
            )
            expect(screen.getByText('Order Management')).toBeInTheDocument()
        })

        it('should not render navigation if no store is selected', () => {
            renderWithQueryClientProvider(
                <Provider store={mockStore(initialState)}>
                    <StaticRouter location={BASE_PATH}>
                        <Route path={`${BASE_PATH}/:shopType?/:shopName?`}>
                            <OrderManagementSettings />
                        </Route>
                    </StaticRouter>
                </Provider>,
            )
            expect(screen.queryByText('Configuration')).not.toBeInTheDocument()
        })

        it('should render navigation once a store has been selected', () => {
            useStoreSelectorMock.mockReturnValue({
                integrations,
                onChange,
                selected: integrations[0],
            })

            renderWithQueryClientProvider(
                <Provider store={mockStore(initialState)}>
                    <StaticRouter
                        location={`${BASE_PATH}/shopify/my-first-store`}
                    >
                        <Route path={`${BASE_PATH}/:shopType?/:shopName?`}>
                            <OrderManagementSettings />
                        </Route>
                    </StaticRouter>
                </Provider>,
            )
            expect(screen.getByText('Configuration')).toBeInTheDocument()
            expect(screen.getByText('Channels')).toBeInTheDocument()
        })
    })
})
