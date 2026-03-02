import { useFlag } from '@repo/feature-flags'
import { render, screen } from '@testing-library/react'

import { KpisSection } from 'pages/aiAgent/analyticsOverview/components/DashboardLayoutRenderer/KpisSection'
import type {
    AnalyticsChartType,
    DashboardLayoutConfig,
    LayoutSection,
} from 'pages/aiAgent/analyticsOverview/types/layoutConfig'

jest.mock(
    'pages/aiAgent/analyticsOverview/components/DashboardLayoutRenderer/AnimatedTrendCard',
    () => ({
        AnimatedTrendCard: ({ item }: any) => (
            <div data-chart-id={item.chartId}>Chart: {item.chartId}</div>
        ),
    }),
)

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

jest.mock('@repo/reporting', () => ({
    ShowMoreList: ({ children, containerClassName }: any) => (
        <div
            className={containerClassName}
            role="region"
            aria-label="show more list"
        >
            {children}
        </div>
    ),
}))

const mockedUseFlag = jest.mocked(useFlag)

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
            type: 'kpis',
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
    type: 'kpis',
    items: items.map(({ chartId, visibility, requiresFeatureFlag }) => ({
        chartId: chartId as AnalyticsChartType,
        gridSize: 3,
        visibility,
        ...(requiresFeatureFlag !== undefined ? { requiresFeatureFlag } : {}),
    })),
})

describe('KpisSection', () => {
    beforeEach(() => {
        mockedUseFlag.mockReset()
    })

    describe('when feature flag is enabled', () => {
        beforeEach(() => {
            mockedUseFlag.mockReturnValue(true)
        })

        it('should render ShowMoreList when feature flag is on', () => {
            render(
                <KpisSection
                    section={makeSection([
                        { chartId: 'kpi1', visibility: true },
                    ])}
                    reportConfig={reportConfigMock}
                    layoutConfig={defaultLayoutConfig}
                />,
            )

            expect(
                screen.getByRole('region', { name: 'show more list' }),
            ).toBeInTheDocument()
        })

        it('should render MetricsConfigurator when dashboardId is provided', () => {
            render(
                <KpisSection
                    section={makeSection([
                        { chartId: 'kpi1', visibility: true },
                    ])}
                    reportConfig={reportConfigMock}
                    dashboardId="test-dashboard"
                    layoutConfig={defaultLayoutConfig}
                />,
            )

            expect(
                screen.getByText(/MetricsConfigurator with \d+ metrics/),
            ).toBeInTheDocument()
        })

        it('should not render MetricsConfigurator when dashboardId is not provided', () => {
            render(
                <KpisSection
                    section={makeSection([
                        { chartId: 'kpi1', visibility: true },
                    ])}
                    reportConfig={reportConfigMock}
                    layoutConfig={defaultLayoutConfig}
                />,
            )

            expect(
                screen.queryByText(/MetricsConfigurator with \d+ metrics/),
            ).not.toBeInTheDocument()
        })

        it('should pass correct keyKpisConfig (all items) to MetricsConfigurator', () => {
            render(
                <KpisSection
                    section={makeSection([
                        { chartId: 'kpi1', visibility: true },
                        { chartId: 'kpi2', visibility: false },
                        { chartId: 'kpi3', visibility: true },
                    ])}
                    reportConfig={reportConfigMock}
                    dashboardId="test-dashboard"
                    layoutConfig={defaultLayoutConfig}
                />,
            )

            expect(
                screen.getByText('MetricsConfigurator with 3 metrics'),
            ).toBeInTheDocument()
        })

        it('should only render visible items', () => {
            render(
                <KpisSection
                    section={makeSection([
                        { chartId: 'kpi1', visibility: true },
                        { chartId: 'kpi2', visibility: false },
                        { chartId: 'kpi3', visibility: true },
                    ])}
                    reportConfig={reportConfigMock}
                    layoutConfig={defaultLayoutConfig}
                />,
            )

            expect(screen.getByText('Chart: kpi1')).toBeInTheDocument()
            expect(screen.queryByText('Chart: kpi2')).not.toBeInTheDocument()
            expect(screen.getByText('Chart: kpi3')).toBeInTheDocument()
        })

        it('should show item when requiresFeatureFlag=true and feature flag is on', () => {
            render(
                <KpisSection
                    section={makeSection([
                        {
                            chartId: 'kpi1',
                            visibility: true,
                            requiresFeatureFlag: true,
                        },
                    ])}
                    reportConfig={reportConfigMock}
                    layoutConfig={defaultLayoutConfig}
                />,
            )

            expect(screen.getByText('Chart: kpi1')).toBeInTheDocument()
        })

        it('should show item when requiresFeatureFlag=false and feature flag is on', () => {
            render(
                <KpisSection
                    section={makeSection([
                        {
                            chartId: 'kpi1',
                            visibility: true,
                            requiresFeatureFlag: false,
                        },
                    ])}
                    reportConfig={reportConfigMock}
                    layoutConfig={defaultLayoutConfig}
                />,
            )

            expect(screen.getByText('Chart: kpi1')).toBeInTheDocument()
        })
    })

    describe('when feature flag is disabled', () => {
        beforeEach(() => {
            mockedUseFlag.mockReturnValue(false)
        })

        it('should render plain div instead of ShowMoreList', () => {
            render(
                <KpisSection
                    section={makeSection([
                        { chartId: 'kpi1', visibility: true },
                    ])}
                    reportConfig={reportConfigMock}
                    layoutConfig={defaultLayoutConfig}
                />,
            )

            expect(
                screen.queryByRole('region', { name: 'show more list' }),
            ).not.toBeInTheDocument()
            expect(screen.getByText('Chart: kpi1')).toBeInTheDocument()
        })

        it('should not render MetricsConfigurator even when dashboardId is provided', () => {
            render(
                <KpisSection
                    section={makeSection([
                        { chartId: 'kpi1', visibility: true },
                    ])}
                    reportConfig={reportConfigMock}
                    dashboardId="test-dashboard"
                    layoutConfig={defaultLayoutConfig}
                />,
            )

            expect(
                screen.queryByText(/MetricsConfigurator with \d+ metrics/),
            ).not.toBeInTheDocument()
        })

        it('should only render visible items', () => {
            render(
                <KpisSection
                    section={makeSection([
                        { chartId: 'kpi1', visibility: true },
                        { chartId: 'kpi2', visibility: false },
                    ])}
                    reportConfig={reportConfigMock}
                    layoutConfig={defaultLayoutConfig}
                />,
            )

            expect(screen.getByText('Chart: kpi1')).toBeInTheDocument()
            expect(screen.queryByText('Chart: kpi2')).not.toBeInTheDocument()
        })

        it('should hide item when requiresFeatureFlag=true and feature flag is off', () => {
            render(
                <KpisSection
                    section={makeSection([
                        {
                            chartId: 'kpi1',
                            visibility: true,
                            requiresFeatureFlag: true,
                        },
                    ])}
                    reportConfig={reportConfigMock}
                    layoutConfig={defaultLayoutConfig}
                />,
            )

            expect(screen.queryByText('Chart: kpi1')).not.toBeInTheDocument()
        })

        it('should show item when requiresFeatureFlag=false and feature flag is off', () => {
            render(
                <KpisSection
                    section={makeSection([
                        {
                            chartId: 'kpi1',
                            visibility: true,
                            requiresFeatureFlag: false,
                        },
                    ])}
                    reportConfig={reportConfigMock}
                    layoutConfig={defaultLayoutConfig}
                />,
            )

            expect(screen.getByText('Chart: kpi1')).toBeInTheDocument()
        })

        it('should render items when tabKey is provided and feature flag is off', () => {
            render(
                <KpisSection
                    section={makeSection([
                        { chartId: 'kpi1', visibility: true },
                    ])}
                    reportConfig={reportConfigMock}
                    tabKey="test-tab"
                    layoutConfig={defaultLayoutConfig}
                />,
            )

            expect(screen.getByText('Chart: kpi1')).toBeInTheDocument()
        })
    })

    describe('tabKey prop', () => {
        beforeEach(() => {
            mockedUseFlag.mockReturnValue(true)
        })

        it('should render items regardless of tabKey', () => {
            render(
                <KpisSection
                    section={makeSection([
                        { chartId: 'kpi1', visibility: true },
                        { chartId: 'kpi2', visibility: true },
                    ])}
                    reportConfig={reportConfigMock}
                    tabKey="test-tab"
                    layoutConfig={defaultLayoutConfig}
                />,
            )

            expect(screen.getByText('Chart: kpi1')).toBeInTheDocument()
            expect(screen.getByText('Chart: kpi2')).toBeInTheDocument()
        })
    })
})
