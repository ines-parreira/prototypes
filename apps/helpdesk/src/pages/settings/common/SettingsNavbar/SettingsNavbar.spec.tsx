import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'

import SettingsNavbar from './SettingsNavbar'

jest.mock('@repo/agent-status', () => ({
    ...jest.requireActual('@repo/agent-status'),
    useCustomAgentUnavailableStatusesFlag: jest.fn(),
}))

jest.mock('@repo/feature-flags', () => ({
    FeatureFlagKey: {
        HistoricalImports: 'historical-imports',
    },
    useFlag: jest.fn(),
}))

jest.mock('@repo/hooks', () => ({
    useLocalStorage: jest.fn(() => [[], jest.fn()]),
}))

jest.mock('@repo/logging', () => ({
    logEvent: jest.fn(),
    SegmentEvent: {
        BillingAndUsageNavigationSideNavClicked:
            'billing-and-usage-navigation-side-nav-clicked',
        SettingsNavigationClicked: 'settings-navigation-clicked',
    },
}))

jest.mock('hooks/aiAgent/useAiAgentAccess', () => ({
    useAiAgentAccess: jest.fn(),
}))

jest.mock('pages/automate/common/hooks/useStoreIntegrations', () => ({
    __esModule: true,
    default: jest.fn(),
}))

jest.mock(
    'pages/integrations/integration/components/gorgias_chat/legacy/hooks/useIsArticleRecommendationsEnabledWhileSunset',
    () => ({
        useIsArticleRecommendationsEnabledWhileSunset: jest.fn(),
    }),
)

jest.mock('hooks/useAppDispatch', () => ({
    __esModule: true,
    default: jest.fn(() => jest.fn()),
}))

jest.mock('hooks/useAppSelector', () => ({
    __esModule: true,
    default: jest.fn(),
}))

jest.mock('common/navigation', () => ({
    Navbar: ({ children, title }: any) => (
        <div data-testid="navbar">
            <h1>{title}</h1>
            {children}
        </div>
    ),
    ActiveContent: {
        Settings: 'Settings',
    },
}))

jest.mock('components/Navigation/Navigation', () => ({
    Navigation: {
        Root: ({ children }: any) => (
            <div data-testid="nav-root">{children}</div>
        ),
        Section: ({ children, value }: any) => (
            <div data-testid={`section-${value}`}>{children}</div>
        ),
        SectionTrigger: ({ children }: any) => <div>{children}</div>,
        SectionContent: ({ children }: any) => <div>{children}</div>,
        SectionIndicator: () => <div />,
        SectionItem: ({ children, to }: any) => (
            <a href={to} data-testid={`nav-item-${to}`}>
                {children}
            </a>
        ),
    },
}))

jest.mock('./Item', () => ({
    __esModule: true,
    default: ({ to, text, shouldRender, extra }: any) => {
        if (shouldRender === false) return null
        return (
            <div data-testid={`item-${to}`}>
                <a href={`/app/settings/${to}`}>{text}</a>
                {extra}
            </div>
        )
    },
}))

jest.mock('./Section', () => ({
    __esModule: true,
    default: ({ children, id, value }: any) => (
        <div data-testid={`section-${id}`}>
            <h2>{value}</h2>
            {children}
        </div>
    ),
}))

jest.mock('providers/standalone-ai/StandaloneAiContext', () => ({
    useStandaloneAiContext: jest.fn(),
}))

jest.mock('./AutomateUpgradeBadge', () => ({
    AutomateUpgradeBadge: () => <span data-testid="automate-badge">Badge</span>,
}))

const mockUseFlag = jest.mocked(require('@repo/feature-flags').useFlag)
const mockUseCustomAgentUnavailableStatusesFlag = jest.mocked(
    require('@repo/agent-status').useCustomAgentUnavailableStatusesFlag,
)
const mockUseAiAgentAccess = jest.mocked(
    require('hooks/aiAgent/useAiAgentAccess').useAiAgentAccess,
)
const mockUseStoreIntegrations = jest.mocked(
    require('pages/automate/common/hooks/useStoreIntegrations').default,
)
const mockUseIsArticleRecommendationsEnabledWhileSunset = jest.mocked(
    require('pages/integrations/integration/components/gorgias_chat/legacy/hooks/useIsArticleRecommendationsEnabledWhileSunset')
        .useIsArticleRecommendationsEnabledWhileSunset,
)
const mockUseStandaloneAiContext = jest.mocked(
    require('providers/standalone-ai/StandaloneAiContext')
        .useStandaloneAiContext,
)

describe('SettingsNavbar', () => {
    beforeEach(() => {
        mockUseFlag.mockReturnValue(false)
        mockUseCustomAgentUnavailableStatusesFlag.mockReturnValue(false)
        mockUseAiAgentAccess.mockReturnValue({
            hasAccess: false,
            isLoading: false,
        })
        mockUseStoreIntegrations.mockReturnValue([])
        mockUseIsArticleRecommendationsEnabledWhileSunset.mockReturnValue({
            enabled: false,
        })
        mockUseStandaloneAiContext.mockReturnValue({
            isStandaloneAiAgent: false,
            accessFeaturesMapped: {
                statistics: { canRead: true, canWrite: true },
                userManagement: { canRead: true, canWrite: true },
            },
        })
    })

    afterEach(() => {
        jest.clearAllMocks()
    })

    const renderComponent = () => {
        return render(
            <MemoryRouter>
                <SettingsNavbar />
            </MemoryRouter>,
        )
    }

    describe('Basic rendering', () => {
        it('should render the navbar with Settings title', () => {
            renderComponent()

            expect(screen.getByTestId('navbar')).toBeInTheDocument()
            expect(screen.getByText('Settings')).toBeInTheDocument()
        })

        it('should render all main sections', () => {
            renderComponent()

            expect(screen.getByText('Productivity')).toBeInTheDocument()
            expect(
                screen.getByText('Ticket & Customer data'),
            ).toBeInTheDocument()
            expect(screen.getByText('Ticket management')).toBeInTheDocument()
            expect(screen.getByText('Channels')).toBeInTheDocument()
            expect(screen.getByText('Apps')).toBeInTheDocument()
            expect(screen.getByText('Account')).toBeInTheDocument()
            expect(screen.getByText('Advanced')).toBeInTheDocument()
            expect(screen.getByText('Profile')).toBeInTheDocument()
        })
    })

    describe('Productivity section', () => {
        it('should render Macros item', () => {
            renderComponent()

            expect(screen.getByTestId('item-macros')).toBeInTheDocument()
            expect(screen.getByText('Macros')).toBeInTheDocument()
        })

        it('should render Flows when hasAccess is true and integrations exist', () => {
            mockUseAiAgentAccess.mockReturnValue({
                hasAccess: true,
                isLoading: false,
            })
            mockUseStoreIntegrations.mockReturnValue([{ id: 1 }] as any)

            renderComponent()

            expect(screen.getByTestId('item-flows')).toBeInTheDocument()
            expect(screen.getByText('Flows')).toBeInTheDocument()
        })

        it('should not render Flows when hasAccess is false', () => {
            mockUseAiAgentAccess.mockReturnValue({
                hasAccess: false,
                isLoading: false,
            })
            mockUseStoreIntegrations.mockReturnValue([])

            renderComponent()

            expect(screen.queryByTestId('item-flows')).not.toBeInTheDocument()
        })

        it('should render Order Management when hasAccess is true and integrations exist', () => {
            mockUseAiAgentAccess.mockReturnValue({
                hasAccess: true,
                isLoading: false,
            })
            mockUseStoreIntegrations.mockReturnValue([{ id: 1 }] as any)

            renderComponent()

            expect(
                screen.getByTestId('item-order-management'),
            ).toBeInTheDocument()
            expect(screen.getByText('Order Management')).toBeInTheDocument()
        })

        it('should render Article Recommendations when enabled during sunset', () => {
            mockUseAiAgentAccess.mockReturnValue({
                hasAccess: true,
                isLoading: false,
            })
            mockUseStoreIntegrations.mockReturnValue([{ id: 1 }] as any)
            mockUseIsArticleRecommendationsEnabledWhileSunset.mockReturnValue({
                enabledInSettings: true,
            })

            renderComponent()

            expect(
                screen.getByTestId('item-article-recommendations'),
            ).toBeInTheDocument()
            expect(
                screen.getByText('Article Recommendations'),
            ).toBeInTheDocument()
        })

        it('should not render Article Recommendations when not enabled during sunset', () => {
            mockUseIsArticleRecommendationsEnabledWhileSunset.mockReturnValue({
                enabled: false,
            })

            renderComponent()

            expect(
                screen.queryByTestId('item-article-recommendations'),
            ).not.toBeInTheDocument()
        })

        it('should render AI Agent when shouldRenderAutomate is true', () => {
            mockUseAiAgentAccess.mockReturnValue({
                hasAccess: false,
                isLoading: false,
            })
            mockUseStoreIntegrations.mockReturnValue([])

            renderComponent()

            expect(screen.getByTestId('item-automate')).toBeInTheDocument()
            expect(screen.getByText('AI Agent')).toBeInTheDocument()
            expect(screen.getByText('Badge')).toBeInTheDocument()
        })
    })

    describe('Ticket & Customer data section', () => {
        it('should render all ticket and customer data items', () => {
            renderComponent()

            expect(screen.getByText('Ticket Fields')).toBeInTheDocument()
            expect(screen.getByText('Customer Fields')).toBeInTheDocument()
            expect(screen.getByText('Field Conditions')).toBeInTheDocument()
            expect(screen.getByText('Tags')).toBeInTheDocument()
            expect(screen.getByText('SLAs')).toBeInTheDocument()
            expect(screen.getByText('Satisfaction survey')).toBeInTheDocument()
        })
    })

    describe('Ticket management section', () => {
        it('should render all ticket management items', () => {
            renderComponent()

            expect(screen.getByTestId('item-rules')).toBeInTheDocument()
            expect(screen.getByText('Rules')).toBeInTheDocument()

            expect(
                screen.getByTestId('item-ticket-assignment'),
            ).toBeInTheDocument()
            expect(screen.getByText('Ticket Assignment')).toBeInTheDocument()

            expect(screen.getByTestId('item-auto-merge')).toBeInTheDocument()
            expect(screen.getByText('Auto-merge')).toBeInTheDocument()

            expect(
                screen.getByTestId('item-business-hours'),
            ).toBeInTheDocument()
            expect(screen.getByText('Business hours')).toBeInTheDocument()

            expect(screen.getByTestId('item-sidebar')).toBeInTheDocument()
            expect(screen.getByText('Default views')).toBeInTheDocument()
        })
    })

    describe('Channels section', () => {
        it('should render all channel items', () => {
            renderComponent()

            expect(screen.getByText('Help Center')).toBeInTheDocument()
            expect(screen.getByText('Phone numbers')).toBeInTheDocument()
            expect(screen.getByText('Email')).toBeInTheDocument()
            expect(screen.getByText('Voice')).toBeInTheDocument()
            expect(screen.getByText('SMS')).toBeInTheDocument()
            expect(screen.getByText('Chat')).toBeInTheDocument()
            expect(screen.getByText('Contact form')).toBeInTheDocument()
        })
    })

    describe('Apps section', () => {
        it('should render all apps items', () => {
            renderComponent()

            expect(screen.getByText('Installed apps')).toBeInTheDocument()
            expect(screen.getByText('App store')).toBeInTheDocument()
            expect(screen.getByText('HTTP integration')).toBeInTheDocument()
        })
    })

    describe('Account section', () => {
        it('should render all account items', () => {
            renderComponent()

            expect(
                screen.getByTestId('item-store-management'),
            ).toBeInTheDocument()
            expect(screen.getByText('Store Management')).toBeInTheDocument()

            expect(screen.getByTestId('item-users')).toBeInTheDocument()
            expect(screen.getByText('Users')).toBeInTheDocument()

            expect(screen.getByTestId('item-teams')).toBeInTheDocument()
            expect(screen.getByText('Teams')).toBeInTheDocument()

            expect(screen.getByTestId('item-access')).toBeInTheDocument()
            expect(screen.getByText('Access management')).toBeInTheDocument()

            expect(screen.getByTestId('item-billing')).toBeInTheDocument()
            expect(screen.getByText('Billing & usage')).toBeInTheDocument()
        })
    })

    describe('Advanced section', () => {
        it('should render audit logs and REST API items', () => {
            renderComponent()

            expect(screen.getByTestId('item-audit')).toBeInTheDocument()
            expect(screen.getByText('Audit logs')).toBeInTheDocument()

            expect(screen.getByTestId('item-api')).toBeInTheDocument()
            expect(screen.getByText('REST API')).toBeInTheDocument()
        })

        describe('Imports feature flag', () => {
            it('should render Imports when feature flag is enabled', () => {
                mockUseFlag.mockImplementation((flag: string) => {
                    if (flag === 'historical-imports') return true
                    return false
                })

                renderComponent()

                expect(
                    screen.getByTestId('item-historical-imports'),
                ).toBeInTheDocument()
                expect(screen.getByText('Imports')).toBeInTheDocument()
                expect(
                    screen.queryByTestId('item-import-email'),
                ).not.toBeInTheDocument()
                expect(
                    screen.queryByTestId('item-import-zendesk'),
                ).not.toBeInTheDocument()
            })

            it('should render Email Import and Zendesk import when feature flag is disabled', () => {
                mockUseFlag.mockReturnValue(false)

                renderComponent()

                expect(
                    screen.getByTestId('item-import-email'),
                ).toBeInTheDocument()
                expect(screen.getByText('Email Import')).toBeInTheDocument()

                expect(
                    screen.getByTestId('item-import-zendesk'),
                ).toBeInTheDocument()
                expect(screen.getByText('Zendesk import')).toBeInTheDocument()

                expect(
                    screen.queryByTestId('item-historical-imports'),
                ).not.toBeInTheDocument()
            })
        })
    })

    describe('Profile section', () => {
        it('should render all profile items', () => {
            renderComponent()

            expect(screen.getByTestId('item-profile')).toBeInTheDocument()
            expect(screen.getByText('Your profile')).toBeInTheDocument()

            expect(screen.getByTestId('item-notifications')).toBeInTheDocument()
            expect(screen.getByText('Notifications')).toBeInTheDocument()

            expect(screen.getByTestId('item-password-2fa')).toBeInTheDocument()
            expect(screen.getByText('Password & 2FA')).toBeInTheDocument()
        })
    })

    describe('Conditional rendering based on AI Agent access', () => {
        it('should hide Flows and Order Management when loading', () => {
            mockUseAiAgentAccess.mockReturnValue({
                hasAccess: true,
                isLoading: true,
            })
            mockUseStoreIntegrations.mockReturnValue([{ id: 1 }] as any)

            renderComponent()

            expect(screen.queryByTestId('item-flows')).not.toBeInTheDocument()
            expect(
                screen.queryByTestId('item-order-management'),
            ).not.toBeInTheDocument()
        })

        it('should show Flows and Order Management when hasAccess and integrations exist', () => {
            mockUseAiAgentAccess.mockReturnValue({
                hasAccess: true,
                isLoading: false,
            })
            mockUseStoreIntegrations.mockReturnValue([{ id: 1 }] as any)

            renderComponent()

            expect(screen.getByTestId('item-flows')).toBeInTheDocument()
            expect(
                screen.getByTestId('item-order-management'),
            ).toBeInTheDocument()
        })

        it('should show AI Agent when no access or no integrations', () => {
            mockUseAiAgentAccess.mockReturnValue({
                hasAccess: false,
                isLoading: false,
            })
            mockUseStoreIntegrations.mockReturnValue([])

            renderComponent()

            expect(screen.getByTestId('item-automate')).toBeInTheDocument()
        })

        it('should show AI Agent when no integrations but has access', () => {
            mockUseAiAgentAccess.mockReturnValue({
                hasAccess: true,
                isLoading: false,
            })
            mockUseStoreIntegrations.mockReturnValue([])

            renderComponent()

            expect(screen.getByTestId('item-automate')).toBeInTheDocument()
        })
    })

    describe('Feature flag combinations', () => {
        it('should handle both feature flags enabled', () => {
            mockUseFlag.mockImplementation(() => {
                return true
            })
            mockUseCustomAgentUnavailableStatusesFlag.mockReturnValue(true)

            renderComponent()

            expect(
                screen.getByTestId('item-agent-statuses'),
            ).toBeInTheDocument()
            expect(
                screen.getByTestId('item-historical-imports'),
            ).toBeInTheDocument()
            expect(
                screen.queryByTestId('item-import-email'),
            ).not.toBeInTheDocument()
            expect(
                screen.queryByTestId('item-import-zendesk'),
            ).not.toBeInTheDocument()
        })

        it('should handle both feature flags disabled', () => {
            mockUseFlag.mockReturnValue(false)

            renderComponent()

            expect(
                screen.queryByTestId('item-agent-statuses'),
            ).not.toBeInTheDocument()
            expect(
                screen.queryByTestId('item-historical-imports'),
            ).not.toBeInTheDocument()
            expect(screen.getByTestId('item-import-email')).toBeInTheDocument()
            expect(
                screen.getByTestId('item-import-zendesk'),
            ).toBeInTheDocument()
        })
    })
})
