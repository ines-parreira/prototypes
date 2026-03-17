import { assumeMock } from '@repo/testing'
import { UserRole } from '@repo/utils'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { fromJS, Map } from 'immutable'
import { Provider } from 'react-redux'
import { Route, StaticRouter, useHistory } from 'react-router-dom'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import { user } from 'fixtures/users'
import { useAiAgentAccess } from 'hooks/aiAgent/useAiAgentAccess'
import type { StoreIntegration } from 'models/integration/types'
import { IntegrationType } from 'models/integration/types'
import { useShouldShowChatSettingsRevamp } from 'pages/integrations/integration/components/gorgias_chat/revamp/hooks/useShouldShowChatSettingsRevamp'
import { useStoreSelector } from 'settings/automate'
import { getHasAutomate } from 'state/billing/selectors'
import type { RootState, StoreDispatch } from 'state/types'
import { renderWithQueryClientProvider } from 'tests/reactQueryTestingUtils'

import { BASE_PATH, OrderManagementSettings } from '../OrderManagementSettings'

jest.mock(
    'pages/integrations/integration/components/gorgias_chat/revamp/hooks/useShouldShowChatSettingsRevamp',
)

jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useHistory: jest.fn(),
}))

jest.mock('settings/automate', () => ({
    ...jest.requireActual('settings/automate'),
    useStoreSelector: jest.fn(),
}))

jest.mock('state/billing/selectors', () => ({ getHasAutomate: jest.fn() }))

jest.mock('hooks/aiAgent/useAiAgentAccess', () => ({
    useAiAgentAccess: jest.fn(),
}))

jest.mock(
    'pages/automate/orderManagement/OrderManagementPreviewProvider',
    () => ({
        __esModule: true,
        default: ({ children }: { children: React.ReactNode }) => (
            <>{children}</>
        ),
    }),
)

jest.mock('pages/automate/orderManagement/OrderManagementView', () => ({
    __esModule: true,
    default: () => <div>OrderManagementView</div>,
}))

const mockUseShouldShowChatSettingsRevamp =
    useShouldShowChatSettingsRevamp as jest.MockedFunction<
        typeof useShouldShowChatSettingsRevamp
    >
const mockUseHistory = useHistory as jest.MockedFunction<typeof useHistory>
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

    let goBack: jest.Mock

    beforeEach(() => {
        onChange = jest.fn()
        goBack = jest.fn()
        mockUseHistory.mockReturnValue({ goBack } as any)
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

        it('should navigate back when the back button is clicked', async () => {
            const user = userEvent.setup()

            renderWithQueryClientProvider(
                <Provider store={mockStore(initialState)}>
                    <StaticRouter location={BASE_PATH}>
                        <Route path={`${BASE_PATH}/:shopType?/:shopName?`}>
                            <OrderManagementSettings />
                        </Route>
                    </StaticRouter>
                </Provider>,
            )

            await user.click(
                screen.getByRole('button', { name: /arrow-left/i }),
            )
            expect(goBack).toHaveBeenCalledTimes(1)
        })
    })
})
