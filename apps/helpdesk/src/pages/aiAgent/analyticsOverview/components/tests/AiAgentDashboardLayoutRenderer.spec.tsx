import { FeatureFlagKey, useFlagWithLoading } from '@repo/feature-flags'
import { DashboardLayoutRenderer } from '@repo/reporting'
import type { LayoutItem } from '@repo/reporting'
import { assumeMock, render } from '@repo/testing'

import { DashboardComponent } from 'domains/reporting/pages/dashboards/DashboardComponent'
import { ChartType } from 'domains/reporting/pages/dashboards/types'
import { AnalyticsOverviewChart } from 'pages/aiAgent/analyticsOverview/AnalyticsOverviewReportConfig'
import { AiAgentDashboardLayoutRenderer } from 'pages/aiAgent/analyticsOverview/components/AiAgentDashboardLayoutRenderer'
import { useIsArticleRecommendationTableVisible } from 'pages/aiAgent/analyticsOverview/hooks/useIsArticleRecommendationTableVisible'
import {
    ManagedDashboardId,
    ManagedDashboardsTabId,
} from 'pages/aiAgent/analyticsOverview/types/layoutConfig'

jest.mock('@repo/feature-flags', () => ({
    ...jest.requireActual('@repo/feature-flags'),
    useFlagWithLoading: jest.fn(),
}))

jest.mock('@repo/reporting', () => ({
    ...jest.requireActual('@repo/reporting'),
    DashboardLayoutRenderer: jest.fn(() => (
        <div data-testid="dashboard-layout-renderer" />
    )),
}))

jest.mock(
    'pages/aiAgent/analyticsOverview/hooks/useIsArticleRecommendationTableVisible',
)

const mockedUseFlagWithLoading = assumeMock(useFlagWithLoading)
const mockedDashboardLayoutRenderer = assumeMock(DashboardLayoutRenderer)
const mockedUseIsArticleRecommendationTableVisible = assumeMock(
    useIsArticleRecommendationTableVisible,
)

const baseProps = {
    reportConfig: {
        charts: {
            [AnalyticsOverviewChart.AutomationRateCard]: {
                label: 'Automation rate',
            },
        },
    } as any,
    defaultLayoutConfig: {
        sections: [
            {
                id: 'kpis',
                type: ChartType.Card,
                items: [
                    {
                        chartId: AnalyticsOverviewChart.AutomationRateCard,
                        gridSize: 3 as const,
                        visibility: true,
                    },
                ],
            },
        ],
    },
    dashboardId: ManagedDashboardId.AiAgentOverview,
    tabId: ManagedDashboardsTabId.Overview,
    tabName: 'Overview',
}

const getLastProps = () =>
    mockedDashboardLayoutRenderer.mock.calls[
        mockedDashboardLayoutRenderer.mock.calls.length - 1
    ][0]

beforeEach(() => {
    mockedDashboardLayoutRenderer.mockClear()
    mockedUseFlagWithLoading.mockReturnValue({
        value: false,
        isLoading: false,
    })
    mockedUseIsArticleRecommendationTableVisible.mockReturnValue(true)
})

describe('AiAgentDashboardLayoutRenderer', () => {
    it('forwards the helpdesk DashboardComponent into the package renderer', () => {
        render(<AiAgentDashboardLayoutRenderer {...baseProps} />)

        expect(getLastProps().DashboardComponent).toBe(DashboardComponent)
    })

    it('passes through identity, layout and report config props', () => {
        const onTableTabChange = jest.fn()
        render(
            <AiAgentDashboardLayoutRenderer
                {...baseProps}
                onTableTabChange={onTableTabChange}
            />,
        )

        const props = getLastProps()
        expect(props.dashboardId).toBe(ManagedDashboardId.AiAgentOverview)
        expect(props.tabId).toBe(ManagedDashboardsTabId.Overview)
        expect(props.tabName).toBe('Overview')
        expect(props.defaultLayoutConfig).toBe(baseProps.defaultLayoutConfig)
        expect(props.reportConfig).toBe(baseProps.reportConfig)
        expect(props.onTableTabChange).toBe(onTableTabChange)
    })

    describe('feature flag wiring', () => {
        it('passes enableTrendCards from AiAgentAnalyticsDashboardsTrendCards flag', () => {
            mockedUseFlagWithLoading.mockImplementation((flag) => ({
                value:
                    flag ===
                    FeatureFlagKey.AiAgentAnalyticsDashboardsTrendCards,
                isLoading: false,
            }))

            render(<AiAgentDashboardLayoutRenderer {...baseProps} />)

            const props = getLastProps()
            expect(props.enableTrendCards).toBe(true)
            expect(props.enableCustomDashboards).toBe(false)
            expect(props.enableTablesPersistence).toBe(true)
        })

        it('passes enableCustomDashboards from AiAgentAnalyticsCustomDashboards flag', () => {
            mockedUseFlagWithLoading.mockImplementation((flag) => ({
                value: flag === FeatureFlagKey.AiAgentAnalyticsCustomDashboards,
                isLoading: false,
            }))

            render(<AiAgentDashboardLayoutRenderer {...baseProps} />)

            const props = getLastProps()
            expect(props.enableTrendCards).toBe(false)
            expect(props.enableCustomDashboards).toBe(true)
            expect(props.enableTablesPersistence).toBe(true)
        })

        it('always passes enableTablesPersistence as true', () => {
            mockedUseFlagWithLoading.mockReturnValue({
                value: false,
                isLoading: false,
            })

            render(<AiAgentDashboardLayoutRenderer {...baseProps} />)

            const props = getLastProps()
            expect(props.enableTablesPersistence).toBe(true)
        })
    })

    describe('isItemVisible predicate', () => {
        const articleRecommendationItem: LayoutItem<AnalyticsOverviewChart> = {
            chartId: AnalyticsOverviewChart.ArticleRecommendationTable,
            gridSize: 12,
            visibility: true,
        }
        const automationRateItem: LayoutItem<AnalyticsOverviewChart> = {
            chartId: AnalyticsOverviewChart.AutomationRateCard,
            gridSize: 3,
            visibility: true,
        }

        const getIsItemVisible = () => {
            const { isItemVisible } = getLastProps()
            if (!isItemVisible) {
                throw new Error(
                    'Expected AiAgentDashboardLayoutRenderer to pass an isItemVisible predicate to DashboardLayoutRenderer',
                )
            }
            return isItemVisible
        }

        it('hides ArticleRecommendationTable when useIsArticleRecommendationTableVisible is false', () => {
            mockedUseIsArticleRecommendationTableVisible.mockReturnValue(false)
            render(<AiAgentDashboardLayoutRenderer {...baseProps} />)

            expect(getIsItemVisible()(articleRecommendationItem)).toBe(false)
        })

        it('shows ArticleRecommendationTable when useIsArticleRecommendationTableVisible is true', () => {
            mockedUseIsArticleRecommendationTableVisible.mockReturnValue(true)
            render(<AiAgentDashboardLayoutRenderer {...baseProps} />)

            expect(getIsItemVisible()(articleRecommendationItem)).toBe(true)
        })

        it('keeps non-ArticleRecommendationTable items visible regardless of the gate', () => {
            mockedUseIsArticleRecommendationTableVisible.mockReturnValue(false)
            render(<AiAgentDashboardLayoutRenderer {...baseProps} />)

            expect(getIsItemVisible()(automationRateItem)).toBe(true)
        })

        it('keeps the ArticleRecommendation gate from hiding other chart types', () => {
            mockedUseIsArticleRecommendationTableVisible.mockReturnValue(false)
            render(<AiAgentDashboardLayoutRenderer {...baseProps} />)

            const isItemVisible = getIsItemVisible()

            expect(
                isItemVisible({
                    chartId: AnalyticsOverviewChart.AutomationRateCard,
                    gridSize: 3,
                    visibility: true,
                }),
            ).toBe(true)
            expect(
                isItemVisible({
                    chartId: AnalyticsOverviewChart.ArticleRecommendationTable,
                    gridSize: 12,
                    visibility: true,
                }),
            ).toBe(false)
        })

        it('keeps the same predicate reference when isArticleRecommendationTableVisible does not change between renders', () => {
            mockedUseIsArticleRecommendationTableVisible.mockReturnValue(true)
            const { rerender } = render(
                <AiAgentDashboardLayoutRenderer {...baseProps} />,
            )
            const firstPredicate = getIsItemVisible()

            rerender(<AiAgentDashboardLayoutRenderer {...baseProps} />)
            const secondPredicate = getIsItemVisible()

            expect(secondPredicate).toBe(firstPredicate)
        })

        it('returns a new predicate reference when isArticleRecommendationTableVisible flips', () => {
            mockedUseIsArticleRecommendationTableVisible.mockReturnValue(true)
            const { rerender } = render(
                <AiAgentDashboardLayoutRenderer {...baseProps} />,
            )
            const firstPredicate = getIsItemVisible()

            mockedUseIsArticleRecommendationTableVisible.mockReturnValue(false)
            rerender(<AiAgentDashboardLayoutRenderer {...baseProps} />)
            const secondPredicate = getIsItemVisible()

            expect(secondPredicate).not.toBe(firstPredicate)
            expect(secondPredicate(articleRecommendationItem)).toBe(false)
        })
    })
})
