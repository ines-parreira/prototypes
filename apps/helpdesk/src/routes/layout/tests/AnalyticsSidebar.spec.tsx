import { SidebarContext } from '@repo/navigation'
import { assumeMock } from '@repo/testing'
import { render, screen } from '@testing-library/react'

import { useStatsNavbarConfig } from '../products/analytics'
import { AnalyticsSidebar } from '../sidebars/AnalyticsSidebar/AnalyticsSidebar'

jest.mock(
    'domains/reporting/pages/common/components/StatsNavbarView/useStatsNavbarSections',
    () => ({
        useStatsNavbarSections: () => ({
            sections: {},
            handleNavigationStateChange: jest.fn(),
        }),
    }),
)

jest.mock(
    'domains/reporting/pages/dashboards/DashboardsNavbarBlock/DashboardsNavbarBlock',
    () => ({
        DashboardsNavbarBlock: () => <div>DashboardsNavbarBlock</div>,
    }),
)

jest.mock('domains/reporting/pages/self-service/AutomateStatsNavbar', () => ({
    AutomateStatsNavbar: () => <div>AutomateStatsNavbar</div>,
}))

jest.mock(
    'pages/convert/common/components/ConvertStatsNavbar/ConvertStatsNavbar',
    () => ({
        ConvertStatsNavbar: () => <div>ConvertStatsNavbar</div>,
    }),
)

jest.mock(
    'routes/layout/sidebars/AnalyticsSidebar/CollapsedAnalyticsSidebar',
    () => ({
        CollapsedAnalyticsSidebar: () => <div>CollapsedAnalyticsSidebar</div>,
    }),
)

jest.mock('routes/layout/products/analytics')
const useStatsNavbarConfigMock = assumeMock(useStatsNavbarConfig)

const wrapper = ({ children }: any) => (
    <SidebarContext.Provider
        value={{ isCollapsed: false, toggleCollapse: jest.fn() }}
    >
        {children}
    </SidebarContext.Provider>
)

describe('AnalyticsSidebar', () => {
    beforeEach(() => {
        useStatsNavbarConfigMock.mockReturnValue({
            sections: [
                { id: 'dashboards' },
                { id: 'automate' },
                { id: 'convert' },
            ] as any,
        })
    })

    afterEach(() => {
        jest.clearAllMocks()
    })

    describe('when expanded', () => {
        it('should render DashboardsNavbarBlock for dashboards section', () => {
            render(<AnalyticsSidebar />, { wrapper })
            expect(
                screen.getByText('DashboardsNavbarBlock'),
            ).toBeInTheDocument()
        })

        it('should render AutomateStatsNavbar for automate section', () => {
            render(<AnalyticsSidebar />, { wrapper })
            expect(screen.getByText('AutomateStatsNavbar')).toBeInTheDocument()
        })

        it('should render ConvertStatsNavbar for convert section', () => {
            render(<AnalyticsSidebar />, { wrapper })
            expect(screen.getByText('ConvertStatsNavbar')).toBeInTheDocument()
        })

        it('should not render CollapsedAnalyticsSidebar', () => {
            render(<AnalyticsSidebar />, { wrapper })
            expect(
                screen.queryByText('CollapsedAnalyticsSidebar'),
            ).not.toBeInTheDocument()
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

        it('should render CollapsedAnalyticsSidebar', () => {
            render(<AnalyticsSidebar />, { wrapper: collapsedWrapper })
            expect(
                screen.getByText('CollapsedAnalyticsSidebar'),
            ).toBeInTheDocument()
        })

        it('should not render expanded sidebar content', () => {
            render(<AnalyticsSidebar />, { wrapper: collapsedWrapper })
            expect(
                screen.queryByText('DashboardsNavbarBlock'),
            ).not.toBeInTheDocument()
            expect(
                screen.queryByText('AutomateStatsNavbar'),
            ).not.toBeInTheDocument()
            expect(
                screen.queryByText('ConvertStatsNavbar'),
            ).not.toBeInTheDocument()
        })
    })
})
