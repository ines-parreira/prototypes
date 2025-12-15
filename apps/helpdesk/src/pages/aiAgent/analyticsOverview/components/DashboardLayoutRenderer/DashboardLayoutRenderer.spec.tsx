import { render, screen } from '@testing-library/react'

import { ChartType } from 'domains/reporting/pages/dashboards/types'
import type { ReportConfig } from 'domains/reporting/pages/dashboards/types'

import { AnalyticsOverviewChart } from '../../AnalyticsOverviewReportConfig'
import { DEFAULT_ANALYTICS_OVERVIEW_LAYOUT } from '../../config/defaultLayoutConfig'
import type { DashboardLayoutConfig } from '../../types/layoutConfig'
import { DashboardLayoutRenderer } from './DashboardLayoutRenderer'

jest.mock('domains/reporting/pages/dashboards/DashboardComponent', () => ({
    DashboardComponent: ({ chart }: { chart: string }) => (
        <div data-testid={`chart-${chart}`}>Chart: {chart}</div>
    ),
}))

describe('DashboardLayoutRenderer', () => {
    const reportConfigMock = {
        charts: {
            ['chart']: {
                chartComponent: () => <div>Chart 1</div>,
                label: 'Chart 1 Label',
                csvProducer: null,
                description: 'Description for chart 1',
                chartType: ChartType.Card,
            },
        },
    } as unknown as ReportConfig<string>

    it('should render all charts in the correct order', () => {
        render(
            <DashboardLayoutRenderer
                layoutConfig={DEFAULT_ANALYTICS_OVERVIEW_LAYOUT}
                reportConfig={reportConfigMock}
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

        render(
            <DashboardLayoutRenderer
                layoutConfig={invalidConfig}
                reportConfig={reportConfigMock}
            />,
        )

        expect(
            screen.getByTestId(
                `chart-${AnalyticsOverviewChart.AutomationRateCard}`,
            ),
        ).toBeInTheDocument()
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

        render(
            <DashboardLayoutRenderer
                layoutConfig={customConfig}
                reportConfig={reportConfigMock}
            />,
        )

        expect(
            screen.getByTestId(
                `chart-${AnalyticsOverviewChart.AutomationRateCard}`,
            ),
        ).toBeInTheDocument()
        expect(
            screen.getByTestId(`chart-${AnalyticsOverviewChart.TimeSavedCard}`),
        ).toBeInTheDocument()
    })
})
