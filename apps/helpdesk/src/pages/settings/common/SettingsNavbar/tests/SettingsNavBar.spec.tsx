import { useCustomAgentUnavailableStatusesFlag } from '@repo/agent-status'
import { useFlag } from '@repo/feature-flags'
import { logEvent } from '@repo/logging'
import { act, screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { fromJS } from 'immutable'
import { Provider } from 'react-redux'
import { useLocation } from 'react-router-dom'
import configureStore from 'redux-mock-store'

import { NavBarProvider } from 'common/navigation/components/NavBarProvider'
import { billingState } from 'fixtures/billing'
import { useAiAgentAccess } from 'hooks/aiAgent/useAiAgentAccess'
import { renderWithRouter } from 'utils/testing'

import SettingsNavbar from '../SettingsNavbar'

window.scrollTo = jest.fn()

jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useLocation: jest.fn(),
}))
jest.mock('@repo/logging', () => ({
    ...jest.requireActual('@repo/logging'),
    logEvent: jest.fn(),
}))
jest.mock('@repo/agent-status', () => ({
    ...jest.requireActual('@repo/agent-status'),
    useCustomAgentUnavailableStatusesFlag: jest.fn(() => false),
}))
jest.mock('@repo/feature-flags', () => ({
    ...jest.requireActual('@repo/feature-flags'),
    useHelpdeskV2WayfindingMS1Flag: jest.fn().mockReturnValue(false),
    useFlag: jest.fn(() => false),
}))
jest.mock('pages/automate/common/hooks/useStoreIntegrations', () => ({
    __esModule: true,
    default: jest.fn(() => [
        {
            id: 1,
            name: 'Integration 1',
            type: 'shopify',
        },
    ]),
}))
jest.mock('hooks/aiAgent/useAiAgentAccess')
jest.mock('providers/standalone-ai/StandaloneAiContext', () => ({
    useStandaloneAiContext: jest.fn(() => ({
        isStandaloneAiAgent: false,
        accessFeaturesMapped: {
            statistics: { canRead: true, canWrite: true },
            userManagement: { canRead: true, canWrite: true },
        },
    })),
}))

const mockUseIsArticleRecommendationsEnabledWhileSunset = jest.fn()
jest.mock(
    'pages/integrations/integration/components/gorgias_chat/legacy/hooks/useIsArticleRecommendationsEnabledWhileSunset',
    () => ({
        useIsArticleRecommendationsEnabledWhileSunset: () =>
            mockUseIsArticleRecommendationsEnabledWhileSunset(),
    }),
)

const mockStore = configureStore([])
const scrollToMock = jest.fn()
const mockUseLocation = useLocation as jest.Mock
const mockLogEvent = logEvent as jest.Mock
const mockUseAiAgentAccess = useAiAgentAccess as jest.Mock
const mockUseFlag = useFlag as jest.Mock
const mockUseCustomAgentUnavailableStatusesFlag =
    useCustomAgentUnavailableStatusesFlag as jest.Mock

describe('SettingsNavbar', () => {
    const mockCurrentUser = fromJS({
        has_password: true,
        role: { name: 'admin' },
    })

    const mockAccount = fromJS({
        current_subscription: {
            products: {
                product_111: '111',
            },
        },
        domain: 'test-domain',
    })

    const mockLocation = {
        pathname: '/app/settings/profile',
    }

    beforeEach(() => {
        HTMLElement.prototype.scrollTo = jest.fn(scrollToMock)
        jest.clearAllMocks()
        mockUseLocation.mockReturnValue(mockLocation)
        mockLogEvent.mockImplementation(() => {})
        mockUseAiAgentAccess.mockReturnValue({
            hasAccess: true,
            isLoading: false,
        })
        mockUseIsArticleRecommendationsEnabledWhileSunset.mockReturnValue({
            enabledInStatistics: true,
            enabledInSettings: true,
        })
        mockUseFlag.mockImplementation(() => false)
    })

    const renderComponent = (
        store = mockStore({
            currentAccount: mockAccount,
            currentUser: mockCurrentUser,
            billing: fromJS(billingState),
        }),
    ) =>
        renderWithRouter(
            <Provider store={store}>
                <NavBarProvider>
                    <SettingsNavbar />
                </NavBarProvider>
            </Provider>,
        )

    it('renders navigation categories', () => {
        renderComponent()

        expect(screen.getByText('Productivity')).toBeInTheDocument()
        expect(screen.getByText('Apps')).toBeInTheDocument()
        expect(screen.getByText('Profile')).toBeInTheDocument()
        expect(screen.queryByText('Automate')).not.toBeInTheDocument()
    })

    it('handles category collapse/expand', async () => {
        renderComponent()

        const categoryTrigger = screen.getByText('Productivity')

        // Click to collapse
        await act(() => userEvent.click(categoryTrigger))

        expect(categoryTrigger.parentElement).toHaveAttribute(
            'aria-expanded',
            'false',
        )

        // Click to expand
        await act(() => userEvent.click(categoryTrigger))

        expect(categoryTrigger.parentElement).toHaveAttribute(
            'aria-expanded',
            'true',
        )
    })

    it('tracks navigation events when clicking links', async () => {
        renderComponent()

        const firstLink = screen.getByText('Macros')
        await act(() => userEvent.click(firstLink))

        expect(logEvent).toHaveBeenCalledWith(
            expect.any(String),
            expect.objectContaining({
                title: 'Macros',
                account_domain: 'test-domain',
            }),
        )
    })

    it('correctly highlights active navigation items', () => {
        renderComponent()

        const activeLink = screen.getByText('Your profile')
        expect(activeLink.closest('a')).toHaveAttribute('data-selected', 'true')
    })

    it('respects user roles for navigation items', () => {
        // Set user to non-admin
        const nonAdminStore = mockStore({
            currentAccount: mockAccount,
            currentUser: fromJS({
                has_password: true,
                role: { name: 'agent' },
            }),
            billing: fromJS(billingState),
        })

        renderComponent(nonAdminStore)

        // Admin-only items should not be visible
        expect(screen.queryByText('Users')).not.toBeInTheDocument()
    })

    it('renders Automate upgrade item when account does not have Automate', () => {
        ;(useAiAgentAccess as jest.Mock).mockReturnValue({
            hasAccess: false,
            isLoading: false,
        })

        renderComponent()

        expect(screen.getByText('AI Agent')).toBeInTheDocument()
        expect(screen.getByText('UPGRADE')).toBeInTheDocument()
    })

    it('renders store management item', () => {
        renderComponent()

        expect(screen.getByText('Store Management')).toBeInTheDocument()
    })

    describe('Article Recommendations visibility', () => {
        it('shows Article Recommendations menu item when useIsArticleRecommendationsEnabledWhileSunset returns enabledInSettings: true', () => {
            mockUseIsArticleRecommendationsEnabledWhileSunset.mockReturnValue({
                enabledInStatistics: true,
                enabledInSettings: true,
            })

            renderComponent()

            expect(
                screen.getByText('Article Recommendations'),
            ).toBeInTheDocument()
        })

        it('hides Article Recommendations menu item when useIsArticleRecommendationsEnabledWhileSunset returns enabledInSettings: false', () => {
            mockUseIsArticleRecommendationsEnabledWhileSunset.mockReturnValue({
                enabledInStatistics: true,
                enabledInSettings: false,
            })

            renderComponent()

            expect(
                screen.queryByText('Article Recommendations'),
            ).not.toBeInTheDocument()
        })

        it('Article Recommendations menu item requires agent role', () => {
            mockUseIsArticleRecommendationsEnabledWhileSunset.mockReturnValue({
                enabledInStatistics: true,
                enabledInSettings: true,
            })

            // Set user to basic role (not agent or admin)
            const basicUserStore = mockStore({
                currentAccount: mockAccount,
                currentUser: fromJS({
                    has_password: true,
                    role: { name: 'basic' },
                }),
                billing: fromJS(billingState),
            })

            renderComponent(basicUserStore)

            expect(
                screen.queryByText('Article Recommendations'),
            ).not.toBeInTheDocument()
        })
    })

    describe('Billing & Usage navigation tracking', () => {
        it('should log BillingAndUsageNavigationSideNavClicked event when billing link is clicked', async () => {
            renderComponent()

            const billingLink = screen.getByRole('link', {
                name: /billing & usage/i,
            })

            await act(() => userEvent.click(billingLink))

            expect(logEvent).toHaveBeenCalledWith(
                'billing-navigation-sidenav-click',
            )
        })

        it('should render billing link with correct href', () => {
            renderComponent()

            const billingLink = screen.getByRole('link', {
                name: /billing & usage/i,
            })

            expect(billingLink).toHaveAttribute('href', '/app/settings/billing')
        })

        it('should not render billing link for non-admin users', () => {
            const nonAdminStore = mockStore({
                currentAccount: mockAccount,
                currentUser: fromJS({
                    has_password: true,
                    role: { name: 'agent' },
                }),
                billing: fromJS(billingState),
            })

            renderComponent(nonAdminStore)

            const billingLink = screen.queryByRole('link', {
                name: /billing & usage/i,
            })

            expect(billingLink).not.toBeInTheDocument()
        })
    })

    describe('Agent Unavailability menu item', () => {
        it('should show Agent Unavailability menu item when CustomAgentUnavailableStatuses flag is enabled', () => {
            mockUseCustomAgentUnavailableStatusesFlag.mockReturnValue(true)

            renderComponent()

            expect(screen.getByText('Agent unavailability')).toBeInTheDocument()
        })

        it('should hide Agent Unavailability menu item when CustomAgentUnavailableStatuses flag is disabled', () => {
            mockUseCustomAgentUnavailableStatusesFlag.mockReturnValue(false)

            renderComponent()

            expect(
                screen.queryByText('Agent unavailability'),
            ).not.toBeInTheDocument()
        })

        it('should render Agent Unavailability link with correct href', () => {
            mockUseCustomAgentUnavailableStatusesFlag.mockReturnValue(true)

            renderComponent()

            const agentStatusesLink = screen.getByRole('link', {
                name: /agent unavailability/i,
            })

            expect(agentStatusesLink).toHaveAttribute(
                'href',
                '/app/settings/agent-statuses',
            )
        })

        it('should not render Agent Unavailability for non-admin users', () => {
            mockUseCustomAgentUnavailableStatusesFlag.mockReturnValue(true)

            const nonAdminStore = mockStore({
                currentAccount: mockAccount,
                currentUser: fromJS({
                    has_password: true,
                    role: { name: 'agent' },
                }),
                billing: fromJS(billingState),
            })

            renderComponent(nonAdminStore)

            expect(
                screen.queryByText('Agent unavailability'),
            ).not.toBeInTheDocument()
        })
    })
})
