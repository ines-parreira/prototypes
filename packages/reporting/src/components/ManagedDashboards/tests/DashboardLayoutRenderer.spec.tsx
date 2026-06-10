import { render } from '@repo/testing/vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { DashboardLayoutRenderer } from '../DashboardLayoutRenderer'
import { useGetManagedDashboardsLayoutConfig } from '../hooks/useGetManagedDashboardsLayoutConfig'
import { useSaveSelectedTable } from '../hooks/useSaveSelectedTable'
import type { DashboardLayoutConfig, LayoutReportConfig } from '../types'
import { ChartType } from '../types'

const TAB_ALL_AGENTS = 'all-agents'
const TAB_SUPPORT_AGENT = 'support-agent'
const DASHBOARD_OVERVIEW = 'ai-agent-overview'
const DASHBOARD_ANALYTICS = 'ai-agent-analytics'

const AUTOMATION_RATE_CARD = 'revamp-ai_agent_overview-automation_rate_card'
const AUTOMATED_INTERACTIONS_CARD =
    'revamp-ai_agent_overview-automated_interactions_card'
const TIME_SAVED_CARD = 'revamp-ai_agent_overview-time_saved_card'
const COST_SAVED_CARD = 'revamp-ai_agent_overview-cost_saved_card'
const HANDOVER_INTERACTIONS_CARD =
    'revamp-ai_agent_overview-handover_interactions_card'
const DECREASE_IN_RESOLUTION_TIME_CARD =
    'revamp-ai_agent_overview-decrease_in_resolution_time_card'
const DECREASE_IN_FRT_CARD = 'revamp-ai_agent_overview-decrease_in_frt_card'
const CONFIGURABLE_BAR_GRAPH = 'revamp-ai_agent_overview-configurable_bar_graph'
const CONFIGURABLE_LINE_GRAPH =
    'revamp-ai_agent_overview-configurable_line_graph'
const PERFORMANCE_TABLE = 'revamp-ai_agent_overview-performance_table'
const ARTICLE_RECOMMENDATION_TABLE =
    'revamp-ai_agent_overview-article_recommendation_table'
const FLOWS_TABLE = 'revamp-ai_agent_overview-flows_table'
const ORDER_MANAGEMENT_TABLE = 'revamp-ai_agent_overview-order_management_table'

vi.mock('../hooks/useGetManagedDashboardsLayoutConfig', () => ({
    useGetManagedDashboardsLayoutConfig: vi.fn(({ defaultLayoutConfig }) => ({
        layoutConfig: defaultLayoutConfig,
        isLoading: false,
    })),
}))

vi.mock('../hooks/useSaveSelectedTable', () => ({
    useSaveSelectedTable: vi.fn(() => ({
        onSelect: vi.fn(),
    })),
}))

vi.mock('../MetricsConfigurator', () => ({
    MetricsConfigurator: ({
        metrics,
    }: {
        metrics: Array<{ id: string; label: string; visibility: boolean }>
    }) => <div>MetricsConfigurator with {metrics.length} metrics</div>,
}))

const mockedUseGetManagedDashboardsLayoutConfig = vi.mocked(
    useGetManagedDashboardsLayoutConfig,
)
const mockedUseSaveSelectedTable = vi.mocked(useSaveSelectedTable)

const DashboardComponentMock = vi.fn(({ chart }: { chart: string }) => (
    <div data-chart-id={chart}>Chart: {chart}</div>
))

const DEFAULT_ANALYTICS_OVERVIEW_LAYOUT: DashboardLayoutConfig = {
    sections: [
        {
            id: 'kpis',
            type: ChartType.Card,
            items: [
                {
                    chartId: AUTOMATION_RATE_CARD,
                    gridSize: 3,
                    visibility: true,
                },
                {
                    chartId: AUTOMATED_INTERACTIONS_CARD,
                    gridSize: 3,
                    visibility: true,
                },
                {
                    chartId: TIME_SAVED_CARD,
                    gridSize: 3,
                    visibility: true,
                },
                {
                    chartId: COST_SAVED_CARD,
                    gridSize: 3,
                    visibility: true,
                },
                {
                    chartId: HANDOVER_INTERACTIONS_CARD,
                    gridSize: 3,
                    visibility: true,
                },
                {
                    chartId: DECREASE_IN_RESOLUTION_TIME_CARD,
                    gridSize: 3,
                    visibility: true,
                },
                {
                    chartId: DECREASE_IN_FRT_CARD,
                    gridSize: 3,
                    visibility: true,
                },
            ],
        },
        {
            id: 'visualizations',
            type: ChartType.Graph,
            items: [
                {
                    chartId: CONFIGURABLE_BAR_GRAPH,
                    gridSize: 6,
                    visibility: true,
                },
                {
                    chartId: CONFIGURABLE_LINE_GRAPH,
                    gridSize: 6,
                    visibility: true,
                },
            ],
        },
        {
            id: 'breakdown',
            type: ChartType.Table,
            tableTitle: 'Performance breakdown',
            items: [
                {
                    chartId: PERFORMANCE_TABLE,
                    gridSize: 12,
                    visibility: true,
                },
                {
                    chartId: ARTICLE_RECOMMENDATION_TABLE,
                    gridSize: 12,
                    visibility: false,
                },
                {
                    chartId: FLOWS_TABLE,
                    gridSize: 12,
                    visibility: false,
                },
                {
                    chartId: ORDER_MANAGEMENT_TABLE,
                    gridSize: 12,
                    visibility: false,
                },
            ],
        },
    ],
}

const createKpisLayoutConfig = (
    chartIds: string[] = ['kpi1', 'kpi2', 'kpi3', 'kpi4'],
): DashboardLayoutConfig => ({
    sections: [
        {
            id: 'kpis',
            type: ChartType.Card,
            items: chartIds.map((chartId) => ({
                chartId,
                gridSize: 3,
                visibility: true,
            })),
        },
    ],
})

const chartsLayoutConfig: DashboardLayoutConfig = {
    sections: [
        {
            id: 'charts',
            type: ChartType.Graph,
            items: [
                { chartId: 'chart1', gridSize: 6, visibility: true },
                { chartId: 'chart2', gridSize: 6, visibility: true },
            ],
        },
    ],
}

const tableLayoutConfig: DashboardLayoutConfig = {
    sections: [
        {
            id: 'table',
            type: ChartType.Table,
            items: [{ chartId: 'table1', gridSize: 12, visibility: true }],
        },
    ],
}

const multiTableLayoutConfig: DashboardLayoutConfig = {
    sections: [
        {
            id: 'tables',
            type: ChartType.Table,
            items: [
                { chartId: 'table1', gridSize: 12, visibility: true },
                { chartId: 'table2', gridSize: 12, visibility: true },
            ],
        },
    ],
}

const mixedLayoutConfig: DashboardLayoutConfig = {
    sections: [
        {
            id: 'kpis',
            type: ChartType.Card,
            items: [
                { chartId: 'kpi1', gridSize: 3, visibility: true },
                { chartId: 'kpi2', gridSize: 3, visibility: true },
            ],
        },
        {
            id: 'charts',
            type: ChartType.Graph,
            items: [
                { chartId: 'chart1', gridSize: 6, visibility: true },
                { chartId: 'chart2', gridSize: 6, visibility: true },
            ],
        },
        {
            id: 'table',
            type: ChartType.Table,
            items: [{ chartId: 'table1', gridSize: 12, visibility: true }],
        },
    ],
}

const reportConfigMock: LayoutReportConfig = {
    charts: {
        kpi1: { label: 'KPI 1' },
        kpi2: { label: 'KPI 2' },
        kpi3: { label: 'KPI 3' },
        kpi4: { label: 'KPI 4' },
        kpi5: { label: 'KPI 5' },
        kpi6: { label: 'KPI 6' },
        chart1: { label: 'Chart 1' },
        chart2: { label: 'Chart 2' },
        table1: { label: 'Table 1' },
        table2: { label: 'Table 2' },
        [AUTOMATION_RATE_CARD]: { label: 'Automation Rate' },
        [AUTOMATED_INTERACTIONS_CARD]: { label: 'Automated Interactions' },
        [TIME_SAVED_CARD]: { label: 'Time Saved' },
        [COST_SAVED_CARD]: { label: 'Cost Saved' },
        [CONFIGURABLE_BAR_GRAPH]: { label: 'Automation Rate Chart' },
        [CONFIGURABLE_LINE_GRAPH]: { label: 'Automation Line Chart' },
        [PERFORMANCE_TABLE]: { label: 'Performance Table' },
        [ARTICLE_RECOMMENDATION_TABLE]: {
            label: 'Article Recommendation Table',
        },
        [FLOWS_TABLE]: { label: 'Flows Table' },
        [ORDER_MANAGEMENT_TABLE]: { label: 'Order Management Table' },
        [HANDOVER_INTERACTIONS_CARD]: { label: 'Handover Interactions' },
        [DECREASE_IN_RESOLUTION_TIME_CARD]: {
            label: 'Decrease in Resolution Time',
        },
        [DECREASE_IN_FRT_CARD]: { label: 'Decrease in FRT' },
    },
}

const baseRenderProps = {
    reportConfig: reportConfigMock,
    tabId: TAB_ALL_AGENTS,
    tabName: 'All Agents',
    dashboardId: DASHBOARD_OVERVIEW,
    DashboardComponent: DashboardComponentMock,
}

describe('DashboardLayoutRenderer', () => {
    beforeEach(() => {
        DashboardComponentMock.mockClear()
        mockedUseSaveSelectedTable.mockReturnValue({
            onSelect: vi.fn(),
        })
    })

    it('should render all charts in the correct order', () => {
        render(
            <DashboardLayoutRenderer
                {...baseRenderProps}
                defaultLayoutConfig={DEFAULT_ANALYTICS_OVERVIEW_LAYOUT}
            />,
        )

        expect(
            screen.getByText(`Chart: ${AUTOMATION_RATE_CARD}`),
        ).toBeInTheDocument()
        expect(
            screen.getByText(`Chart: ${AUTOMATED_INTERACTIONS_CARD}`),
        ).toBeInTheDocument()
        expect(
            screen.getByText(`Chart: ${TIME_SAVED_CARD}`),
        ).toBeInTheDocument()
        expect(
            screen.getByText(`Chart: ${COST_SAVED_CARD}`),
        ).toBeInTheDocument()
        expect(
            screen.getByText(`Chart: ${CONFIGURABLE_BAR_GRAPH}`),
        ).toBeInTheDocument()
        expect(
            screen.getByText(`Chart: ${CONFIGURABLE_LINE_GRAPH}`),
        ).toBeInTheDocument()
        expect(
            screen.getByText(`Chart: ${PERFORMANCE_TABLE}`),
        ).toBeInTheDocument()
    })

    it('should render default sections alongside saved sections when section IDs differ', () => {
        mockedUseGetManagedDashboardsLayoutConfig.mockReturnValueOnce({
            isLoading: false,
            layoutConfig: {
                sections: [
                    {
                        id: 'kpis',
                        type: ChartType.Card,
                        items: [
                            {
                                chartId:
                                    'unknown_chart_id_not_in_report_config',
                                gridSize: 3,
                                visibility: true,
                            },
                            {
                                chartId: AUTOMATION_RATE_CARD,
                                gridSize: 3,
                                visibility: true,
                            },
                        ],
                    },
                ],
            },
        })

        render(
            <DashboardLayoutRenderer
                {...baseRenderProps}
                defaultLayoutConfig={DEFAULT_ANALYTICS_OVERVIEW_LAYOUT}
            />,
        )

        expect(
            screen.getByText(`Chart: ${AUTOMATION_RATE_CARD}`),
        ).toBeInTheDocument()
    })

    it('should render custom layout configuration', () => {
        const customConfig: DashboardLayoutConfig = {
            sections: [
                {
                    id: 'kpis',
                    type: ChartType.Card,
                    items: [
                        {
                            chartId: AUTOMATION_RATE_CARD,
                            gridSize: 6,
                            visibility: true,
                        },
                        {
                            chartId: TIME_SAVED_CARD,
                            gridSize: 6,
                            visibility: true,
                        },
                    ],
                },
            ],
        }

        render(
            <DashboardLayoutRenderer
                {...baseRenderProps}
                defaultLayoutConfig={customConfig}
            />,
        )

        expect(
            screen.getByText(`Chart: ${AUTOMATION_RATE_CARD}`),
        ).toBeInTheDocument()
        expect(
            screen.getByText(`Chart: ${TIME_SAVED_CARD}`),
        ).toBeInTheDocument()
    })

    describe('KPIs section', () => {
        const sixKpisConfig = createKpisLayoutConfig([
            'kpi1',
            'kpi2',
            'kpi3',
            'kpi4',
            'kpi5',
            'kpi6',
        ])

        it('should render KPI items with tabId', () => {
            render(
                <DashboardLayoutRenderer
                    {...baseRenderProps}
                    defaultLayoutConfig={createKpisLayoutConfig()}
                />,
            )

            expect(screen.getByText('Chart: kpi1')).toBeInTheDocument()
            expect(screen.getByText('Chart: kpi2')).toBeInTheDocument()
            expect(screen.getByText('Chart: kpi3')).toBeInTheDocument()
            expect(screen.getByText('Chart: kpi4')).toBeInTheDocument()
        })

        it('should only render KPI items with visibility true', () => {
            const configWithHiddenItems: DashboardLayoutConfig = {
                sections: [
                    {
                        id: 'kpis',
                        type: ChartType.Card,
                        items: [
                            {
                                chartId: AUTOMATION_RATE_CARD,
                                gridSize: 3,
                                visibility: true,
                            },
                            {
                                chartId: TIME_SAVED_CARD,
                                gridSize: 3,
                                visibility: false,
                            },
                            {
                                chartId: AUTOMATED_INTERACTIONS_CARD,
                                gridSize: 3,
                                visibility: true,
                            },
                        ],
                    },
                ],
            }

            render(
                <DashboardLayoutRenderer
                    {...baseRenderProps}
                    defaultLayoutConfig={configWithHiddenItems}
                />,
            )

            expect(
                screen.getByText(`Chart: ${AUTOMATION_RATE_CARD}`),
            ).toBeInTheDocument()
            expect(
                screen.queryByText(`Chart: ${TIME_SAVED_CARD}`),
            ).not.toBeInTheDocument()
            expect(
                screen.getByText(`Chart: ${AUTOMATED_INTERACTIONS_CARD}`),
            ).toBeInTheDocument()
        })

        it('should not show button when exactly 4 KPIs', () => {
            render(
                <DashboardLayoutRenderer
                    {...baseRenderProps}
                    defaultLayoutConfig={createKpisLayoutConfig()}
                />,
            )

            expect(
                screen.queryByRole('button', { name: /show \d+ more/i }),
            ).not.toBeInTheDocument()
        })

        it('should not show button when less than 4 KPIs', () => {
            render(
                <DashboardLayoutRenderer
                    {...baseRenderProps}
                    defaultLayoutConfig={createKpisLayoutConfig([
                        'kpi1',
                        'kpi2',
                    ])}
                />,
            )

            expect(
                screen.queryByRole('button', { name: /show \d+ more/i }),
            ).not.toBeInTheDocument()
        })

        it('should show button when more than 4 KPIs', () => {
            render(
                <DashboardLayoutRenderer
                    {...baseRenderProps}
                    defaultLayoutConfig={sixKpisConfig}
                />,
            )

            expect(
                screen.getByRole('button', { name: /show 2 more/i }),
            ).toBeInTheDocument()
        })

        it('should show only first 4 KPIs initially', () => {
            render(
                <DashboardLayoutRenderer
                    {...baseRenderProps}
                    defaultLayoutConfig={sixKpisConfig}
                />,
            )

            expect(screen.getByText('Chart: kpi1')).toBeInTheDocument()
            expect(screen.getByText('Chart: kpi4')).toBeInTheDocument()
            expect(screen.queryByText('Chart: kpi5')).not.toBeInTheDocument()
            expect(screen.queryByText('Chart: kpi6')).not.toBeInTheDocument()
        })

        it('should expand to show all KPIs when button clicked', async () => {
            const user = userEvent.setup()

            render(
                <DashboardLayoutRenderer
                    {...baseRenderProps}
                    defaultLayoutConfig={sixKpisConfig}
                />,
            )

            await user.click(
                screen.getByRole('button', { name: /show 2 more/i }),
            )

            expect(screen.getByText('Chart: kpi5')).toBeInTheDocument()
            expect(screen.getByText('Chart: kpi6')).toBeInTheDocument()
            expect(
                screen.getByRole('button', { name: /show less/i }),
            ).toBeInTheDocument()
        })

        it('should collapse back to 4 KPIs when show less clicked', async () => {
            const user = userEvent.setup()

            render(
                <DashboardLayoutRenderer
                    {...baseRenderProps}
                    defaultLayoutConfig={sixKpisConfig}
                />,
            )

            await user.click(
                screen.getByRole('button', { name: /show 2 more/i }),
            )
            await user.click(screen.getByRole('button', { name: /show less/i }))

            expect(screen.queryByText('Chart: kpi5')).not.toBeInTheDocument()
            expect(screen.queryByText('Chart: kpi6')).not.toBeInTheDocument()
            expect(
                screen.getByRole('button', { name: /show 2 more/i }),
            ).toBeInTheDocument()
        })
    })

    describe('Charts section', () => {
        it('should render chart items', () => {
            render(
                <DashboardLayoutRenderer
                    {...baseRenderProps}
                    defaultLayoutConfig={chartsLayoutConfig}
                />,
            )

            expect(screen.getByText('Chart: chart1')).toBeInTheDocument()
            expect(screen.getByText('Chart: chart2')).toBeInTheDocument()
        })
    })

    describe('Table section', () => {
        it('should render table items', () => {
            render(
                <DashboardLayoutRenderer
                    {...baseRenderProps}
                    defaultLayoutConfig={tableLayoutConfig}
                />,
            )

            expect(screen.getByText('Chart: table1')).toBeInTheDocument()
        })
    })

    describe('Mixed sections', () => {
        it('should render all section types correctly', () => {
            render(
                <DashboardLayoutRenderer
                    {...baseRenderProps}
                    defaultLayoutConfig={mixedLayoutConfig}
                />,
            )

            expect(screen.getByText('Chart: kpi1')).toBeInTheDocument()
            expect(screen.getByText('Chart: kpi2')).toBeInTheDocument()
            expect(screen.getByText('Chart: chart1')).toBeInTheDocument()
            expect(screen.getByText('Chart: chart2')).toBeInTheDocument()
            expect(screen.getByText('Chart: table1')).toBeInTheDocument()
        })
    })

    describe('MetricsConfigurator integration', () => {
        it('should render MetricsConfigurator', () => {
            render(
                <DashboardLayoutRenderer
                    {...baseRenderProps}
                    defaultLayoutConfig={createKpisLayoutConfig()}
                />,
            )

            expect(
                screen.getByText(/MetricsConfigurator with \d+ metrics/),
            ).toBeInTheDocument()
        })

        it('should pass correct metrics to MetricsConfigurator', () => {
            render(
                <DashboardLayoutRenderer
                    {...baseRenderProps}
                    defaultLayoutConfig={createKpisLayoutConfig([
                        'kpi1',
                        'kpi2',
                        'kpi3',
                    ])}
                />,
            )

            expect(
                screen.getByText('MetricsConfigurator with 3 metrics'),
            ).toBeInTheDocument()
        })
    })

    describe('Table section state isolation', () => {
        it('should reset table selection to the first table when tabId changes', async () => {
            const user = userEvent.setup()

            const { rerender } = render(
                <DashboardLayoutRenderer
                    {...baseRenderProps}
                    dashboardId={DASHBOARD_ANALYTICS}
                    defaultLayoutConfig={multiTableLayoutConfig}
                />,
            )

            await user.click(screen.getByRole('radio', { name: 'Table 2' }))
            expect(screen.getByText('Chart: table2')).toBeInTheDocument()

            rerender(
                <DashboardLayoutRenderer
                    {...baseRenderProps}
                    dashboardId={DASHBOARD_ANALYTICS}
                    defaultLayoutConfig={multiTableLayoutConfig}
                    tabId={TAB_SUPPORT_AGENT}
                    tabName="Support Agent"
                />,
            )

            expect(screen.getByText('Chart: table1')).toBeInTheDocument()
            expect(screen.queryByText('Chart: table2')).not.toBeInTheDocument()
        })
    })
})
