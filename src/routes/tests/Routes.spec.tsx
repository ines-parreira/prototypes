import React, { ComponentType, PropsWithChildren, ReactNode } from 'react'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, render, screen, waitFor } from '@testing-library/react'
import { createBrowserHistory } from 'history'
import { fromJS } from 'immutable'
import { mockFlags } from 'jest-launchdarkly-mock'
import { Provider } from 'react-redux'
import { MemoryRouter, Router } from 'react-router-dom'
import configureMockStore from 'redux-mock-store'

import { logPageChange } from 'common/segment'
import { FeatureFlagKey } from 'config/featureFlags'
import { useFlag } from 'core/flags'
import { account } from 'fixtures/account'
import * as billingFixtures from 'fixtures/billing'
import { billingState } from 'fixtures/billing'
import { user } from 'fixtures/users'
import { ProtectedRoute } from 'pages/stats/report-chart-restrictions/ProtectedRoute'
import { useReportChartRestrictions } from 'pages/stats/report-chart-restrictions/useReportChartRestrictions'
import Routes from 'routes/Routes'
import { StatsRoutes } from 'routes/StatsRoutes'
import { initialState } from 'state/billing/reducers'
import { RootState } from 'state/types'
import { mockQueryClient } from 'tests/reactQueryTestingUtils'
import { assumeMock, renderWithRouter } from 'utils/testing'

jest.mock('routes/settings', () => () => <div>SettingsRoutes</div>)
jest.mock('common/segment')
const logPageMock = assumeMock(logPageChange)

jest.mock('core/flags', () => ({
    useFlag: jest.fn(),
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

jest.mock('routes/StatsRoutes')
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

jest.mock('pages/aiAgent/AiAgentAnalytics', () => ({
    AiAgentAnalytics: () => <div>AiAgentAnalytics</div>,
}))

jest.mock(
    'pages/stats/report-chart-restrictions/useReportChartRestrictions',
    () => ({
        useReportChartRestrictions: jest.fn(),
    }),
)

jest.mock('pages/aiAgent/Overview/middlewares/SalesPaywallMiddleware', () => ({
    SalesPaywallMiddleware:
        (ChildComponent: React.ComponentType<any>) => () => <ChildComponent />,
}))

const useReportChartRestrictionsMock = assumeMock(useReportChartRestrictions)

const mockHistory = createBrowserHistory()
const mockStore = configureMockStore()
const mockUseFlag = useFlag as jest.Mock
jest.mock('pages/stats/report-chart-restrictions/ProtectedRoute')
const ProtectedRouteMock = assumeMock(ProtectedRoute)

window.loadGorgiasChat = jest.fn()

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
        mockHistory.replace('/app')
        StatsRoutesMock.mockImplementation(() => <div />)
        ProtectedRouteMock.mockImplementation(({ children }) => children)
        useReportChartRestrictionsMock.mockReturnValue({
            isModuleRestrictedToCurrentUser: () => false,
        } as any)
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
            mockFlags({
                [FeatureFlagKey.AiAgentKnowledgeTab]: true,
            })

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
            mockFlags({
                [FeatureFlagKey.AiShoppingAssistantEnabled]: true,
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
            mockFlags({
                [FeatureFlagKey.AiShoppingAssistantEnabled]: true,
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

        it('should render analytics page under sales', () => {
            mockFlags({
                [FeatureFlagKey.AiShoppingAssistantEnabled]: true,
            })

            render(
                <Provider store={mockStore(defaultState)}>
                    <MemoryRouter
                        initialEntries={[
                            '/app/ai-agent/shopify/test-shop/sales/analytics',
                        ]}
                    >
                        <Routes />
                    </MemoryRouter>
                </Provider>,
            )

            expect(screen.getByText('AiAgentAnalytics')).toBeInTheDocument()
        })
    })

    describe('AiAgentBaseRoutes', () => {
        jest.mock(
            'pages/aiAgent/Onboarding/hooks/useGetOnboardingData',
            () => ({
                useGetOnboardingData: jest.fn(),
            }),
        )

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

    describe.only('AiJourneyRoutes', () => {
        it('should render AI Journey landing page when feature flag is enabled', () => {
            mockUseFlag.mockReturnValue(true)

            render(
                <Provider store={mockStore(defaultState)}>
                    <MemoryRouter initialEntries={['/app/ai-journey']}>
                        <Routes />
                    </MemoryRouter>
                </Provider>,
            )

            expect(
                screen.getByText('AI Journey Performance'),
            ).toBeInTheDocument()
        })

        it('should redirect to /app when feature flag is disabled', () => {
            mockFlags({
                [FeatureFlagKey.AiJourneyEnabled]: false,
            })

            render(
                <MemoryRouter initialEntries={['/app/ai-journey']}>
                    <Routes />
                </MemoryRouter>,
            )

            expect(mockHistory.location.pathname).toBe('/app')
        })

        it('should render conversation setup page when feature flag is enabled', () => {
            mockUseFlag.mockReturnValue(true)

            render(
                <Provider store={mockStore(defaultState)}>
                    <MemoryRouter
                        initialEntries={['/app/ai-journey/conversation-setup']}
                    >
                        <Routes />
                    </MemoryRouter>
                </Provider>,
            )

            expect(
                screen.getByText('Conversation Setup step'),
            ).toBeInTheDocument()
        })

        it('should render activation page when feature flag is enabled', () => {
            mockUseFlag.mockReturnValue(true)

            render(
                <Provider store={mockStore(defaultState)}>
                    <MemoryRouter
                        initialEntries={['/app/ai-journey/activation']}
                    >
                        <Routes />
                    </MemoryRouter>
                </Provider>,
            )

            expect(screen.getByText('Activation step')).toBeInTheDocument()
        })
    })
})
