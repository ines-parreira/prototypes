import type { ComponentType, ReactNode } from 'react'

import { useFlag } from '@repo/feature-flags'
import type { ConfigurableGraphMetricConfig } from '@repo/reporting'
import { ConfigurableGraphType } from '@repo/reporting'
import { assumeMock } from '@repo/testing'
import { render, screen } from '@testing-library/react'

import { ChartType } from 'domains/reporting/pages/dashboards/types'
import { AnalyticsOverviewChart } from 'pages/aiAgent/analyticsOverview/AnalyticsOverviewReportConfig'
import { ConfigurableGraphWrapper } from 'pages/aiAgent/analyticsOverview/components/DashboardLayoutRenderer/ConfigurableGraphWrapper'
import { useDashboardContext } from 'pages/aiAgent/analyticsOverview/components/DashboardLayoutRenderer/DashboardContext'
import {
    ManagedDashboardId,
    ManagedDashboardsTabId,
} from 'pages/aiAgent/analyticsOverview/types/layoutConfig'

jest.mock('@repo/feature-flags')
jest.mock(
    'domains/reporting/hooks/managed-dashboards/useSaveConfigurableGraphSelection',
    () => ({
        useSaveConfigurableGraphSelection: () => ({ onSelect: jest.fn() }),
    }),
)
jest.mock(
    'pages/aiAgent/analyticsOverview/components/DashboardLayoutRenderer/DashboardContext',
    () => ({
        useDashboardContext: jest.fn(),
    }),
)
const useDashboardContextMock = assumeMock(useDashboardContext)
jest.mock(
    'domains/reporting/pages/dashboards/ChartsActionMenu/ChartsActionMenu',
    () => ({
        ChartsActionMenu: () => (
            <div aria-label="charts-action-menu">Charts Action Menu</div>
        ),
    }),
)
jest.mock('@repo/reporting', () => ({
    ...jest.requireActual('@repo/reporting'),
    ConfigurableGraph: ({
        metrics,
        initialDimension,
        initialMeasure,
        actionMenu,
    }: {
        metrics: ConfigurableGraphMetricConfig[]
        initialDimension?: string
        initialMeasure?: string
        actionMenu?: ReactNode
    }) => (
        <div>
            <span>ConfigurableGraph</span>
            {metrics.map((m) => (
                <button key={m.measure}>{m.name}</button>
            ))}
            {initialDimension && <span>dimension:{initialDimension}</span>}
            {initialMeasure && <span>measure:{initialMeasure}</span>}
            {actionMenu}
        </div>
    ),
}))

const useFlagMocked = assumeMock(useFlag)

const defaultDimension = {
    id: 'overall',
    name: 'Overall',
    configurableGraphType: ConfigurableGraphType.TimeSeries,
    useChartData: jest.fn().mockReturnValue({ data: [], isLoading: false }),
}

const defaultMetricConfig: ConfigurableGraphMetricConfig = {
    measure: 'automationRate',
    name: 'Overall automation rate',
    metricFormat: 'decimal-to-percent',
    interpretAs: 'more-is-better',
    useTrendData: jest.fn().mockReturnValue({
        isFetching: false,
        isError: false,
        data: { value: 0.32, prevValue: 0.3 },
    }),
    dimensions: [defaultDimension],
}

const mockChartConfig = { label: 'Automation Rate' } as Parameters<
    typeof ConfigurableGraphWrapper
>[0]['chartConfig']

const DeprecatedChart: ComponentType = () => <div>Deprecated chart</div>

const defaultProps = {
    metrics: [defaultMetricConfig],
    analyticsChartId: AnalyticsOverviewChart.AutomationLineChart,
    DeprecatedChart,
}

describe('ConfigurableGraphWrapper', () => {
    beforeEach(() => {
        useFlagMocked.mockReturnValue(true)
        useDashboardContextMock.mockReturnValue(null)
    })

    afterEach(() => {
        jest.clearAllMocks()
    })

    it('renders ConfigurableGraph when feature flag is on', () => {
        render(<ConfigurableGraphWrapper {...defaultProps} />)

        expect(screen.getByText('ConfigurableGraph')).toBeInTheDocument()
        expect(screen.queryByText('Deprecated chart')).not.toBeInTheDocument()
    })

    it('renders DeprecatedChart when feature flag is off', () => {
        useFlagMocked.mockReturnValue(false)

        render(<ConfigurableGraphWrapper {...defaultProps} />)

        expect(screen.getByText('Deprecated chart')).toBeInTheDocument()
        expect(screen.queryByText('ConfigurableGraph')).not.toBeInTheDocument()
    })

    describe('ChartsActionMenu', () => {
        it('renders ChartsActionMenu when chartId and chartConfig are provided', () => {
            render(
                <ConfigurableGraphWrapper
                    {...defaultProps}
                    chartId="automation-line-chart"
                    chartConfig={mockChartConfig}
                />,
            )

            expect(
                screen.getByLabelText('charts-action-menu'),
            ).toBeInTheDocument()
        })

        it('does not render ChartsActionMenu when chartId is not provided', () => {
            render(
                <ConfigurableGraphWrapper
                    {...defaultProps}
                    chartConfig={mockChartConfig}
                />,
            )

            expect(
                screen.queryByLabelText('charts-action-menu'),
            ).not.toBeInTheDocument()
        })

        it('does not render ChartsActionMenu when chartConfig is not provided', () => {
            render(
                <ConfigurableGraphWrapper
                    {...defaultProps}
                    chartId="automation-line-chart"
                />,
            )

            expect(
                screen.queryByLabelText('charts-action-menu'),
            ).not.toBeInTheDocument()
        })
    })

    describe('dashboard context', () => {
        it('passes saved dimension from context as initialDimension', () => {
            useDashboardContextMock.mockReturnValue({
                dashboardId: ManagedDashboardId.AiAgentOverview,
                tabId: ManagedDashboardsTabId.Overview,
                tabName: 'Main',
                isLoaded: true,
                layoutConfig: {
                    sections: [
                        {
                            id: 'section_graphs',
                            type: ChartType.Graph,
                            items: [
                                {
                                    chartId:
                                        AnalyticsOverviewChart.AutomationLineChart,
                                    gridSize: 6,
                                    visibility: true,
                                    measures: ['automationRate'],
                                    dimensions: ['channel'],
                                },
                            ],
                        },
                    ],
                },
            })

            render(<ConfigurableGraphWrapper {...defaultProps} />)

            expect(screen.getByText('dimension:channel')).toBeInTheDocument()
        })

        it('passes saved measure from context as initialMeasure', () => {
            useDashboardContextMock.mockReturnValue({
                dashboardId: ManagedDashboardId.AiAgentOverview,
                tabId: ManagedDashboardsTabId.Overview,
                tabName: 'Main',
                isLoaded: true,
                layoutConfig: {
                    sections: [
                        {
                            id: 'section_graphs',
                            type: ChartType.Graph,
                            items: [
                                {
                                    chartId:
                                        AnalyticsOverviewChart.AutomationLineChart,
                                    gridSize: 6,
                                    visibility: true,
                                    measures: ['automatedInteractionsCount'],
                                    dimensions: ['overall'],
                                },
                            ],
                        },
                    ],
                },
            })

            render(<ConfigurableGraphWrapper {...defaultProps} />)

            expect(
                screen.getByText('measure:automatedInteractionsCount'),
            ).toBeInTheDocument()
        })

        it('falls back to default when context has no saved item', () => {
            useDashboardContextMock.mockReturnValue({
                dashboardId: ManagedDashboardId.AiAgentOverview,
                tabId: ManagedDashboardsTabId.Overview,
                tabName: 'Main',
                isLoaded: true,
                layoutConfig: { sections: [] },
            })

            render(<ConfigurableGraphWrapper {...defaultProps} />)

            expect(screen.queryByText(/dimension:/)).not.toBeInTheDocument()
            expect(screen.queryByText(/measure:/)).not.toBeInTheDocument()
        })
    })
})
