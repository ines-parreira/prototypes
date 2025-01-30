import {QueryClientProvider} from '@tanstack/react-query'
import {act, render, screen} from '@testing-library/react'
import {createBrowserHistory} from 'history'
import {fromJS, Map} from 'immutable'
import {mockFlags} from 'jest-launchdarkly-mock'

import React, {ComponentType, PropsWithChildren, ReactNode} from 'react'
import {Provider} from 'react-redux'
import {MemoryRouter, Router} from 'react-router-dom'
import configureMockStore from 'redux-mock-store'

import {logPageChange} from 'common/segment'
import {FeatureFlagKey} from 'config/featureFlags'
import {UserRole} from 'config/types/user'
import {useFlag} from 'core/flags'
import {account} from 'fixtures/account'
import * as billingFixtures from 'fixtures/billing'
import {billingState} from 'fixtures/billing'
import {
    AUTOMATION_PRODUCT_ID,
    basicMonthlyAutomationPlan,
    basicMonthlyHelpdeskPlan,
    HELPDESK_PRODUCT_ID,
} from 'fixtures/productPrices'
import {user} from 'fixtures/users'
import {useAiAgentItemEnabled} from 'pages/aiAgent/hooks/useAiAgentItemEnabled'
import {CustomReportPage} from 'pages/stats/custom-reports/CustomReportPage'
import {CustomReports} from 'pages/stats/custom-reports/CustomReports'
import LiveOverview from 'pages/stats/LiveOverview'
import SatisfactionReport from 'pages/stats/quality-management/satisfaction/SatisfactionReport'
import {ServiceLevelAgreements} from 'pages/stats/sla/ServiceLevelAgreements'
import AutoQA from 'pages/stats/support-performance/auto-qa/AutoQA'
import {ChannelsReport} from 'pages/stats/support-performance/channels/ChannelsReport'
import {Tags} from 'pages/stats/ticket-insights/tags/Tags'
import Routes from 'routes/Routes'
import {initialState} from 'state/billing/reducers'
import {RootState} from 'state/types'
import {mockQueryClient} from 'tests/reactQueryTestingUtils'
import {assumeMock, renderWithRouter, renderWithStore} from 'utils/testing'

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
            Content ? <Content /> : children
)
jest.mock('pages/PanelLayout', () => () => <div>PanelLayout</div>)
jest.mock('pages/stats/DefaultStatsFilters', () => () => (
    <div>Default stats filters</div>
))
jest.mock('pages/settings/yourProfile/YourProfileContainer', () => () => (
    <div>YourProfileContainer</div>
))
jest.mock(
    'pages/automate/actionsPlatform/ActionsPlatformAppsView',
    () => () => <div>ActionsPlatformAppsView</div>
)
jest.mock(
    'pages/automate/actionsPlatform/ActionsPlatformTemplatesView',
    () => () => <div>ActionsPlatformTemplatesView</div>
)
jest.mock(
    'pages/automate/common/components/AutomateLandingPageContainer',
    () => () => <div>AutomateLandingPageContainer</div>
)
jest.mock(
    'pages/convert/onboarding/components/ConvertOnboardingView',
    () => () => <div>ConvertOnboardingView</div>
)
jest.mock(
    'pages/convert/common/components/ConvertNavbar/ConvertNavbar',
    () => () => <div>ConvertNavbar</div>
)
jest.mock('pages/stats/voice/pages/LiveVoice', () => () => <div>LiveVoice</div>)
jest.mock(
    'pages/automate/actionsPlatform/ActionsPlatformCreateAppFormView',
    () => () => <div>ActionsPlatformCreateAppFormView</div>
)
jest.mock(
    'pages/automate/actionsPlatform/ActionsPlatformEditAppFormView',
    () => () => <div>ActionsPlatformEditAppFormView</div>
)
jest.mock('pages/stats/automate/ai-agent/AutomateAiAgentStats', () => () => (
    <div>AutomateAiAgentStats</div>
))
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
    })
)
jest.mock(
    'pages/aiAgent/providers/AiAgentStoreConfigurationProvider',
    () =>
        ({children}: PropsWithChildren<any>) => (
            <>
                <div>AiAgentStoreConfigurationProvider</div>
                <>{children}</>
            </>
        )
)
jest.mock('pages/aiAgent/AiAgentKnowledgeContainer', () => ({
    AiAgentKnowledgeContainer: () => <div>AiAgentKnowledgeContainer</div>,
}))
jest.mock(
    'pages/stats/DefaultStatsFilters',
    () =>
        ({children}: PropsWithChildren<any>) => (
            <>
                <div>Default stats filters</div>
                <>{children}</>
            </>
        )
)
jest.mock(
    'pages/stats/automate/ai-agent/AiAgentStatsFilters',
    () =>
        ({children}: PropsWithChildren<any>) => (
            <>
                <div>AI Agent stats filters</div>
                <>{children}</>
            </>
        )
)
jest.mock('pages/stats/custom-reports/CustomReportPage')
const CustomReportPageMock = assumeMock(CustomReportPage)
jest.mock('pages/stats/support-performance/channels/ChannelsReport')
const ChannelsReportMock = assumeMock(ChannelsReport)
jest.mock('pages/stats/sla/ServiceLevelAgreements')
const ServiceLevelAgreementsMock = assumeMock(ServiceLevelAgreements)
jest.mock('pages/stats/support-performance/auto-qa/AutoQA')
const AutoQAMock = assumeMock(AutoQA)
jest.mock('pages/stats/LiveOverview')
const LiveOverviewMock = assumeMock(LiveOverview)
jest.mock('pages/stats/ticket-insights/tags/Tags')
const TagsMock = assumeMock(Tags)
jest.mock('pages/stats/quality-management/satisfaction/SatisfactionReport')
const SatisfactionMock = assumeMock(SatisfactionReport)
jest.mock('pages/stats/custom-reports/CustomReports')
const CustomReportsMock = assumeMock(CustomReports)

jest.mock('pages/aiAgent/hooks/useAiAgentItemEnabled')
const useAiAgentItemEnabledMock = assumeMock(useAiAgentItemEnabled)

const mockHistory = createBrowserHistory()
const mockStore = configureMockStore()
const mockUseFlag = useFlag as jest.Mock

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

        ChannelsReportMock.mockImplementation(() => <div />)
        ServiceLevelAgreementsMock.mockImplementation(() => <div />)
        AutoQAMock.mockImplementation(() => <div />)
        SatisfactionMock.mockImplementation(() => <div />)
        TagsMock.mockImplementation(() => <div />)
        LiveOverviewMock.mockImplementation(() => <div />)
        CustomReportPageMock.mockImplementation(() => <div />)
        CustomReportsMock.mockImplementation(() => <div />)

        useAiAgentItemEnabledMock.mockReturnValue(false)
    })

    afterEach(() => {
        window.USER_IMPERSONATED = null
    })

    it('should not log page change via segment on initial render', () => {
        renderWithRouter(
            <Provider store={mockStore({})}>
                <Routes />
            </Provider>,
            {history: mockHistory}
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
            }
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
            }
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
            }
        )

        act(() =>
            mockHistory.push('app/automation/shopify/dummystore/ai-agent')
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
            }
        )

        act(() => mockHistory.push('/app/settings/profile'))
        expect(window.loadGorgiasChat).not.toHaveBeenCalled()

        act(() =>
            mockHistory.push('app/automation/shopify/dummystore/ai-agent')
        )
        expect(window.loadGorgiasChat).not.toHaveBeenCalled()
    })

    it.each(['/app/stats/live-overview', '/app/convert/setup'])(
        'should log page change after location change to a tracked page',
        (path) => {
            renderWithRouter(
                <Provider store={mockStore(defaultState)}>
                    <Routes />
                </Provider>,
                {
                    history: mockHistory,
                }
            )

            act(() => mockHistory.push(path))

            expect(logPageMock).toHaveBeenCalledTimes(1)
        }
    )

    describe.each([
        {
            route: 'credit-shopify-billing-integration',
            title: 'Credit Shopify billing integration',
        },
        {route: 'create-shopify-charge', title: 'Create Shopify charge'},
        {route: 'remove-shopify-billing', title: 'Remove Shopify Billing'},
    ])('The route $route', ({route, title}) => {
        const renderRoute = () => {
            renderWithRouter(
                <Provider store={mockStore({currentUser: fromJS(user)})}>
                    <Routes />
                </Provider>,
                {
                    history: mockHistory,
                }
            )

            act(() => mockHistory.push(`/app/admin/tasks/${route}`))
        }

        it('should be available for impersonated admin users', () => {
            window.USER_IMPERSONATED = true
            renderRoute()
            expect(screen.getByRole('heading', {name: title})).toBeVisible()
        })

        it('should not be available for non-impersonated users', () => {
            window.USER_IMPERSONATED = null
            renderRoute()
            expect(
                screen.queryByRole('heading', {name: title})
            ).not.toBeInTheDocument()
        })
    })

    describe('actions platform', () => {
        it('should render actions platform templates page if feature flag is toggled on', () => {
            mockUseFlag.mockReturnValue(true)

            renderWithRouter(
                <Provider store={mockStore({})}>
                    <Routes />
                </Provider>,
                {
                    history: mockHistory,
                }
            )

            act(() => {
                mockHistory.push('/app/automation/actions-platform')
            })

            expect(
                screen.getByText('ActionsPlatformTemplatesView')
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
                }
            )

            act(() => {
                mockHistory.push('/app/automation/actions-platform/apps')
            })

            expect(
                screen.getByText('ActionsPlatformAppsView')
            ).toBeInTheDocument()
        })

        it('should render not actions platform templates page if feature flag is toggled off', () => {
            mockUseFlag.mockReturnValue(false)

            renderWithRouter(
                <Provider store={mockStore({})}>
                    <Routes />
                </Provider>,
                {
                    history: mockHistory,
                }
            )

            act(() => {
                mockHistory.push('/app/automation/actions-platform')
            })

            expect(
                screen.queryByText('ActionsPlatformTemplatesView')
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
                }
            )

            act(() => {
                mockHistory.push('/app/automation/actions-platform/apps/new')
            })

            expect(
                screen.getByText('ActionsPlatformCreateAppFormView')
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
                }
            )

            act(() => {
                mockHistory.push('/app/automation/actions-platform/apps/new')
            })

            expect(
                screen.queryByText('ActionsPlatformCreateAppFormView')
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
                }
            )

            act(() => {
                mockHistory.push('/app/automation/actions-platform/apps/edit/1')
            })

            expect(
                screen.getByText('ActionsPlatformEditAppFormView')
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
                }
            )

            act(() => {
                mockHistory.push('/app/automation/actions-platform/apps/edit/1')
            })

            expect(
                screen.queryByText('ActionsPlatformEditAppFormView')
            ).not.toBeInTheDocument()
        })
    })

    describe('StatsRoutes', () => {
        const state = {
            currentAccount: fromJS({
                current_subscription: {
                    products: {
                        [HELPDESK_PRODUCT_ID]:
                            basicMonthlyHelpdeskPlan.price_id,
                    },
                },
            }),
            billing: initialState.mergeDeep(billingFixtures.billingState),
        }
        it('should render Channels page', () => {
            renderWithStore(
                <MemoryRouter initialEntries={['/app/stats/channels']}>
                    <Routes />
                </MemoryRouter>,
                state
            )

            expect(ChannelsReportMock).toHaveBeenCalled()
        })

        it('should render SLAs page', () => {
            renderWithStore(
                <MemoryRouter initialEntries={['/app/stats/slas']}>
                    <Routes />
                </MemoryRouter>,
                state
            )

            expect(ServiceLevelAgreementsMock).toHaveBeenCalled()
        })

        it.each([UserRole.Agent, UserRole.Admin])(
            'should render AutoQA page',
            (role) => {
                const state = {
                    currentUser: fromJS({
                        role: {name: role},
                    }) as Map<any, any>,
                    currentAccount: fromJS({
                        current_subscription: {
                            products: {
                                [AUTOMATION_PRODUCT_ID]:
                                    basicMonthlyAutomationPlan.price_id,
                            },
                        },
                    }),
                    billing: initialState.mergeDeep(
                        billingFixtures.billingState
                    ),
                }
                mockFlags({
                    [FeatureFlagKey.AnalyticsAutoQA]: true,
                })

                renderWithStore(
                    <MemoryRouter initialEntries={['/app/stats/auto-qa']}>
                        <Routes />
                    </MemoryRouter>,
                    state
                )

                expect(AutoQAMock).toHaveBeenCalled()
            }
        )

        it('should render New Satisfaction page', () => {
            mockFlags({
                [FeatureFlagKey.NewSatisfactionReport]: true,
            })

            renderWithStore(
                <MemoryRouter
                    initialEntries={[
                        '/app/stats/quality-management-satisfaction',
                    ]}
                >
                    <Routes />
                </MemoryRouter>,
                state
            )

            expect(SatisfactionMock).toHaveBeenCalled()
        })

        it('should render NewTagsPage page', () => {
            renderWithStore(
                <MemoryRouter initialEntries={['/app/stats/tags']}>
                    <Routes />
                </MemoryRouter>,
                state
            )

            expect(TagsMock).toHaveBeenCalled()
        })

        it('should render Automate AI Agent page', () => {
            mockFlags({
                [FeatureFlagKey.AIAgentStatsPage]: true,
            })

            renderWithStore(
                <MemoryRouter initialEntries={['/app/stats/automate-ai-agent']}>
                    <Routes />
                </MemoryRouter>,
                state
            )

            expect(
                screen.getByText('AI Agent stats filters')
            ).toBeInTheDocument()
            expect(screen.getByText('AutomateAiAgentStats')).toBeInTheDocument()
        })

        it('should render Live Voice page', () => {
            renderWithStore(
                <MemoryRouter initialEntries={['/app/stats/live-voice']}>
                    <Routes />
                </MemoryRouter>,
                state
            )

            expect(screen.getByText('LiveVoice')).toBeInTheDocument()
        })

        it('should render Custom Reports page', () => {
            mockFlags({
                [FeatureFlagKey.AnalyticsCustomReports]: true,
            })

            renderWithStore(
                <MemoryRouter
                    initialEntries={['/app/stats/custom-reports/new']}
                >
                    <Routes />
                </MemoryRouter>,
                state
            )

            expect(CustomReportsMock).toHaveBeenCalled()
        })

        it('should render Custom Report page', () => {
            mockFlags({
                [FeatureFlagKey.AnalyticsCustomReports]: true,
            })

            renderWithStore(
                <MemoryRouter initialEntries={['/app/stats/custom-reports/1']}>
                    <Routes />
                </MemoryRouter>,
                state
            )

            expect(CustomReportPageMock).toHaveBeenCalled()
        })

        it('should the NoMatch component when the path doesn’t match any route', () => {
            renderWithRouter(
                <Provider store={mockStore({})}>
                    <Routes />
                </Provider>,
                {
                    history: mockHistory,
                }
            )

            act(() => {
                mockHistory.push('/app/unknown')
            })

            expect(
                screen.getByText(
                    'The page you’re looking for couldn’t be found.'
                )
            ).toBeVisible()
        })
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

        it('should render knowledge page', () => {
            mockFlags({
                [FeatureFlagKey.AiAgentKnowledgeTab]: true,
            })

            render(
                <Provider store={mockStore(defaultState)}>
                    <MemoryRouter
                        initialEntries={[
                            '/app/automation/shopify/test-shop/ai-agent/knowledge',
                        ]}
                    >
                        <Routes />
                    </MemoryRouter>
                </Provider>
            )

            expect(
                screen.getByText('AiAgentKnowledgeContainer')
            ).toBeInTheDocument()
        })

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
                </Provider>
            )

            expect(
                screen.getByText('AiAgentKnowledgeContainer')
            ).toBeInTheDocument()
        })

        describe('when conv-ai-standalone-menu flag is enabled', () => {
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
                    to: '/app/ai-agent/shopify/test-shop/knowledge/actions',
                },
                {
                    from: '/app/automation/shopify/test-shop/ai-agent/preview-mode',
                    to: '/app/ai-agent/shopify/test-shop/settings/preview',
                },
            ])('should redirect to $to when accessing $from', ({from, to}) => {
                mockFlags({[FeatureFlagKey.ConvAiStandaloneMenu]: true})

                render(
                    <QueryClientProvider client={mockQueryClient()}>
                        <Provider store={mockStore(defaultState)}>
                            <Router history={mockHistory}>
                                <Routes />
                            </Router>
                        </Provider>
                    </QueryClientProvider>
                )

                act(() => mockHistory.push(from))

                expect(mockHistory.location.pathname).toBe(to)
            })
        })
    })
})
