import { SidebarContext } from '@repo/navigation'
import { assumeMock } from '@repo/testing'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'

import { useStatsNavbarConfig } from 'routes/layout/products/analytics'
import { AnalyticsSidebar } from 'routes/layout/sidebars/AnalyticsSidebar/AnalyticsSidebar'
import { renderWithRouter } from 'utils/testing'

jest.mock(
    'routes/layout/sidebars/AnalyticsSidebar/CollapsedAnalyticsSidebar',
    () => ({
        CollapsedAnalyticsSidebar: () => <div>CollapsedAnalyticsSidebar</div>,
    }),
)

jest.mock(
    'domains/reporting/pages/report-chart-restrictions/ProtectedRoute',
    () => ({
        ProtectedRoute: ({ children }: any) => children,
    }),
)

jest.mock('routes/layout/products/analytics')
const useStatsNavbarConfigMock = assumeMock(useStatsNavbarConfig)

const mockSections = [
    {
        id: 'dashboards',
        label: 'Dashboards',
        icon: 'chart-line',
        items: [
            {
                key: 'dashboard-1',
                route: 'dashboards/1',
                label: 'My Dashboard',
                itemId: 'dashboard-1',
            },
        ],
    },
    {
        id: 'support-performance',
        label: 'Support Performance',
        icon: 'alarm',
        items: [
            {
                key: 'overview',
                route: 'support-performance/overview',
                label: 'Overview',
                requiresUpgrade: true,
            },
            {
                key: 'agents',
                route: 'support-performance-agents',
                label: 'Agents',
            },
        ],
    },
]

const wrapper = ({ children }: any) => (
    <MemoryRouter>
        <SidebarContext.Provider
            value={{ isCollapsed: false, toggleCollapse: jest.fn() }}
        >
            {children}
        </SidebarContext.Provider>
    </MemoryRouter>
)

describe('AnalyticsSidebar', () => {
    beforeEach(() => {
        useStatsNavbarConfigMock.mockReturnValue({
            sections: mockSections as any,
        })
    })

    afterEach(() => {
        jest.clearAllMocks()
    })

    describe('when expanded', () => {
        it('renders section labels from config', () => {
            render(<AnalyticsSidebar />, { wrapper })

            expect(screen.getByText('Dashboards')).toBeInTheDocument()
            expect(screen.getByText('Support Performance')).toBeInTheDocument()
        })

        it('renders upgrade icon only for items with requiresUpgrade', async () => {
            renderWithRouter(
                <SidebarContext.Provider
                    value={{ isCollapsed: false, toggleCollapse: jest.fn() }}
                >
                    <AnalyticsSidebar />
                </SidebarContext.Provider>,
            )

            expect(
                screen.getAllByRole('img', { name: 'arrow-circle-up' }),
            ).toHaveLength(1)
        })

        it('does not render sections without items', () => {
            useStatsNavbarConfigMock.mockReturnValue({
                sections: [
                    { id: 'empty', label: 'Empty', icon: 'ai' },
                    ...mockSections,
                ] as any,
            })

            render(<AnalyticsSidebar />, { wrapper })

            expect(screen.queryByText('Empty')).not.toBeInTheDocument()
            expect(screen.getByText('Dashboards')).toBeInTheDocument()
        })

        it('does not render CollapsedAnalyticsSidebar', () => {
            render(<AnalyticsSidebar />, { wrapper })

            expect(
                screen.queryByText('CollapsedAnalyticsSidebar'),
            ).not.toBeInTheDocument()
        })

        it('renders actionsSlot in section trigger when provided', () => {
            useStatsNavbarConfigMock.mockReturnValue({
                sections: [
                    {
                        id: 'dashboards',
                        label: 'Dashboards',
                        icon: 'chart-line',
                        actionsSlot: <button>Add Dashboard</button>,
                        items: [
                            {
                                key: 'dashboard-1',
                                route: 'dashboards/1',
                                label: 'My Dashboard',
                            },
                        ],
                    },
                ] as any,
            })

            render(<AnalyticsSidebar />, { wrapper })

            expect(
                screen.getByRole('button', { name: 'Add Dashboard' }),
            ).toBeInTheDocument()
        })

        it('renders trailingSlot for items that have one', async () => {
            const user = userEvent.setup()
            useStatsNavbarConfigMock.mockReturnValue({
                sections: [
                    {
                        id: 'automate',
                        label: 'Automate',
                        icon: 'zap',
                        items: [
                            {
                                key: 'analytics-overview',
                                route: 'analytics-overview',
                                label: 'Overview',
                                trailingSlot: <span>Beta</span>,
                            },
                        ],
                    },
                ] as any,
            })

            renderWithRouter(
                <SidebarContext.Provider
                    value={{ isCollapsed: false, toggleCollapse: jest.fn() }}
                >
                    <AnalyticsSidebar />
                </SidebarContext.Provider>,
            )

            await user.click(screen.getByText('Automate'))

            expect(screen.getByText('Beta')).toBeInTheDocument()
        })
    })

    describe('when collapsed', () => {
        const collapsedWrapper = ({ children }: any) => (
            <SidebarContext.Provider
                value={{
                    isCollapsed: true,
                    toggleCollapse: jest.fn(),
                }}
            >
                {children}
            </SidebarContext.Provider>
        )

        it('renders CollapsedAnalyticsSidebar', () => {
            render(<AnalyticsSidebar />, { wrapper: collapsedWrapper })

            expect(
                screen.getByText('CollapsedAnalyticsSidebar'),
            ).toBeInTheDocument()
        })
    })
})
