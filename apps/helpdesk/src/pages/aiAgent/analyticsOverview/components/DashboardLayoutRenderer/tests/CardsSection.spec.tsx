import { useFlagWithLoading } from '@repo/feature-flags'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { ChartType } from 'domains/reporting/pages/dashboards/types'
import { CardsSection } from 'pages/aiAgent/analyticsOverview/components/DashboardLayoutRenderer/CardsSection'
import type {
    AnalyticsChartType,
    DashboardLayoutConfig,
    LayoutSection,
} from 'pages/aiAgent/analyticsOverview/types/layoutConfig'
import {
    ManagedDashboardId,
    ManagedDashboardsTabId,
} from 'pages/aiAgent/analyticsOverview/types/layoutConfig'

jest.mock('domains/reporting/pages/dashboards/DashboardComponent', () => ({
    DashboardComponent: ({ chart }: any) => <div>Chart: {chart}</div>,
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
    useFlagWithLoading: jest.fn(),
}))

jest.mock('@repo/reporting', () => {
    const React = require('react')
    const ShowMoreList = ({ children, containerClassName }: any) => {
        const [isExpanded, setIsExpanded] = React.useState(false)
        return (
            <div
                className={containerClassName}
                role="region"
                aria-label="show more list"
            >
                <button onClick={() => setIsExpanded((v: boolean) => !v)}>
                    {isExpanded ? 'Show less' : 'Show more'}
                </button>
                {children}
            </div>
        )
    }
    return { ShowMoreList }
})

const mockedUseFlagWithLoading = jest.mocked(useFlagWithLoading)

const reportConfigMock = {
    charts: {
        kpi1: { chartComponent: () => null, label: 'KPI 1' },
        kpi2: { chartComponent: () => null, label: 'KPI 2' },
        kpi3: { chartComponent: () => null, label: 'KPI 3' },
        kpi4: { chartComponent: () => null, label: 'KPI 4' },
        kpi5: { chartComponent: () => null, label: 'KPI 5' },
        kpi6: { chartComponent: () => null, label: 'KPI 6' },
    },
} as any

const defaultLayoutConfig: DashboardLayoutConfig = {
    sections: [
        {
            id: 'kpis',
            type: ChartType.Card,
            items: [],
        },
    ],
}

const makeSection = (
    items: Array<{
        chartId: string
        visibility: boolean
        requiresFeatureFlag?: boolean
    }>,
): LayoutSection => ({
    id: 'kpis',
    type: ChartType.Card,
    items: items.map(({ chartId, visibility, requiresFeatureFlag }) => ({
        chartId: chartId as AnalyticsChartType,
        gridSize: 3,
        visibility,
        ...(requiresFeatureFlag !== undefined ? { requiresFeatureFlag } : {}),
    })),
})

describe('CardsSection', () => {
    beforeEach(() => {
        mockedUseFlagWithLoading.mockReset()
    })

    describe('when feature flag is enabled', () => {
        beforeEach(() => {
            mockedUseFlagWithLoading.mockReturnValue({
                value: true,
                isLoading: false,
            })
        })

        it('should render ShowMoreList when feature flag is on', () => {
            render(
                <CardsSection
                    section={makeSection([
                        { chartId: 'kpi1', visibility: true },
                    ])}
                    reportConfig={reportConfigMock}
                    layoutConfig={defaultLayoutConfig}
                    dashboardId={ManagedDashboardId.AiAgentAnalytics}
                    tabId={ManagedDashboardsTabId.AllAgents}
                    tabName="Main"
                />,
            )

            expect(
                screen.getByRole('region', { name: 'show more list' }),
            ).toBeInTheDocument()
        })

        it('should render MetricsConfigurator when dashboardId is provided', () => {
            render(
                <CardsSection
                    section={makeSection([
                        { chartId: 'kpi1', visibility: true },
                    ])}
                    reportConfig={reportConfigMock}
                    dashboardId={ManagedDashboardId.AiAgentAnalytics}
                    layoutConfig={defaultLayoutConfig}
                    tabId={ManagedDashboardsTabId.AllAgents}
                    tabName="Main"
                />,
            )

            expect(
                screen.getByText(/MetricsConfigurator with \d+ metrics/),
            ).toBeInTheDocument()
        })

        it('should pass correct keyKpisConfig (all items) to MetricsConfigurator', () => {
            render(
                <CardsSection
                    section={makeSection([
                        { chartId: 'kpi1', visibility: true },
                        { chartId: 'kpi2', visibility: false },
                        { chartId: 'kpi3', visibility: true },
                    ])}
                    reportConfig={reportConfigMock}
                    dashboardId={ManagedDashboardId.AiAgentAnalytics}
                    layoutConfig={defaultLayoutConfig}
                    tabId={ManagedDashboardsTabId.AllAgents}
                    tabName="Main"
                />,
            )

            expect(
                screen.getByText('MetricsConfigurator with 3 metrics'),
            ).toBeInTheDocument()
        })

        it('should only render visible items', () => {
            render(
                <CardsSection
                    section={makeSection([
                        { chartId: 'kpi1', visibility: true },
                        { chartId: 'kpi2', visibility: false },
                        { chartId: 'kpi3', visibility: true },
                    ])}
                    reportConfig={reportConfigMock}
                    layoutConfig={defaultLayoutConfig}
                    dashboardId={ManagedDashboardId.AiAgentAnalytics}
                    tabId={ManagedDashboardsTabId.AllAgents}
                    tabName="Main"
                />,
            )

            expect(screen.getByText('Chart: kpi1')).toBeInTheDocument()
            expect(screen.queryByText('Chart: kpi2')).not.toBeInTheDocument()
            expect(screen.getByText('Chart: kpi3')).toBeInTheDocument()
        })

        it('should show item when requiresFeatureFlag=true and feature flag is on', () => {
            render(
                <CardsSection
                    section={makeSection([
                        {
                            chartId: 'kpi1',
                            visibility: true,
                            requiresFeatureFlag: true,
                        },
                    ])}
                    reportConfig={reportConfigMock}
                    layoutConfig={defaultLayoutConfig}
                    dashboardId={ManagedDashboardId.AiAgentAnalytics}
                    tabId={ManagedDashboardsTabId.AllAgents}
                    tabName="Main"
                />,
            )

            expect(screen.getByText('Chart: kpi1')).toBeInTheDocument()
        })

        it('should show item when requiresFeatureFlag=false and feature flag is on', () => {
            render(
                <CardsSection
                    section={makeSection([
                        {
                            chartId: 'kpi1',
                            visibility: true,
                            requiresFeatureFlag: false,
                        },
                    ])}
                    reportConfig={reportConfigMock}
                    layoutConfig={defaultLayoutConfig}
                    dashboardId={ManagedDashboardId.AiAgentAnalytics}
                    tabId={ManagedDashboardsTabId.AllAgents}
                    tabName="Main"
                />,
            )

            expect(screen.getByText('Chart: kpi1')).toBeInTheDocument()
        })

        it('should reset ShowMoreList expanded state when switching tabs', async () => {
            const user = userEvent.setup()
            const section = makeSection([{ chartId: 'kpi1', visibility: true }])
            const props = {
                section,
                reportConfig: reportConfigMock,
                layoutConfig: defaultLayoutConfig,
                dashboardId: ManagedDashboardId.AiAgentAnalytics,
                tabName: 'Test',
            }

            const { rerender } = render(
                <CardsSection
                    {...props}
                    tabId={ManagedDashboardsTabId.AllAgents}
                />,
            )

            await user.click(screen.getByRole('button', { name: 'Show more' }))
            expect(
                screen.getByRole('button', { name: 'Show less' }),
            ).toBeInTheDocument()

            rerender(
                <CardsSection
                    {...props}
                    tabId={ManagedDashboardsTabId.SupportAgent}
                />,
            )

            expect(
                screen.queryByRole('button', { name: 'Show less' }),
            ).not.toBeInTheDocument()
            expect(
                screen.getByRole('button', { name: 'Show more' }),
            ).toBeInTheDocument()
        })
    })

    describe('when feature flag is disabled', () => {
        beforeEach(() => {
            mockedUseFlagWithLoading.mockReturnValue({
                value: false,
                isLoading: false,
            })
        })

        it('should render plain div instead of ShowMoreList', () => {
            render(
                <CardsSection
                    section={makeSection([
                        { chartId: 'kpi1', visibility: true },
                    ])}
                    reportConfig={reportConfigMock}
                    layoutConfig={defaultLayoutConfig}
                    dashboardId={ManagedDashboardId.AiAgentAnalytics}
                    tabId={ManagedDashboardsTabId.AllAgents}
                    tabName="Main"
                />,
            )

            expect(
                screen.queryByRole('region', { name: 'show more list' }),
            ).not.toBeInTheDocument()
            expect(screen.getByText('Chart: kpi1')).toBeInTheDocument()
        })

        it('should not render MetricsConfigurator even when dashboardId is provided', () => {
            render(
                <CardsSection
                    section={makeSection([
                        { chartId: 'kpi1', visibility: true },
                    ])}
                    reportConfig={reportConfigMock}
                    dashboardId={ManagedDashboardId.AiAgentAnalytics}
                    layoutConfig={defaultLayoutConfig}
                    tabId={ManagedDashboardsTabId.AllAgents}
                    tabName="Main"
                />,
            )

            expect(
                screen.queryByText(/MetricsConfigurator with \d+ metrics/),
            ).not.toBeInTheDocument()
        })

        it('should only render visible items', () => {
            render(
                <CardsSection
                    section={makeSection([
                        { chartId: 'kpi1', visibility: true },
                        { chartId: 'kpi2', visibility: false },
                    ])}
                    reportConfig={reportConfigMock}
                    layoutConfig={defaultLayoutConfig}
                    dashboardId={ManagedDashboardId.AiAgentAnalytics}
                    tabId={ManagedDashboardsTabId.AllAgents}
                    tabName="Main"
                />,
            )

            expect(screen.getByText('Chart: kpi1')).toBeInTheDocument()
            expect(screen.queryByText('Chart: kpi2')).not.toBeInTheDocument()
        })

        it('should hide item when requiresFeatureFlag=true and feature flag is off', () => {
            render(
                <CardsSection
                    section={makeSection([
                        {
                            chartId: 'kpi1',
                            visibility: true,
                            requiresFeatureFlag: true,
                        },
                    ])}
                    reportConfig={reportConfigMock}
                    layoutConfig={defaultLayoutConfig}
                    dashboardId={ManagedDashboardId.AiAgentAnalytics}
                    tabId={ManagedDashboardsTabId.AllAgents}
                    tabName="Main"
                />,
            )

            expect(screen.queryByText('Chart: kpi1')).not.toBeInTheDocument()
        })

        it('should show item when requiresFeatureFlag=false and feature flag is off', () => {
            render(
                <CardsSection
                    section={makeSection([
                        {
                            chartId: 'kpi1',
                            visibility: true,
                            requiresFeatureFlag: false,
                        },
                    ])}
                    reportConfig={reportConfigMock}
                    layoutConfig={defaultLayoutConfig}
                    dashboardId={ManagedDashboardId.AiAgentAnalytics}
                    tabId={ManagedDashboardsTabId.AllAgents}
                    tabName="Main"
                />,
            )

            expect(screen.getByText('Chart: kpi1')).toBeInTheDocument()
        })

        it('should render items when tabKey is provided and feature flag is off', () => {
            render(
                <CardsSection
                    section={makeSection([
                        { chartId: 'kpi1', visibility: true },
                    ])}
                    reportConfig={reportConfigMock}
                    layoutConfig={defaultLayoutConfig}
                    dashboardId={ManagedDashboardId.AiAgentAnalytics}
                    tabId={ManagedDashboardsTabId.AllAgents}
                    tabName="Main"
                />,
            )

            expect(screen.getByText('Chart: kpi1')).toBeInTheDocument()
        })
    })

    describe('tabKey prop', () => {
        beforeEach(() => {
            mockedUseFlagWithLoading.mockReturnValue({
                value: true,
                isLoading: false,
            })
        })

        it('should render items regardless of tabKey', () => {
            render(
                <CardsSection
                    section={makeSection([
                        { chartId: 'kpi1', visibility: true },
                        { chartId: 'kpi2', visibility: true },
                    ])}
                    reportConfig={reportConfigMock}
                    layoutConfig={defaultLayoutConfig}
                    dashboardId={ManagedDashboardId.AiAgentAnalytics}
                    tabId={ManagedDashboardsTabId.AllAgents}
                    tabName="Main"
                />,
            )

            expect(screen.getByText('Chart: kpi1')).toBeInTheDocument()
            expect(screen.getByText('Chart: kpi2')).toBeInTheDocument()
        })
    })
})
