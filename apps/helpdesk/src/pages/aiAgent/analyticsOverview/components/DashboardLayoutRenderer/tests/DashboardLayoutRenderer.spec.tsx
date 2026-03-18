import { useFlag } from '@repo/feature-flags'
import { render, screen } from '@testing-library/react'
import userEventLib from '@testing-library/user-event'

import { useGetManagedDashboardsLayoutConfig } from 'domains/reporting/hooks/managed-dashboards/useGetManagedDashboardsLayoutConfig'
import { ChartType } from 'domains/reporting/pages/dashboards/types'
import type { ReportConfig } from 'domains/reporting/pages/dashboards/types'
import { AnalyticsOverviewChart } from 'pages/aiAgent/analyticsOverview/AnalyticsOverviewReportConfig'
import { DashboardLayoutRenderer } from 'pages/aiAgent/analyticsOverview/components/DashboardLayoutRenderer/DashboardLayoutRenderer'
import { DEFAULT_ANALYTICS_OVERVIEW_LAYOUT } from 'pages/aiAgent/analyticsOverview/config/defaultLayoutConfig'
import type { DashboardLayoutConfig } from 'pages/aiAgent/analyticsOverview/types/layoutConfig'
import {
    ManagedDashboardId,
    ManagedDashboardsTabId,
} from 'pages/aiAgent/analyticsOverview/types/layoutConfig'

const { createContext, useContext } =
    jest.requireActual<typeof import('react')>('react')

const ButtonGroupContext = createContext<{
    selectedKey: string | undefined
    onSelectionChange: (key: string) => void
}>({ selectedKey: undefined, onSelectionChange: () => {} })

const mockedUseGetManagedDashboardsLayoutConfig = jest.mocked(
    useGetManagedDashboardsLayoutConfig,
)
const mockedUseFlag = jest.mocked(useFlag)

jest.mock(
    'domains/reporting/hooks/managed-dashboards/useGetManagedDashboardsLayoutConfig',
    () => ({
        useGetManagedDashboardsLayoutConfig: jest.fn(
            ({ defaultLayoutConfig }) => ({
                layoutConfig: defaultLayoutConfig,
                isLoading: false,
            }),
        ),
    }),
)

const DashboardComponentMock = jest.fn(({ chart }: any) => (
    <div data-chart-id={chart}>Chart: {chart}</div>
))

jest.mock('domains/reporting/pages/dashboards/DashboardComponent', () => ({
    DashboardComponent: (props: any) => DashboardComponentMock(props),
}))

jest.mock(
    'pages/aiAgent/analyticsOverview/components/DashboardLayoutRenderer/MetricsConfigurator',
    () => ({
        MetricsConfigurator: ({
            metrics,
        }: {
            metrics: Array<{ id: string; label: string; visibility: boolean }>
        }) => <div>MetricsConfigurator with {metrics.length} metrics</div>,
    }),
)

jest.mock('@repo/feature-flags', () => ({
    FeatureFlagKey: {
        AiAgentAnalyticsDashboardsTrendCards:
            'ai-agent-analytics-dashboards-trend-cards',
    },
    useFlag: jest.fn(),
}))

jest.mock('@gorgias/axiom', () => ({
    ...jest.requireActual('@gorgias/axiom'),
    ButtonGroup: ({
        children,
        selectedKey,
        onSelectionChange,
    }: {
        children: React.ReactNode
        selectedKey?: string
        onSelectionChange?: (key: string) => void
    }) => (
        <ButtonGroupContext.Provider
            value={{
                selectedKey,
                onSelectionChange: onSelectionChange ?? (() => {}),
            }}
        >
            <div role="group">{children}</div>
        </ButtonGroupContext.Provider>
    ),
    ButtonGroupItem: ({
        children,
        id,
    }: {
        children: React.ReactNode
        id?: string
    }) => {
        const { selectedKey, onSelectionChange } =
            useContext(ButtonGroupContext)
        return (
            <button
                role="radio"
                aria-checked={id === selectedKey}
                onClick={() => id && onSelectionChange(id)}
            >
                {children}
            </button>
        )
    },
}))

jest.mock('framer-motion', () => ({
    motion: {
        div: require('react').forwardRef(
            ({ children, onAnimationComplete, ...props }: any, ref: any) => {
                if (onAnimationComplete) {
                    setTimeout(() => onAnimationComplete(), 0)
                }
                return (
                    <div ref={ref} {...props}>
                        {children}
                    </div>
                )
            },
        ),
    },
}))

const createKpisLayoutConfig = (
    chartIds: string[] = ['kpi1', 'kpi2', 'kpi3', 'kpi4'],
) =>
    ({
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
    }) as unknown as DashboardLayoutConfig

const createKpiConfigWithFeatureFlag = (requiresFeatureFlag: boolean) =>
    ({
        sections: [
            {
                id: 'kpis',
                type: ChartType.Card,
                items: [
                    {
                        chartId: 'kpi1' as any,
                        gridSize: 3,
                        visibility: true,
                        requiresFeatureFlag,
                    },
                ],
            },
        ],
    }) as unknown as DashboardLayoutConfig

const chartsLayoutConfig: DashboardLayoutConfig = {
    sections: [
        {
            id: 'charts',
            type: ChartType.Graph,
            items: [
                { chartId: 'chart1' as any, gridSize: 6, visibility: true },
                { chartId: 'chart2' as any, gridSize: 6, visibility: true },
            ],
        },
    ],
}

const tableLayoutConfig: DashboardLayoutConfig = {
    sections: [
        {
            id: 'table',
            type: ChartType.Table,
            items: [
                { chartId: 'table1' as any, gridSize: 12, visibility: true },
            ],
        },
    ],
}

const multiTableLayoutConfig: DashboardLayoutConfig = {
    sections: [
        {
            id: 'tables',
            type: ChartType.Table,
            items: [
                { chartId: 'table1' as any, gridSize: 12, visibility: true },
                { chartId: 'table2' as any, gridSize: 12, visibility: true },
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
                { chartId: 'kpi1' as any, gridSize: 3, visibility: true },
                { chartId: 'kpi2' as any, gridSize: 3, visibility: true },
            ],
        },
        {
            id: 'charts',
            type: ChartType.Graph,
            items: [
                { chartId: 'chart1' as any, gridSize: 6, visibility: true },
                { chartId: 'chart2' as any, gridSize: 6, visibility: true },
            ],
        },
        {
            id: 'table',
            type: ChartType.Table,
            items: [
                { chartId: 'table1' as any, gridSize: 12, visibility: true },
            ],
        },
    ],
}

const reportConfigMock = {
    charts: {
        ['chart']: {
            chartComponent: () => <div>Chart 1</div>,
            label: 'Chart 1 Label',
            csvProducer: null,
            description: 'Description for chart 1',
            chartType: ChartType.Card,
        },
        kpi1: { chartComponent: () => null, label: 'KPI 1' },
        kpi2: { chartComponent: () => null, label: 'KPI 2' },
        kpi3: { chartComponent: () => null, label: 'KPI 3' },
        kpi4: { chartComponent: () => null, label: 'KPI 4' },
        kpi5: { chartComponent: () => null, label: 'KPI 5' },
        kpi6: { chartComponent: () => null, label: 'KPI 6' },
        chart1: { chartComponent: () => null, label: 'Chart 1' },
        chart2: { chartComponent: () => null, label: 'Chart 2' },
        table1: { chartComponent: () => null, label: 'Table 1' },
        table2: { chartComponent: () => null, label: 'Table 2' },
        [AnalyticsOverviewChart.AutomationRateCard]: {
            chartComponent: () => null,
            label: 'Automation Rate',
        },
        [AnalyticsOverviewChart.AutomatedInteractionsCard]: {
            chartComponent: () => null,
            label: 'Automated Interactions',
        },
        [AnalyticsOverviewChart.TimeSavedCard]: {
            chartComponent: () => null,
            label: 'Time Saved',
        },
        [AnalyticsOverviewChart.CostSavedCard]: {
            chartComponent: () => null,
            label: 'Cost Saved',
        },
        [AnalyticsOverviewChart.AutomationRateComboChart]: {
            chartComponent: () => null,
            label: 'Automation Rate Chart',
        },
        [AnalyticsOverviewChart.AutomationLineChart]: {
            chartComponent: () => null,
            label: 'Automation Line Chart',
        },
        [AnalyticsOverviewChart.PerformanceTable]: {
            chartComponent: () => null,
            label: 'Performance Table',
        },
        [AnalyticsOverviewChart.OrderManagementTable]: {
            chartComponent: () => null,
            label: 'Order Management Table',
        },
        [AnalyticsOverviewChart.HandoverInteractionsCard]: {
            chartComponent: () => null,
            label: 'Handover Interactions',
        },
        [AnalyticsOverviewChart.DecreaseInResolutionTimeCard]: {
            chartComponent: () => null,
            label: 'Decrease in Resolution Time',
        },
        [AnalyticsOverviewChart.DecreaseInFRTCard]: {
            chartComponent: () => null,
            label: 'Decrease in FRT',
        },
    },
} as unknown as ReportConfig<string>

describe('DashboardLayoutRenderer', () => {
    beforeEach(() => {
        DashboardComponentMock.mockClear()
    })

    it('should render all charts in the correct order', () => {
        render(
            <DashboardLayoutRenderer
                defaultLayoutConfig={DEFAULT_ANALYTICS_OVERVIEW_LAYOUT}
                reportConfig={reportConfigMock}
                tabId={ManagedDashboardsTabId.AllAgents}
                tabName="All Agents"
                dashboardId={ManagedDashboardId.AiAgentOverview}
            />,
        )

        expect(
            screen.getByText(
                `Chart: ${AnalyticsOverviewChart.AutomationRateCard}`,
            ),
        ).toBeInTheDocument()
        expect(
            screen.getByText(
                `Chart: ${AnalyticsOverviewChart.AutomatedInteractionsCard}`,
            ),
        ).toBeInTheDocument()
        expect(
            screen.getByText(`Chart: ${AnalyticsOverviewChart.TimeSavedCard}`),
        ).toBeInTheDocument()
        expect(
            screen.getByText(`Chart: ${AnalyticsOverviewChart.CostSavedCard}`),
        ).toBeInTheDocument()
        expect(
            screen.getByText(
                `Chart: ${AnalyticsOverviewChart.AutomationRateComboChart}`,
            ),
        ).toBeInTheDocument()
        expect(
            screen.getByText(
                `Chart: ${AnalyticsOverviewChart.AutomationLineChart}`,
            ),
        ).toBeInTheDocument()
        expect(
            screen.getByText(
                `Chart: ${AnalyticsOverviewChart.PerformanceTable}`,
            ),
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
                                    'unknown_chart_id_not_in_report_config' as any,
                                gridSize: 3,
                                visibility: true,
                            },
                            {
                                chartId:
                                    AnalyticsOverviewChart.AutomationRateCard,
                                gridSize: 3,
                                visibility: true,
                            },
                        ],
                    },
                ],
            } as unknown as DashboardLayoutConfig,
        })

        render(
            <DashboardLayoutRenderer
                defaultLayoutConfig={DEFAULT_ANALYTICS_OVERVIEW_LAYOUT}
                reportConfig={reportConfigMock}
                tabId={ManagedDashboardsTabId.AllAgents}
                tabName="All Agents"
                dashboardId={ManagedDashboardId.AiAgentOverview}
            />,
        )

        expect(
            screen.getByText(
                `Chart: ${AnalyticsOverviewChart.AutomationRateCard}`,
            ),
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
                            chartId: AnalyticsOverviewChart.AutomationRateCard,
                            gridSize: 6,
                            visibility: true,
                        },
                        {
                            chartId: AnalyticsOverviewChart.TimeSavedCard,
                            gridSize: 6,
                            visibility: true,
                        },
                    ],
                },
            ],
        }

        render(
            <DashboardLayoutRenderer
                defaultLayoutConfig={customConfig}
                reportConfig={reportConfigMock}
                tabId={ManagedDashboardsTabId.AllAgents}
                tabName="All Agents"
                dashboardId={ManagedDashboardId.AiAgentOverview}
            />,
        )

        expect(
            screen.getByText(
                `Chart: ${AnalyticsOverviewChart.AutomationRateCard}`,
            ),
        ).toBeInTheDocument()
        expect(
            screen.getByText(`Chart: ${AnalyticsOverviewChart.TimeSavedCard}`),
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

        beforeEach(() => {
            mockedUseFlag.mockReturnValue(true)
        })

        afterEach(() => {
            mockedUseFlag.mockReset()
        })

        it('should render KPI items with tabId', () => {
            render(
                <DashboardLayoutRenderer
                    defaultLayoutConfig={createKpisLayoutConfig()}
                    reportConfig={reportConfigMock}
                    tabId={ManagedDashboardsTabId.AllAgents}
                    tabName="All Agents"
                    dashboardId={ManagedDashboardId.AiAgentOverview}
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
                                chartId:
                                    AnalyticsOverviewChart.AutomationRateCard,
                                gridSize: 3,
                                visibility: true,
                            },
                            {
                                chartId: AnalyticsOverviewChart.TimeSavedCard,
                                gridSize: 3,
                                visibility: false,
                            },
                            {
                                chartId:
                                    AnalyticsOverviewChart.AutomatedInteractionsCard,
                                gridSize: 3,
                                visibility: true,
                            },
                        ],
                    },
                ],
            }

            render(
                <DashboardLayoutRenderer
                    defaultLayoutConfig={configWithHiddenItems}
                    reportConfig={reportConfigMock}
                    tabId={ManagedDashboardsTabId.AllAgents}
                    tabName="All Agents"
                    dashboardId={ManagedDashboardId.AiAgentOverview}
                />,
            )

            expect(
                screen.getByText(
                    `Chart: ${AnalyticsOverviewChart.AutomationRateCard}`,
                ),
            ).toBeInTheDocument()
            expect(
                screen.queryByText(
                    `Chart: ${AnalyticsOverviewChart.TimeSavedCard}`,
                ),
            ).not.toBeInTheDocument()
            expect(
                screen.getByText(
                    `Chart: ${AnalyticsOverviewChart.AutomatedInteractionsCard}`,
                ),
            ).toBeInTheDocument()
        })

        it('should not show button when exactly 4 KPIs', () => {
            render(
                <DashboardLayoutRenderer
                    defaultLayoutConfig={createKpisLayoutConfig()}
                    reportConfig={reportConfigMock}
                    tabId={ManagedDashboardsTabId.AllAgents}
                    tabName="All Agents"
                    dashboardId={ManagedDashboardId.AiAgentOverview}
                />,
            )

            expect(
                screen.queryByRole('button', { name: /show \d+ more/i }),
            ).not.toBeInTheDocument()
        })

        it('should not show button when less than 4 KPIs', () => {
            render(
                <DashboardLayoutRenderer
                    defaultLayoutConfig={createKpisLayoutConfig([
                        'kpi1',
                        'kpi2',
                    ])}
                    reportConfig={reportConfigMock}
                    tabId={ManagedDashboardsTabId.AllAgents}
                    tabName="All Agents"
                    dashboardId={ManagedDashboardId.AiAgentOverview}
                />,
            )

            expect(
                screen.queryByRole('button', { name: /show \d+ more/i }),
            ).not.toBeInTheDocument()
        })

        it('should show button when more than 4 KPIs', () => {
            render(
                <DashboardLayoutRenderer
                    defaultLayoutConfig={sixKpisConfig}
                    reportConfig={reportConfigMock}
                    tabId={ManagedDashboardsTabId.AllAgents}
                    tabName="All Agents"
                    dashboardId={ManagedDashboardId.AiAgentOverview}
                />,
            )

            expect(
                screen.getByRole('button', { name: /show 2 more/i }),
            ).toBeInTheDocument()
        })

        it('should show only first 4 KPIs initially', () => {
            render(
                <DashboardLayoutRenderer
                    defaultLayoutConfig={sixKpisConfig}
                    reportConfig={reportConfigMock}
                    tabId={ManagedDashboardsTabId.AllAgents}
                    tabName="All Agents"
                    dashboardId={ManagedDashboardId.AiAgentOverview}
                />,
            )

            expect(screen.getByText('Chart: kpi1')).toBeInTheDocument()
            expect(screen.getByText('Chart: kpi4')).toBeInTheDocument()
            expect(screen.queryByText('Chart: kpi5')).not.toBeInTheDocument()
            expect(screen.queryByText('Chart: kpi6')).not.toBeInTheDocument()
        })

        it('should expand to show all KPIs when button clicked', async () => {
            const user = userEventLib.setup()

            render(
                <DashboardLayoutRenderer
                    defaultLayoutConfig={sixKpisConfig}
                    reportConfig={reportConfigMock}
                    tabId={ManagedDashboardsTabId.AllAgents}
                    tabName="All Agents"
                    dashboardId={ManagedDashboardId.AiAgentOverview}
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
            const user = userEventLib.setup()

            render(
                <DashboardLayoutRenderer
                    defaultLayoutConfig={sixKpisConfig}
                    reportConfig={reportConfigMock}
                    tabId={ManagedDashboardsTabId.AllAgents}
                    tabName="All Agents"
                    dashboardId={ManagedDashboardId.AiAgentOverview}
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
                    defaultLayoutConfig={chartsLayoutConfig}
                    reportConfig={reportConfigMock}
                    tabId={ManagedDashboardsTabId.AllAgents}
                    tabName="All Agents"
                    dashboardId={ManagedDashboardId.AiAgentOverview}
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
                    defaultLayoutConfig={tableLayoutConfig}
                    reportConfig={reportConfigMock}
                    tabId={ManagedDashboardsTabId.AllAgents}
                    tabName="All Agents"
                    dashboardId={ManagedDashboardId.AiAgentOverview}
                />,
            )

            expect(screen.getByText('Chart: table1')).toBeInTheDocument()
        })
    })

    describe('Mixed sections', () => {
        it('should render all section types correctly', () => {
            render(
                <DashboardLayoutRenderer
                    defaultLayoutConfig={mixedLayoutConfig}
                    reportConfig={reportConfigMock}
                    tabId={ManagedDashboardsTabId.AllAgents}
                    tabName="All Agents"
                    dashboardId={ManagedDashboardId.AiAgentOverview}
                />,
            )

            expect(screen.getByText('Chart: kpi1')).toBeInTheDocument()
            expect(screen.getByText('Chart: kpi2')).toBeInTheDocument()
            expect(screen.getByText('Chart: chart1')).toBeInTheDocument()
            expect(screen.getByText('Chart: chart2')).toBeInTheDocument()
            expect(screen.getByText('Chart: table1')).toBeInTheDocument()
        })
    })

    describe('Entrance animations', () => {
        it('should handle more than 4 KPIs with cycling animations', () => {
            const manyKpisConfig = createKpisLayoutConfig([
                'kpi1',
                'kpi2',
                'kpi3',
                'kpi4',
                'kpi5',
            ])

            render(
                <DashboardLayoutRenderer
                    defaultLayoutConfig={manyKpisConfig}
                    reportConfig={reportConfigMock}
                    tabId={ManagedDashboardsTabId.AllAgents}
                    tabName="All Agents"
                    dashboardId={ManagedDashboardId.AiAgentOverview}
                />,
            )

            const kpiElements = screen.getAllByText(/Chart: kpi/)
            expect(kpiElements).toHaveLength(5)
        })
    })

    describe('MetricsConfigurator integration', () => {
        beforeEach(() => {
            mockedUseFlag.mockReset()
        })

        it('should render MetricsConfigurator when feature flag is enabled', () => {
            mockedUseFlag.mockReturnValue(true)

            render(
                <DashboardLayoutRenderer
                    defaultLayoutConfig={createKpisLayoutConfig()}
                    reportConfig={reportConfigMock}
                    tabId={ManagedDashboardsTabId.AllAgents}
                    tabName="All Agents"
                    dashboardId={ManagedDashboardId.AiAgentOverview}
                />,
            )

            expect(
                screen.getByText(/MetricsConfigurator with \d+ metrics/),
            ).toBeInTheDocument()
        })

        it('should not render MetricsConfigurator when feature flag is disabled', () => {
            mockedUseFlag.mockReturnValue(false)

            render(
                <DashboardLayoutRenderer
                    defaultLayoutConfig={createKpisLayoutConfig()}
                    reportConfig={reportConfigMock}
                    tabId={ManagedDashboardsTabId.AllAgents}
                    tabName="All Agents"
                    dashboardId={ManagedDashboardId.AiAgentOverview}
                />,
            )

            expect(
                screen.queryByText(/MetricsConfigurator with \d+ metrics/),
            ).not.toBeInTheDocument()
        })

        it('should pass correct metrics to MetricsConfigurator', () => {
            mockedUseFlag.mockReturnValue(true)

            render(
                <DashboardLayoutRenderer
                    defaultLayoutConfig={createKpisLayoutConfig([
                        'kpi1',
                        'kpi2',
                        'kpi3',
                    ])}
                    reportConfig={reportConfigMock}
                    tabId={ManagedDashboardsTabId.AllAgents}
                    tabName="All Agents"
                    dashboardId={ManagedDashboardId.AiAgentOverview}
                />,
            )

            expect(
                screen.getByText('MetricsConfigurator with 3 metrics'),
            ).toBeInTheDocument()
        })
    })

    describe('Table section state isolation', () => {
        it('should reset table selection to the first table when tabId changes', async () => {
            const user = userEventLib.setup()

            const { rerender } = render(
                <DashboardLayoutRenderer
                    defaultLayoutConfig={multiTableLayoutConfig}
                    reportConfig={reportConfigMock}
                    tabId={ManagedDashboardsTabId.AllAgents}
                    tabName="All Agents"
                    dashboardId={ManagedDashboardId.AiAgentAnalytics}
                />,
            )

            await user.click(screen.getByRole('radio', { name: 'Table 2' }))
            expect(screen.getByText('Chart: table2')).toBeInTheDocument()

            rerender(
                <DashboardLayoutRenderer
                    defaultLayoutConfig={multiTableLayoutConfig}
                    reportConfig={reportConfigMock}
                    tabId={ManagedDashboardsTabId.SupportAgent}
                    tabName="Support Agent"
                    dashboardId={ManagedDashboardId.AiAgentAnalytics}
                />,
            )

            expect(screen.getByText('Chart: table1')).toBeInTheDocument()
            expect(screen.queryByText('Chart: table2')).not.toBeInTheDocument()
        })
    })

    describe('requiresFeatureFlag filtering', () => {
        beforeEach(() => {
            mockedUseFlag.mockReset()
        })

        it('should show item when requiresFeatureFlag=true and feature flag=true', () => {
            mockedUseFlag.mockReturnValue(true)

            render(
                <DashboardLayoutRenderer
                    defaultLayoutConfig={createKpiConfigWithFeatureFlag(true)}
                    reportConfig={reportConfigMock}
                    tabId={ManagedDashboardsTabId.AllAgents}
                    tabName="All Agents"
                    dashboardId={ManagedDashboardId.AiAgentOverview}
                />,
            )

            expect(screen.getByText('Chart: kpi1')).toBeInTheDocument()
        })

        it('should show item when requiresFeatureFlag=false regardless of feature flag', () => {
            mockedUseFlag.mockReturnValue(false)

            render(
                <DashboardLayoutRenderer
                    defaultLayoutConfig={createKpiConfigWithFeatureFlag(false)}
                    reportConfig={reportConfigMock}
                    tabId={ManagedDashboardsTabId.AllAgents}
                    tabName="All Agents"
                    dashboardId={ManagedDashboardId.AiAgentOverview}
                />,
            )

            expect(screen.getByText('Chart: kpi1')).toBeInTheDocument()
        })

        it('should hide item when requiresFeatureFlag=true and feature flag=false', () => {
            mockedUseFlag.mockReturnValue(false)

            render(
                <DashboardLayoutRenderer
                    defaultLayoutConfig={createKpiConfigWithFeatureFlag(true)}
                    reportConfig={reportConfigMock}
                    tabId={ManagedDashboardsTabId.AllAgents}
                    tabName="All Agents"
                    dashboardId={ManagedDashboardId.AiAgentOverview}
                />,
            )

            expect(screen.queryByText('Chart: kpi1')).not.toBeInTheDocument()
        })
    })
})
