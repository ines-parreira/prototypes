import { render, screen } from '@testing-library/react'

import { AnalyticsOverviewChart } from '../../AnalyticsOverviewReportConfig'
import { DEFAULT_ANALYTICS_OVERVIEW_LAYOUT } from '../../config/defaultLayoutConfig'
import type { DashboardLayoutConfig } from '../../types/layoutConfig'
import { DashboardLayoutRenderer } from './DashboardLayoutRenderer'

jest.mock('domains/reporting/pages/dashboards/DashboardComponent', () => ({
    DashboardComponent: ({ chart }: { chart: string }) => (
        <div data-testid={`chart-${chart}`}>Chart: {chart}</div>
    ),
}))

jest.mock('domains/reporting/pages/common/layout/DashboardSection', () => ({
    __esModule: true,
    default: ({
        children,
        className,
    }: {
        children: React.ReactNode
        className?: string
    }) => (
        <div data-testid="dashboard-section" className={className}>
            {children}
        </div>
    ),
}))

jest.mock('domains/reporting/pages/common/layout/DashboardGridCell', () => ({
    __esModule: true,
    default: ({
        children,
        size,
    }: {
        children: React.ReactNode
        size: number
    }) => (
        <div data-testid="grid-cell" data-size={size}>
            {children}
        </div>
    ),
}))

describe('DashboardLayoutRenderer', () => {
    it('should render all sections from the config', () => {
        render(
            <DashboardLayoutRenderer
                layoutConfig={DEFAULT_ANALYTICS_OVERVIEW_LAYOUT}
            />,
        )

        const sections = screen.getAllByTestId('dashboard-section')
        expect(sections).toHaveLength(3)
    })

    it('should render all charts with correct grid sizes', () => {
        render(
            <DashboardLayoutRenderer
                layoutConfig={DEFAULT_ANALYTICS_OVERVIEW_LAYOUT}
            />,
        )

        const gridCells = screen.getAllByTestId('grid-cell')
        expect(gridCells).toHaveLength(7)

        expect(gridCells[0]).toHaveAttribute('data-size', '3')
        expect(gridCells[1]).toHaveAttribute('data-size', '3')
        expect(gridCells[2]).toHaveAttribute('data-size', '3')
        expect(gridCells[3]).toHaveAttribute('data-size', '3')
        expect(gridCells[4]).toHaveAttribute('data-size', '6')
        expect(gridCells[5]).toHaveAttribute('data-size', '6')
        expect(gridCells[6]).toHaveAttribute('data-size', '12')
    })

    it('should render charts in the correct order', () => {
        render(
            <DashboardLayoutRenderer
                layoutConfig={DEFAULT_ANALYTICS_OVERVIEW_LAYOUT}
            />,
        )

        expect(
            screen.getByTestId(
                `chart-${AnalyticsOverviewChart.AutomationRateCard}`,
            ),
        ).toBeInTheDocument()
        expect(
            screen.getByTestId(
                `chart-${AnalyticsOverviewChart.AutomatedInteractionsCard}`,
            ),
        ).toBeInTheDocument()
        expect(
            screen.getByTestId(`chart-${AnalyticsOverviewChart.TimeSavedCard}`),
        ).toBeInTheDocument()
        expect(
            screen.getByTestId(`chart-${AnalyticsOverviewChart.CostSavedCard}`),
        ).toBeInTheDocument()
        expect(
            screen.getByTestId(
                `chart-${AnalyticsOverviewChart.AutomationDonutChart}`,
            ),
        ).toBeInTheDocument()
        expect(
            screen.getByTestId(
                `chart-${AnalyticsOverviewChart.AutomationLineChart}`,
            ),
        ).toBeInTheDocument()
        expect(
            screen.getByTestId(
                `chart-${AnalyticsOverviewChart.PerformanceTable}`,
            ),
        ).toBeInTheDocument()
    })

    it('should fallback to default layout when config is invalid', () => {
        const invalidConfig = {
            sections: [
                {
                    id: 'invalid',
                    type: 'invalid-type' as any,
                    items: [],
                },
            ],
        } as DashboardLayoutConfig

        render(<DashboardLayoutRenderer layoutConfig={invalidConfig} />)

        const sections = screen.getAllByTestId('dashboard-section')
        expect(sections).toHaveLength(3)
    })

    it('should render custom layout configuration', () => {
        const customConfig: DashboardLayoutConfig = {
            sections: [
                {
                    id: 'kpis',
                    type: 'kpis',
                    items: [
                        {
                            chartId: AnalyticsOverviewChart.AutomationRateCard,
                            gridSize: 6,
                        },
                        {
                            chartId: AnalyticsOverviewChart.TimeSavedCard,
                            gridSize: 6,
                        },
                    ],
                },
            ],
        }

        render(<DashboardLayoutRenderer layoutConfig={customConfig} />)

        const sections = screen.getAllByTestId('dashboard-section')
        expect(sections).toHaveLength(1)

        const gridCells = screen.getAllByTestId('grid-cell')
        expect(gridCells).toHaveLength(2)
        expect(gridCells[0]).toHaveAttribute('data-size', '6')
        expect(gridCells[1]).toHaveAttribute('data-size', '6')
    })
})
