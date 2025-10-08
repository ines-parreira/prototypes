import React, { ComponentType, PropsWithChildren, ReactNode } from 'react'

import { FeatureFlagKey } from '@repo/feature-flags'
import { assumeMock } from '@repo/testing'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, render, screen, waitFor } from '@testing-library/react'
import axios from 'axios'
import { createBrowserHistory, createMemoryHistory } from 'history'
import { fromJS } from 'immutable'
import { Provider } from 'react-redux'
import { MemoryRouter, Router } from 'react-router-dom'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import { IntegrationType } from '@gorgias/helpdesk-types'

import { IntegrationsProvider, TokenProvider } from 'AIJourney/providers'
import { useUpdateJourney } from 'AIJourney/queries'
import { logPageChange } from 'common/segment'
import { useFlag } from 'core/flags'
import { ReportingGranularity } from 'domains/reporting/models/types'
import { ProtectedRoute } from 'domains/reporting/pages/report-chart-restrictions/ProtectedRoute'
import { useReportChartRestrictions } from 'domains/reporting/pages/report-chart-restrictions/useReportChartRestrictions'
import { StatsRoutes } from 'domains/reporting/routes/StatsRoutes'
import { getCleanStatsFiltersWithTimezone } from 'domains/reporting/state/ui/stats/selectors'
import { account } from 'fixtures/account'
import * as billingFixtures from 'fixtures/billing'
import { billingState } from 'fixtures/billing'
import { shopifyProductResult } from 'fixtures/shopify'
import { user } from 'fixtures/users'
import useAllIntegrations from 'hooks/useAllIntegrations'
import { useIsAccountDeactivated } from 'hooks/useIsAccountDeactivated'
import { useListProducts } from 'models/integration/queries'
import { useGetOnboardingData } from 'pages/aiAgent/Onboarding/hooks/useGetOnboardingData'
import Routes from 'routes/Routes'
import { initialState } from 'state/billing/reducers'
import { RootState } from 'state/types'
import { mockQueryClient } from 'tests/reactQueryTestingUtils'
import { renderWithRouter } from 'utils/testing'

jest.mock('routes/settings', () => () => <div>SettingsRoutes</div>)
jest.mock('common/segment')
const logPageMock = assumeMock(logPageChange)

jest.mock('core/flags', () => ({
    useFlag: jest.fn(),
}))

jest.mock('hooks/useIsAccountDeactivated', () => ({
    useIsAccountDeactivated: jest.fn(),
}))

jest.mock(
    'pages/App',
    () =>
        ({
            content: Content,
            children,
        }: {
            content?: ComponentType<any>
            children?: ReactNode
        }) =>
            Content ? <Content /> : children,
)
jest.mock('pages/PanelLayout', () => () => <div>PanelLayout</div>)
jest.mock('pages/settings/yourProfile/YourProfileContainer', () => () => (
    <div>YourProfileContainer</div>
))
jest.mock(
    'pages/automate/actionsPlatform/ActionsPlatformAppsView',
    () => () => <div>ActionsPlatformAppsView</div>,
)
jest.mock(
    'pages/automate/actionsPlatform/ActionsPlatformStepsView',
    () => () => <div>ActionsPlatformStepsView</div>,
)
jest.mock(
    'pages/automate/common/components/AutomateLandingPageContainer',
    () => () => <div>AutomateLandingPageContainer</div>,
)
jest.mock(
    'pages/convert/onboarding/components/ConvertOnboardingView',
    () => () => <div>ConvertOnboardingView</div>,
)
jest.mock(
    'pages/convert/common/components/ConvertNavbar/ConvertNavbar',
    () => () => <div>ConvertNavbar</div>,
)
jest.mock(
    'pages/automate/actionsPlatform/ActionsPlatformCreateAppFormView',
    () => () => <div>ActionsPlatformCreateAppFormView</div>,
)
jest.mock(
    'pages/automate/actionsPlatform/ActionsPlatformEditAppFormView',
    () => () => <div>ActionsPlatformEditAppFormView</div>,
)
jest.mock(
    'pages/aiAgent/providers/AiAgentAccountConfigurationProvider',
    () => ({
        AiAgentAccountConfigurationProvider: ({
            children,
        }: PropsWithChildren<any>) => (
            <>
                <div>AiAgentAccountConfigurationProvider</div>
                <>{children}</>
            </>
        ),
    }),
)
jest.mock(
    'pages/aiAgent/providers/AiAgentStoreConfigurationProvider',
    () =>
        ({ children }: PropsWithChildren<any>) => (
            <>
                <div>AiAgentStoreConfigurationProvider</div>
                <>{children}</>
            </>
        ),
)
jest.mock('pages/aiAgent/AiAgentMainViewContainer', () => () => (
    <div>AiAgentMainViewContainer</div>
))
jest.mock('pages/aiAgent/AiAgentKnowledgeContainer', () => ({
    AiAgentKnowledgeContainer: () => <div>AiAgentKnowledgeContainer</div>,
}))

jest.mock('pages/aiAgent/AiAgentSales', () => ({
    AiAgentSales: () => <div>AiAgentSales</div>,
}))

jest.mock('domains/reporting/routes/StatsRoutes')
const StatsRoutesMock = assumeMock(StatsRoutes)

jest.mock('pages/common/components/Loader/Loader', () => () => (
    <div>Loader</div>
))

jest.mock('pages/aiAgent/components/AiAgentRedirect/AiAgentRedirect', () => ({
    AiAgentRedirect: () => <div>AiAgentRedirect</div>,
}))

jest.mock('pages/aiAgent/AiAgentCustomerEngagement', () => ({
    AiAgentCustomerEngagement: () => <div>AiAgentCustomerEngagement</div>,
}))

jest.mock(
    'domains/reporting/pages/report-chart-restrictions/useReportChartRestrictions',
    () => ({
        useReportChartRestrictions: jest.fn(),
    }),
)

jest.mock('pages/aiAgent/Overview/middlewares/SalesPaywallMiddleware', () => ({
    SalesPaywallMiddleware:
        (ChildComponent: React.ComponentType<any>) => () => <ChildComponent />,
}))

jest.mock(
    'domains/reporting/pages/common/drill-down/DrillDownModal.tsx',
    () => ({
        DrillDownModal: () => null,
    }),
)

jest.mock('hooks/useAllIntegrations', () => ({
    __esModule: true,
    default: jest.fn(),
}))

jest.mock('@gorgias/helpdesk-client', () => ({
    listIntegrations: jest.fn().mockResolvedValue({
        data: {
            data: [
                {
                    id: 1,
                    type: 'shopify',
                    name: 'shopify-store',
                },
            ],
            meta: {},
        },
    }),
}))

jest.mock('domains/reporting/state/ui/stats/selectors')
const getCleanStatsFiltersWithTimezoneMock = assumeMock(
    getCleanStatsFiltersWithTimezone,
)
jest.mock('AIJourney/queries', () => ({
    ...jest.requireActual('AIJourney/queries'),
    useJourneys: jest.fn(),
    useCreateNewJourney: jest.fn(),
    useJourneyData: jest.fn(),
    useUpdateJourney: jest.fn(),
    useSmsIntegrations: jest.fn(),
    useTestSms: jest.fn(),
}))

jest.mock('models/integration/queries')
const useListProductsMock = assumeMock(useListProducts)

const mockUseJourneys = require('AIJourney/queries').useJourneys as jest.Mock
const mockUseJourneyConfiguration = require('AIJourney/queries')
    .useJourneyData as jest.Mock
const mockUseIntegrations = require('AIJourney/providers')
    .useIntegrations as jest.Mock
const mockUseJourneyContext =
    require('AIJourney/providers/JourneyProvider/JourneyProvider')
        .useJourneyContext as jest.Mock

jest.mock('pages/aiAgent/Onboarding/hooks/useGetOnboardingData')
const useGetOnboardingDataMock = assumeMock(useGetOnboardingData)

const useReportChartRestrictionsMock = assumeMock(useReportChartRestrictions)

const mockHistory = createBrowserHistory()
const mockStore = configureMockStore()
const mockUseFlag = useFlag as jest.Mock
const mockUseIsAccountDeactivated = useIsAccountDeactivated as jest.Mock
jest.mock('domains/reporting/pages/report-chart-restrictions/ProtectedRoute')
const ProtectedRouteMock = assumeMock(ProtectedRoute)

;(useAllIntegrations as jest.Mock).mockReturnValue({
    integrations: [
        {
            id: 1,
            type: IntegrationType.Shopify,
            name: 'shopify-store',
            meta: { shop_name: 'shopify-store' },
        },
    ],
    isLoading: false,
})

window.loadGorgiasChat = jest.fn()

jest.mock('AIJourney/providers', () => {
    return {
        ...jest.requireActual('AIJourney/providers'),
        TokenProvider: ({ children }: { children: React.ReactNode }) => (
            <>{children}</>
        ),
        useAccessToken: () => 'test-token',
        useIntegrations: jest.fn(),
    }
})

jest.mock('AIJourney/providers/JourneyProvider/JourneyProvider', () => ({
    JourneyProvider: ({ children }: { children: React.ReactNode }) => children,
    useJourneyContext: jest.fn(),
}))

jest.mock('rest_api/auth', () => ({
    ...jest.requireActual('rest_api/auth'),
    getAccessToken: jest.fn().mockResolvedValue('test-token'),
}))

describe('<Routes/>', () => {
    const defaultState = {
        currentAccount: fromJS({
            current_subscription: {
                products: {},
            },
        }),
        billing: initialState.mergeDeep(billingFixtures.billingState),
    }
    beforeEach(() => {
        mockUseFlag.mockReturnValue(false)
        mockUseIsAccountDeactivated.mockReturnValue(false)
        mockHistory.replace('/app')
        StatsRoutesMock.mockImplementation(() => <div />)
        ProtectedRouteMock.mockImplementation(({ children }) => children)
        useReportChartRestrictionsMock.mockReturnValue({
            isModuleRestrictedToCurrentUser: () => false,
        } as any)

        useGetOnboardingDataMock.mockReturnValue({
            isLoading: false,
            data: undefined,
        })

        jest.mocked(
            require('hooks/useAllIntegrations').default,
        ).mockReturnValue({
            integrations: [
                {
                    id: 1,
                    type: 'shopify',
                    name: 'shopify-store',
                    meta: { shop_name: 'shopify-store' },
                },
            ],
        })
    })

    afterEach(() => {
        window.USER_IMPERSONATED = null
    })

    it('should not log page change via segment on initial render', () => {
        renderWithRouter(
            <Provider store={mockStore({})}>
                <Routes />
            </Provider>,
            { history: mockHistory },
        )
        expect(logPageMock).not.toHaveBeenCalled()
    })

    it('should not log page change after location change', () => {
        renderWithRouter(
            <Provider store={mockStore(defaultState)}>
                <Routes />
            </Provider>,
            {
                history: mockHistory,
            },
        )

        act(() => mockHistory.push('/app/settings/profile'))

        expect(logPageMock).not.toHaveBeenCalled()
    })

    it('should call window.loadGorgiasChat with the param set to false for non-AI Agent routes', () => {
        mockUseFlag.mockReturnValue(true)

        renderWithRouter(
            <Provider store={mockStore({})}>
                <Routes />
            </Provider>,
            {
                history: mockHistory,
            },
        )

        act(() => mockHistory.push('/app/settings/profile'))

        expect(window.loadGorgiasChat).toHaveBeenCalledWith(false)
    })

    it('should call window.loadGorgiasChat for AI Agent routes if the flag is on', () => {
        mockUseFlag.mockReturnValue(true)

        renderWithRouter(
            <Provider store={mockStore({})}>
                <Routes />
            </Provider>,
            {
                history: mockHistory,
            },
        )

        act(() =>
            mockHistory.push('app/automation/shopify/dummystore/ai-agent'),
        )

        expect(window.loadGorgiasChat).toHaveBeenCalledWith(true)
    })

    it('should not call window.loadGorgiasChat if the flag is off', () => {
        mockUseFlag.mockReturnValue(false)

        renderWithRouter(
            <Provider store={mockStore({})}>
                <Routes />
            </Provider>,
            {
                history: mockHistory,
            },
        )

        act(() => mockHistory.push('/app/settings/profile'))
        expect(window.loadGorgiasChat).not.toHaveBeenCalled()

        act(() =>
            mockHistory.push('app/automation/shopify/dummystore/ai-agent'),
        )
        expect(window.loadGorgiasChat).not.toHaveBeenCalled()
    })

    it('should log page change after location change to a tracked page', () => {
        renderWithRouter(
            <Provider store={mockStore(defaultState)}>
                <Routes />
            </Provider>,
            {
                history: mockHistory,
            },
        )

        act(() => mockHistory.push('/app/convert/setup'))

        expect(logPageMock).toHaveBeenCalledTimes(1)
    })

    describe.each([
        {
            route: 'credit-shopify-billing-integration',
            title: 'Credit Shopify billing integration',
        },
        { route: 'create-shopify-charge', title: 'Create Shopify charge' },
        { route: 'remove-shopify-billing', title: 'Remove Shopify Billing' },
    ])('The route $route', ({ route, title }) => {
        const renderRoute = () => {
            renderWithRouter(
                <Provider store={mockStore({ currentUser: fromJS(user) })}>
                    <Routes />
                </Provider>,
                {
                    history: mockHistory,
                },
            )

            act(() => mockHistory.push(`/app/admin/tasks/${route}`))
        }

        it('should be available for impersonated admin users', () => {
            window.USER_IMPERSONATED = true
            renderRoute()
            expect(screen.getByRole('heading', { name: title })).toBeVisible()
        })

        it('should not be available for non-impersonated users', () => {
            window.USER_IMPERSONATED = null
            renderRoute()
            expect(
                screen.queryByRole('heading', { name: title }),
            ).not.toBeInTheDocument()
        })
    })

    describe('actions platform', () => {
        it('should render actions platform steps page if feature flag is toggled on', () => {
            mockUseFlag.mockReturnValue(true)

            renderWithRouter(
                <Provider store={mockStore({})}>
                    <Routes />
                </Provider>,
                {
                    history: mockHistory,
                },
            )

            act(() => {
                mockHistory.push('/app/ai-agent/actions-platform/steps')
            })

            expect(
                screen.getByText('ActionsPlatformStepsView'),
            ).toBeInTheDocument()
        })

        it('should render actions platform apps page if feature flag is toggled on', () => {
            mockUseFlag.mockReturnValue(true)

            renderWithRouter(
                <Provider store={mockStore({})}>
                    <Routes />
                </Provider>,
                {
                    history: mockHistory,
                },
            )

            act(() => {
                mockHistory.push('/app/ai-agent/actions-platform/apps')
            })

            expect(
                screen.getByText('ActionsPlatformAppsView'),
            ).toBeInTheDocument()
        })

        it('should not render actions platform steps page if feature flag is toggled off', () => {
            mockUseFlag.mockReturnValue(false)

            renderWithRouter(
                <Provider store={mockStore({})}>
                    <Routes />
                </Provider>,
                { history: mockHistory },
            )

            act(() => {
                mockHistory.push('/app/ai-agent/actions-platform/steps')
            })

            expect(
                screen.queryByText('ActionsPlatformStepsView'),
            ).not.toBeInTheDocument()
        })

        it('should render actions platform create app page if feature flag is toggled on', () => {
            mockUseFlag.mockReturnValue(true)

            renderWithRouter(
                <Provider store={mockStore({})}>
                    <Routes />
                </Provider>,
                {
                    history: mockHistory,
                },
            )

            act(() => {
                mockHistory.push('/app/ai-agent/actions-platform/apps/new')
            })

            expect(
                screen.getByText('ActionsPlatformCreateAppFormView'),
            ).toBeInTheDocument()
        })

        it('should not render actions platform create app page if feature flag is toggled off', () => {
            mockUseFlag.mockReturnValue(false)

            renderWithRouter(
                <Provider store={mockStore({})}>
                    <Routes />
                </Provider>,
                {
                    history: mockHistory,
                },
            )

            act(() => {
                mockHistory.push('/app/ai-agent/actions-platform/apps/new')
            })

            expect(
                screen.queryByText('ActionsPlatformCreateAppFormView'),
            ).not.toBeInTheDocument()
        })

        it('should render actions platform edit app page if feature flag is toggled on', () => {
            mockUseFlag.mockReturnValue(true)

            renderWithRouter(
                <Provider store={mockStore({})}>
                    <Routes />
                </Provider>,
                {
                    history: mockHistory,
                },
            )

            act(() => {
                mockHistory.push('/app/ai-agent/actions-platform/apps/edit/1')
            })

            expect(
                screen.getByText('ActionsPlatformEditAppFormView'),
            ).toBeInTheDocument()
        })

        it('should not render actions platform edit app page if feature flag is toggled off', () => {
            mockUseFlag.mockReturnValue(false)

            renderWithRouter(
                <Provider store={mockStore({})}>
                    <Routes />
                </Provider>,
                {
                    history: mockHistory,
                },
            )

            act(() => {
                mockHistory.push('/app/ai-agent/actions-platform/apps/edit/1')
            })

            expect(
                screen.queryByText('ActionsPlatformEditAppFormView'),
            ).not.toBeInTheDocument()
        })
    })

    describe('RedirectToAiAgentRoutes', () => {
        const pathsNotToRedirect = [
            '/app/automation/shopify/test-shop/order-management',
            '/app/automation/shopify/test-shop/flows',
            '/app/automation/shopify/test-shop/article-recommendation',
        ]
        it.each(pathsNotToRedirect)('should render Loader for %s', (path) => {
            const { history } = renderWithRouter(
                <Provider store={mockStore({ currentUser: fromJS(user) })}>
                    <Routes />
                </Provider>,
                { route: path },
            )

            expect(history.location.pathname).toBe(path)
            expect(screen.getByText('Loader')).toBeInTheDocument()
        })

        const pathsToRedirect = [
            {
                from: '/app/automation/shopify/test-shop',
                to: '/app/ai-agent/shopify/test-shop',
            },
            {
                from: '/app/automation/shopify/test-shop/knowledge',
                to: '/app/ai-agent/shopify/test-shop/knowledge',
            },
            {
                from: '/app/automation/shopify/test-shop/guidance',
                to: '/app/ai-agent/shopify/test-shop/knowledge/guidance',
            },
            {
                from: '/app/automation/shopify/test-shop/preview-mode',
                to: '/app/ai-agent/shopify/test-shop/settings/preview',
            },
        ]
        it.each(pathsToRedirect)(
            'should redirect $from to $to',
            ({ from, to }) => {
                const { history } = renderWithRouter(
                    <Provider store={mockStore({ currentUser: fromJS(user) })}>
                        <Routes />
                    </Provider>,
                    { route: from },
                )

                expect(history.location.pathname).toBe(to)
            },
        )

        it.each(['/app/automation', '/app/automation/some/other/path'])(
            'should redirect $path to AiAgentRedirect',
            (path) => {
                renderWithRouter(
                    <Provider store={mockStore({ currentUser: fromJS(user) })}>
                        <Routes />
                    </Provider>,
                    { route: path },
                )

                expect(screen.getByText('AiAgentRedirect')).toBeInTheDocument()
            },
        )
    })

    describe('AiAgentRoutes', () => {
        const defaultState: Partial<RootState> = {
            currentUser: fromJS(user),
            currentAccount: fromJS(account),
            billing: fromJS(billingState),
            integrations: fromJS({
                integrations: [],
            }),
        } as unknown as RootState

        it('should render knowledge page on new namespace', () => {
            render(
                <Provider store={mockStore(defaultState)}>
                    <MemoryRouter
                        initialEntries={[
                            '/app/ai-agent/shopify/test-shop/knowledge',
                        ]}
                    >
                        <Routes />
                    </MemoryRouter>
                </Provider>,
            )

            expect(
                screen.getByText('AiAgentKnowledgeContainer'),
            ).toBeInTheDocument()
        })

        it.each([
            {
                from: '/app/automation/shopify/test-shop/ai-agent',
                to: '/app/ai-agent/shopify/test-shop',
            },
            {
                from: '/app/automation/shopify/test-shop/ai-agent/guidance',
                to: '/app/ai-agent/shopify/test-shop/knowledge/guidance',
            },
            {
                from: '/app/automation/shopify/test-shop/ai-agent/actions',
                to: '/app/ai-agent/shopify/test-shop/actions',
            },
            {
                from: '/app/automation/shopify/test-shop/ai-agent/preview-mode',
                to: '/app/ai-agent/shopify/test-shop/settings/preview',
            },
        ])('should redirect to $to when accessing $from', ({ from, to }) => {
            render(
                <QueryClientProvider client={mockQueryClient()}>
                    <Provider store={mockStore(defaultState)}>
                        <Router history={mockHistory}>
                            <Routes />
                        </Router>
                    </Provider>
                </QueryClientProvider>,
            )

            act(() => mockHistory.push(from))

            expect(mockHistory.location.pathname).toBe(to)
        })

        it('should render sales page when flag ai-shopping-assistant-enabled is enabled', () => {
            mockUseFlag.mockImplementation((key) => {
                if (key === FeatureFlagKey.AiShoppingAssistantEnabled) {
                    return true
                }
                return false
            })

            render(
                <Provider store={mockStore(defaultState)}>
                    <MemoryRouter
                        initialEntries={[
                            '/app/ai-agent/shopify/test-shop/sales',
                        ]}
                    >
                        <Routes />
                    </MemoryRouter>
                </Provider>,
            )

            expect(screen.getByText('AiAgentSales')).toBeInTheDocument()
        })

        it('should render customer engagement page under sales', () => {
            mockUseFlag.mockImplementation((key) => {
                if (key === FeatureFlagKey.AiShoppingAssistantEnabled) {
                    return true
                }
                return false
            })

            render(
                <Provider store={mockStore(defaultState)}>
                    <MemoryRouter
                        initialEntries={[
                            '/app/ai-agent/shopify/test-shop/sales/customer-engagement',
                        ]}
                    >
                        <Routes />
                    </MemoryRouter>
                </Provider>,
            )

            expect(
                screen.getByText('AiAgentCustomerEngagement'),
            ).toBeInTheDocument()
        })

        it('should redirect to /intents when accessing /optimize', () => {
            render(
                <QueryClientProvider client={mockQueryClient()}>
                    <Provider store={mockStore(defaultState)}>
                        <Router history={mockHistory}>
                            <Routes />
                        </Router>
                    </Provider>
                </QueryClientProvider>,
            )

            act(() =>
                mockHistory.push('/app/ai-agent/shopify/test-shop/optimize'),
            )

            expect(mockHistory.location.pathname).toBe(
                '/app/ai-agent/shopify/test-shop/intents',
            )
        })

        it('should redirect to /app/stats/ai-sales-agent/overview when accessing /sales/analytics', () => {
            mockUseFlag.mockImplementation((key) => {
                if (key === FeatureFlagKey.AiShoppingAssistantEnabled) {
                    return true
                }
                return false
            })

            render(
                <QueryClientProvider client={mockQueryClient()}>
                    <Provider store={mockStore(defaultState)}>
                        <Router history={mockHistory}>
                            <Routes />
                        </Router>
                    </Provider>
                </QueryClientProvider>,
            )

            act(() =>
                mockHistory.push(
                    '/app/ai-agent/shopify/test-shop/sales/analytics',
                ),
            )

            expect(mockHistory.location.pathname).toBe(
                '/app/stats/ai-sales-agent/overview',
            )
        })

        it('should redirect deactivated accounts to /app/views', () => {
            mockUseIsAccountDeactivated.mockReturnValue(true)

            render(
                <QueryClientProvider client={mockQueryClient()}>
                    <Provider store={mockStore(defaultState)}>
                        <Router history={mockHistory}>
                            <Routes />
                        </Router>
                    </Provider>
                </QueryClientProvider>,
            )

            act(() =>
                mockHistory.push('/app/ai-agent/shopify/test-shop/overview'),
            )

            expect(mockHistory.location.pathname).toBe('/app/views')
        })
    })

    describe('AiAgentBaseRoutes', () => {
        const defaultState: Partial<RootState> = {
            currentUser: fromJS(user),
            currentAccount: fromJS(account),
            billing: fromJS(billingState),
            integrations: fromJS({
                integrations: [],
            }),
        } as unknown as RootState

        const queryClient = new QueryClient()

        it('should redirect /onboarding to /onboarding/skillset', async () => {
            const screen = render(
                <QueryClientProvider client={queryClient}>
                    <Provider store={mockStore(defaultState)}>
                        <MemoryRouter
                            initialEntries={['/app/ai-agent/onboarding']}
                        >
                            <Routes />
                        </MemoryRouter>
                    </Provider>
                </QueryClientProvider>,
            )

            await waitFor(() => {
                expect(
                    screen.getByText(/First, let's connect your/i),
                ).toBeInTheDocument()
            })
        })

        it('should render AiAgentOnboarding for valid onboarding steps', () => {
            const screen = render(
                <QueryClientProvider client={queryClient}>
                    <Provider store={mockStore(defaultState)}>
                        <MemoryRouter
                            initialEntries={[
                                '/app/ai-agent/onboarding/shopify integration',
                            ]}
                        >
                            <Routes />
                        </MemoryRouter>
                    </Provider>
                </QueryClientProvider>,
            )

            expect(screen.getByText(/Shopify account/)).toBeInTheDocument()
        })
    })

    describe('AiJourneyRoutes', () => {
        const mockStore = configureMockStore([thunk])()

        beforeEach(() => {
            jest.spyOn(axios, 'request').mockImplementation((config) => {
                // oxlint-disable-next-line no-console
                console.log('AXIOS REQUEST:', config)
                return Promise.reject(new Error('Mocked network error'))
            })
            ;(useUpdateJourney as jest.Mock).mockReturnValue({
                mutateAsync: jest.fn(),
            })

            const cleanStatsFilters = {
                period: {
                    start_datetime: '1970-01-01T00:00:00+00:00',
                    end_datetime: '1970-01-01T00:00:00+00:00',
                },
            }

            getCleanStatsFiltersWithTimezoneMock.mockReturnValue({
                userTimezone: 'someTimezone',
                cleanStatsFilters,
                granularity: ReportingGranularity.Day,
            })

            mockUseJourneyContext.mockReturnValue({
                journey: { id: 'journey-123', type: 'cart_abandoned' },
                journeyData: {
                    configuration: {
                        max_follow_up_messages: 3,
                        offer_discount: true,
                        max_discount_percent: 20,
                        sms_sender_number: '415-111-111',
                        sms_sender_integration_id: 1,
                    },
                },
                currentIntegration: { id: 1, name: 'shopify-store' },
                shopName: 'shopify-store',
                isLoading: false,
                journeyType: 'cart_abandoned',
                storeConfiguration: {
                    monitoredSmsIntegrations: [1, 2],
                },
            })

            mockUseIntegrations.mockReturnValue({
                currentIntegration: { id: 1, name: 'shopify-store' },
                integrations: [
                    { id: 1, name: 'shopify-store', type: 'shopify' },
                ],
                isLoading: false,
            })

            mockUseJourneyConfiguration.mockImplementation(() => ({
                data: {
                    configuration: {
                        max_follow_up_messages: 3,
                        offer_discount: true,
                        max_discount_percent: 20,
                        sms_sender_number: '415-111-111',
                        sms_sender_integration_id: 1,
                    },
                },
                isError: false,
                isLoading: false,
            }))

            mockUseJourneys.mockImplementation(() => ({
                data: [{ id: 'journey-123', type: 'cart_abandoned' }],
                isError: false,
                isLoading: false,
            }))

            useListProductsMock.mockReturnValue({
                data: {
                    pages: [
                        {
                            data: {
                                data: shopifyProductResult(),
                            },
                        },
                    ],
                },
                isLoading: false,
            } as any)
        })
        const queryClient = new QueryClient()
        it('should redirect to /app when feature flag is disabled', () => {
            mockUseFlag.mockImplementation((key) => {
                if (key === FeatureFlagKey.AiJourneyEnabled) {
                    return false
                }
                return true
            })

            const history = createMemoryHistory({
                initialEntries: ['/app/ai-journey/shopify-store'],
            })

            render(
                <QueryClientProvider client={queryClient}>
                    <Provider store={mockStore}>
                        <Router history={history}>
                            <Routes />
                        </Router>
                    </Provider>
                </QueryClientProvider>,
            )

            expect(mockHistory.location.pathname).toBe('/app')
        })

        it('should render conversation setup page when feature flag is enabled', () => {
            mockUseFlag.mockReturnValue(true)

            const history = createMemoryHistory({
                initialEntries: ['/app/ai-journey/shopify-store/setup'],
            })

            render(
                <Provider store={mockStore}>
                    <QueryClientProvider client={queryClient}>
                        <IntegrationsProvider>
                            <TokenProvider>
                                <Router history={history}>
                                    <Routes />
                                </Router>
                            </TokenProvider>
                        </IntegrationsProvider>
                    </QueryClientProvider>
                </Provider>,
            )

            expect(
                screen.getByText('SMS Abandoned Cart flow'),
            ).toBeInTheDocument()
            expect(screen.getByText('Setup')).toBeInTheDocument()
        })

        it('should render activation page when feature flag is enabled', () => {
            mockUseFlag.mockReturnValue(true)

            const history = createMemoryHistory({
                initialEntries: ['/app/ai-journey/shopify-store/activate'],
            })

            render(
                <Provider store={mockStore}>
                    <QueryClientProvider client={queryClient}>
                        <Router history={history}>
                            <Routes />
                        </Router>
                    </QueryClientProvider>
                </Provider>,
            )

            expect(
                screen.getByText('Give your flow a test run before going live'),
            ).toBeInTheDocument()
            expect(
                screen.getByText(
                    'Receive the test message directly on your phone.',
                ),
            ).toBeInTheDocument()
        })

        it('should redirect to first store when no store is passed in the URL', async () => {
            mockUseFlag.mockReturnValue(true)
            const history = createMemoryHistory({
                initialEntries: ['/app/ai-journey'],
            })

            render(
                <QueryClientProvider client={queryClient}>
                    <Provider store={mockStore}>
                        <Router history={history}>
                            <Routes />
                        </Router>
                    </Provider>
                </QueryClientProvider>,
            )

            await waitFor(() => {
                expect(history.location.pathname).toBe(
                    '/app/ai-journey/shopify-store/performance',
                )
            })
        })

        it('should render performance page', async () => {
            mockUseFlag.mockReturnValue(true)
            const history = createMemoryHistory({
                initialEntries: ['/app/ai-journey/shopify-store/performance'],
            })

            render(
                <Provider store={mockStore}>
                    <QueryClientProvider client={queryClient}>
                        <Router history={history}>
                            <Routes />
                        </Router>
                    </QueryClientProvider>
                </Provider>,
            )

            await waitFor(() => {
                expect(
                    screen.getByText('AI Journey Performance'),
                ).toBeInTheDocument()
            })
        })
    })
})
