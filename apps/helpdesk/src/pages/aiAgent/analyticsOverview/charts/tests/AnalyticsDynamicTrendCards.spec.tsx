import { TrendCard } from '@repo/reporting'
import type { MetricTrendFormat } from '@repo/reporting'
import { assumeMock } from '@repo/testing'
import { render } from '@testing-library/react'

import { useDrillDownModalTrigger } from 'domains/reporting/hooks/drill-down/useDrillDownModalTrigger'
import { useReportingTrendCardProps } from 'domains/reporting/hooks/useReportingTrendCardProps'
import { AiAgentDrillDownMetricName } from 'domains/reporting/pages/automate/aiAgent/aiAgentDrillDownMetrics'
import type {
    ChartConfig,
    DashboardChartProps,
} from 'domains/reporting/pages/dashboards/types'
import { ChartType } from 'domains/reporting/pages/dashboards/types'
import { AnalyticsAiAgentAllAgentsFRTCard } from 'pages/aiAgent/analyticsAiAgent/charts/AnalyticsAiAgentAllAgentsFRTCard'
import { AnalyticsAiAgentAllAgentsHandoverInteractionsCard } from 'pages/aiAgent/analyticsAiAgent/charts/AnalyticsAiAgentAllAgentsHandoverInteractionsCard'
import { AnalyticsAiAgentAutomationRateCard } from 'pages/aiAgent/analyticsAiAgent/charts/AnalyticsAiAgentAutomationRateCard'
import { AnalyticsAiAgentAverageDiscountAmountCard } from 'pages/aiAgent/analyticsAiAgent/charts/AnalyticsAiAgentAverageDiscountAmountCard'
import { AnalyticsAiAgentAverageOrderValueCard } from 'pages/aiAgent/analyticsAiAgent/charts/AnalyticsAiAgentAverageOrderValueCard'
import { AnalyticsAiAgentBuyThroughRateCard } from 'pages/aiAgent/analyticsAiAgent/charts/AnalyticsAiAgentBuyThroughRateCard'
import { AnalyticsAiAgentClickThroughRateCard } from 'pages/aiAgent/analyticsAiAgent/charts/AnalyticsAiAgentClickThroughRateCard'
import { AnalyticsAiAgentClosedTicketsCard } from 'pages/aiAgent/analyticsAiAgent/charts/AnalyticsAiAgentClosedTicketsCard'
import { AnalyticsAiAgentConversionRateCard } from 'pages/aiAgent/analyticsAiAgent/charts/AnalyticsAiAgentConversionRateCard'
import { AnalyticsAiAgentCostSavedCard } from 'pages/aiAgent/analyticsAiAgent/charts/AnalyticsAiAgentCostSavedCard'
import { AnalyticsAiAgentCoverageRateCard } from 'pages/aiAgent/analyticsAiAgent/charts/AnalyticsAiAgentCoverageRateCard'
import { AnalyticsAiAgentDecreaseInResolutionTimeCard } from 'pages/aiAgent/analyticsAiAgent/charts/AnalyticsAiAgentDecreaseInResolutionTimeCard'
import { AnalyticsAiAgentDiscountCodesAppliedCard } from 'pages/aiAgent/analyticsAiAgent/charts/AnalyticsAiAgentDiscountCodesAppliedCard'
import { AnalyticsAiAgentDiscountsOfferedCard } from 'pages/aiAgent/analyticsAiAgent/charts/AnalyticsAiAgentDiscountsOfferedCard'
import { AnalyticsAiAgentDiscountUsageCard } from 'pages/aiAgent/analyticsAiAgent/charts/AnalyticsAiAgentDiscountUsageCard'
import { AnalyticsAiAgentMedianPurchaseTimeCard } from 'pages/aiAgent/analyticsAiAgent/charts/AnalyticsAiAgentMedianPurchaseTimeCard'
import { AnalyticsAiAgentProductRecommendationsCard } from 'pages/aiAgent/analyticsAiAgent/charts/AnalyticsAiAgentProductRecommendationsCard'
import { AnalyticsAiAgentSalesHandoverInteractionsCard } from 'pages/aiAgent/analyticsAiAgent/charts/AnalyticsAiAgentSalesHandoverInteractionsCard'
import { AnalyticsAiAgentSuccessRateSalesCard } from 'pages/aiAgent/analyticsAiAgent/charts/AnalyticsAiAgentSuccessRateSalesCard'
import { AnalyticsAiAgentSupportAgentCsatCard } from 'pages/aiAgent/analyticsAiAgent/charts/AnalyticsAiAgentSupportAgentCsatCard'
import { AnalyticsAiAgentSupportDecreaseInResolutionTimeCard } from 'pages/aiAgent/analyticsAiAgent/charts/AnalyticsAiAgentSupportDecreaseInResolutionTimeCard'
import { AnalyticsAiAgentSupportHandoverInteractionsCard } from 'pages/aiAgent/analyticsAiAgent/charts/AnalyticsAiAgentSupportHandoverInteractionsCard'
import { AnalyticsAiAgentZeroTouchTicketsCard } from 'pages/aiAgent/analyticsAiAgent/charts/AnalyticsAiAgentZeroTouchTicketsCard'
import { AnalyticsOverviewAutomationRateCard } from 'pages/aiAgent/analyticsOverview/charts//AnalyticsOverviewAutomationRateCard'
import { AnalyticsAiAgentHandoverInteractionsCard } from 'pages/aiAgent/analyticsOverview/charts/AnalyticsAiAgentHandoverInteractionsCard'
import { AnalyticsOverviewAutomatedInteractionsCard } from 'pages/aiAgent/analyticsOverview/charts/AnalyticsOverviewAutomatedInteractionsCard'
import { AnalyticsOverviewAverageCsatCard } from 'pages/aiAgent/analyticsOverview/charts/AnalyticsOverviewAverageCsatCard'
import { AnalyticsOverviewDecreaseInFRTCard } from 'pages/aiAgent/analyticsOverview/charts/AnalyticsOverviewDecreaseInFRTCard'
import { AnalyticsOverviewDecreaseInResolutionTimeCard } from 'pages/aiAgent/analyticsOverview/charts/AnalyticsOverviewDecreaseInResolutionTimeCard'
import { AnalyticsOverviewTimeSavedCard } from 'pages/aiAgent/analyticsOverview/charts/AnalyticsOverviewTimeSavedCard'

jest.mock('@repo/feature-flags', () => ({
    FeatureFlagKey: {
        AiAgentAnalyticsDashboardsDrillDown:
            'ai-agent-analytics-dashboards-drilldown',
    },
    useFlag: jest.fn().mockReturnValue(true),
}))

jest.mock('domains/reporting/hooks/drill-down/useDrillDownModalTrigger')
const mockUseDrillDownModalTrigger = assumeMock(useDrillDownModalTrigger)

jest.mock('domains/reporting/hooks/useReportingTrendCardProps')
const mockUseReportingTrendCardProps = assumeMock(useReportingTrendCardProps)

jest.mock('@repo/reporting', () => ({
    TrendCard: jest.fn(() => null),
}))
const mockTrendCard = assumeMock(TrendCard)

const mockDashboard = {
    id: 1,
    name: 'Test Dashboard',
    analytics_filter_id: 1,
    children: [],
    emoji: '🚀',
}

const createTrendCardProps = ({
    label,
    value,
    prevValue,
    description,
    metricFormat,
}: {
    label: string
    value: number
    prevValue: number
    description: string
    metricFormat: MetricTrendFormat
}) => ({
    trend: {
        isFetching: false,
        isError: false,
        data: {
            label,
            value,
            prevValue,
        },
    },
    isLoading: false,
    metricFormat,
    interpretAs: 'more-is-better' as const,
    trendBadgeTooltipData: { period: 'Test Period' },
    withBorder: true,
    withFixedWidth: false,
    hint: {
        title: label,
        caption: description,
    },
    actionMenu: undefined,
})

const createChartConfig = ({
    Component,
    label,
    description,
    metricFormat,
}: {
    Component: (props: DashboardChartProps) => React.JSX.Element
    label: string
    description: string
    metricFormat: MetricTrendFormat
}): ChartConfig => ({
    chartComponent: Component,
    label,
    csvProducer: null,
    description,
    chartType: ChartType.Card,
    metricFormat,
    interpretAs: 'more-is-better',
})

describe('Analytics Dynamic Trend Cards', () => {
    const testCases = [
        {
            name: 'AnalyticsOverviewAutomatedInteractionsCard',
            Component: AnalyticsOverviewAutomatedInteractionsCard,
            config: {
                label: 'Automated interactions',
                description:
                    'The number of fully automated interactions solved without any human agent intervention.',
                metricFormat: 'decimal' as const,
                value: 4800,
                prevValue: 4600,
            },
        },
        {
            name: 'AnalyticsOverviewTimeSavedCard',
            Component: AnalyticsOverviewTimeSavedCard,
            config: {
                label: 'Time saved per agent',
                description:
                    'The time agent would have spent resolving customer inquiries without all automation features.',
                metricFormat: 'duration' as const,
                value: 19800,
                prevValue: 19400,
            },
        },
        {
            name: 'AnalyticsAiAgentAverageOrderValueCard',
            Component: AnalyticsAiAgentAverageOrderValueCard,
            config: {
                label: 'Average order value',
                description:
                    'The average value of orders placed within 3 days of a conversation with Shopping Assistant.',
                metricFormat: 'currency' as const,
                value: 85.5,
                prevValue: 79.2,
            },
        },
        {
            name: 'AnalyticsAiAgentAverageDiscountAmountCard',
            Component: AnalyticsAiAgentAverageDiscountAmountCard,
            config: {
                label: 'Average discount amount',
                description:
                    'The average discount value given by AI Sales Agent per interaction.',
                metricFormat: 'currency' as const,
                value: 15.5,
                prevValue: 14.2,
            },
        },
        {
            name: 'AnalyticsAiAgentDiscountUsageCard',
            Component: AnalyticsAiAgentDiscountUsageCard,
            config: {
                label: 'Discount usage',
                description:
                    'The percentage of discounts generated and sent by Shopping Assistant that customers apply.',
                metricFormat: 'decimal-to-percent' as const,
                value: 0.75,
                prevValue: 0.6,
            },
        },
        {
            name: 'AnalyticsAiAgentDiscountCodesAppliedCard',
            Component: AnalyticsAiAgentDiscountCodesAppliedCard,
            config: {
                label: 'Discount codes applied',
                description:
                    'The number of purchases placed using discount codes generated and sent by Shopping Assistant.',
                metricFormat: 'decimal' as const,
                value: 120,
                prevValue: 95,
            },
        },
        {
            name: 'AnalyticsAiAgentDiscountsOfferedCard',
            Component: AnalyticsAiAgentDiscountsOfferedCard,
            config: {
                label: 'Discount offered',
                description:
                    'The number of discount codes generated and sent by Shopping Assistant.',
                metricFormat: 'decimal' as const,
                value: 85,
                prevValue: 72,
            },
        },
        {
            name: 'AnalyticsAiAgentMedianPurchaseTimeCard',
            Component: AnalyticsAiAgentMedianPurchaseTimeCard,
            config: {
                label: 'Median purchase time',
                description:
                    'Median duration between automated interaction with Shopping assistant and order placed.',
                metricFormat: 'decimal' as const,
                value: 42,
                prevValue: 38,
            },
        },
        {
            name: 'AnalyticsAiAgentBuyThroughRateCard',
            Component: AnalyticsAiAgentBuyThroughRateCard,
            config: {
                label: 'Buy through rate',
                description:
                    'The percentage of tickets with product recommendations that led to a purchase.',
                metricFormat: 'percent' as const,
                value: 0.42,
                prevValue: 0.38,
            },
        },
        {
            name: 'AnalyticsAiAgentConversionRateCard',
            Component: AnalyticsAiAgentConversionRateCard,
            config: {
                label: 'Conversion rate',
                description:
                    'The percentage of Shopping Assistant interactions after which an order was placed within 3 days.',
                metricFormat: 'decimal-to-percent' as const,
                value: 0.25,
                prevValue: 0.2,
            },
        },
        {
            name: 'AnalyticsAiAgentClickThroughRateCard',
            Component: AnalyticsAiAgentClickThroughRateCard,
            config: {
                label: 'Click through rate',
                description:
                    'The percentage of product recommendations clicked by customers.',
                metricFormat: 'percent' as const,
                value: 42.5,
                prevValue: 38.0,
            },
        },
        {
            name: 'AnalyticsAiAgentProductRecommendationsCard',
            Component: AnalyticsAiAgentProductRecommendationsCard,
            config: {
                label: 'Product recommendations',
                description:
                    'The total number of product recommendations sent to customers by Shopping Assistant.',
                metricFormat: 'decimal' as const,
                value: 150,
                prevValue: 120,
            },
        },
        {
            name: 'AnalyticsOverviewAverageCsatCard',
            Component: AnalyticsOverviewAverageCsatCard,
            config: {
                label: 'Average CSAT',
                description:
                    'Average CSAT score and rating distribution for surveys sent within the timeframe; surveys are sent following ticket resolution.',
                metricFormat: 'decimal' as const,
                value: 4.2,
                prevValue: 4.0,
            },
        },
        {
            name: 'AnalyticsAiAgentSupportAgentCsatCard',
            Component: AnalyticsAiAgentSupportAgentCsatCard,
            config: {
                label: 'Average CSAT',
                description:
                    'Average CSAT score and rating distribution for surveys sent within the timeframe; surveys are sent following ticket resolution.',
                metricFormat: 'decimal' as const,
                value: 4.5,
                prevValue: 4.3,
            },
        },
        {
            name: 'AnalyticsAiAgentSuccessRateSalesCard',
            Component: AnalyticsAiAgentSuccessRateSalesCard,
            hasDrillDown: true,
            drillDownParams: {
                metricName:
                    AiAgentDrillDownMetricName.ShoppingAssistantSuccessRateCard,
                title: 'Success rate',
            },
            config: {
                label: 'Success rate',
                description:
                    'The percentage of interactions handled by the AI Agent that are fully resolved without any human escalation.',
                chartType: ChartType.Card,
                metricFormat: 'decimal-to-percent' as const,
                interpretAs: 'more-is-better',
                value: 55.5,
                prevValue: 12.0,
            },
        },
        {
            name: 'AnalyticsAiAgentCoverageRateCard',
            Component: AnalyticsAiAgentCoverageRateCard,
            config: {
                label: 'Coverage rate',
                description:
                    'Percentage of tickets that AI Agent attempted to respond to.',
                chartType: ChartType.Card,
                metricFormat: 'decimal-to-percent' as const,
                interpretAs: 'more-is-better',
                value: 55.5,
                prevValue: 12.0,
            },
        },
        {
            name: 'AnalyticsAiAgentCostSavedCard',
            Component: AnalyticsAiAgentCostSavedCard,
            config: {
                label: 'Cost saved',
                description:
                    'The estimated amount saved by automating interactions that would have otherwise been handled by agents, based on Helpdesk ticket cost plus the benchmark agent cost of $3.10 per ticket.',
                metricFormat: 'currency-precision-1' as const,
                value: 1234.5,
                prevValue: 1000,
            },
        },
        {
            name: 'AnalyticsAiAgentZeroTouchTicketsCard',
            Component: AnalyticsAiAgentZeroTouchTicketsCard,
            config: {
                label: 'Zero touch tickets',
                description:
                    'Number of tickets closed without any agent reply.',
                metricFormat: 'decimal' as const,
                value: 120,
                prevValue: 100,
            },
        },
        {
            name: 'AnalyticsAiAgentClosedTicketsCard',
            Component: AnalyticsAiAgentClosedTicketsCard,
            config: {
                label: 'Closed tickets',
                description:
                    'Number of unique closed tickets within the selected timeframe (that did not reopen).',
                metricFormat: 'decimal' as const,
                value: 350,
                prevValue: 300,
            },
        },
        {
            name: 'AnalyticsAiAgentHandoverInteractionsCard',
            Component: AnalyticsAiAgentHandoverInteractionsCard,
            config: {
                label: 'Handover interactions',
                description:
                    'The number of interactions handed over from AI Agent to a human support agent.',
                metricFormat: 'decimal' as const,
                value: 120,
                prevValue: 150,
            },
        },
        {
            name: 'AnalyticsAiAgentAllAgentsFRTCard',
            Component: AnalyticsAiAgentAllAgentsFRTCard,
            config: {
                label: 'Decrease in first response time',
                description:
                    'The reduction in the average time shoppers wait for the first reply to their message when AI Agent is used, compared with tickets resolved manually by support agents.',
                metricFormat: 'duration' as const,
                value: 3600,
                prevValue: 4200,
            },
        },
        {
            name: 'AnalyticsOverviewDecreaseInFRTCard',
            Component: AnalyticsOverviewDecreaseInFRTCard,
            config: {
                label: 'Decrease in first response time',
                description:
                    'The reduction in the average time shoppers wait for the first reply to their message when AI Agent is used, compared with tickets resolved manually by support agents.',
                metricFormat: 'duration' as const,
                value: 3600,
                prevValue: 4200,
            },
        },
        {
            name: 'AnalyticsAiAgentSupportHandoverInteractionsCard',
            Component: AnalyticsAiAgentSupportHandoverInteractionsCard,
            config: {
                label: 'Handover interactions',
                description:
                    'The number of interactions handed over from AI Agent to a human support agent.',
                metricFormat: 'decimal' as const,
                value: 120,
                prevValue: 150,
            },
        },
        {
            name: 'AnalyticsAiAgentAllAgentsHandoverInteractionsCard',
            Component: AnalyticsAiAgentAllAgentsHandoverInteractionsCard,
            config: {
                label: 'Handover interactions',
                description:
                    "The number of interactions AI Agent transferred to a human because it couldn't confidently resolve the customer's request or because the customer explicitly requested to speak with a human agent.",
                metricFormat: 'decimal' as const,
                value: 120,
                prevValue: 150,
            },
        },
        {
            name: 'AnalyticsAiAgentSalesHandoverInteractionsCard',
            Component: AnalyticsAiAgentSalesHandoverInteractionsCard,
            config: {
                label: 'Handover interactions',
                description:
                    "The number of interactions AI Agent transferred to a human because it couldn't confidently resolve the customer's request or because the customer explicitly requested to speak with a human agent.",
                metricFormat: 'decimal' as const,
                value: 120,
                prevValue: 150,
            },
        },
        {
            name: 'AnalyticsOverviewDecreaseInResolutionTimeCard',
            Component: AnalyticsOverviewDecreaseInResolutionTimeCard,
            config: {
                label: 'Decrease in resolution time',
                description:
                    'The reduction in the average time to resolve a ticket when AI Agent is used, compared with tickets resolved manually by support agents.',
                metricFormat: 'duration' as const,
                value: 88770,
                prevValue: 88200,
            },
        },
        {
            name: 'AnalyticsAiAgentDecreaseInResolutionTimeCard',
            Component: AnalyticsAiAgentDecreaseInResolutionTimeCard,
            config: {
                label: 'Decrease in resolution time',
                description:
                    'The reduction in the average time to resolve a ticket when AI Agent is used, compared with tickets resolved manually by support agents.',
                metricFormat: 'duration' as const,
                value: 88770,
                prevValue: 88200,
            },
        },
        {
            name: 'AnalyticsAiAgentSupportDecreaseInResolutionTimeCard',
            Component: AnalyticsAiAgentSupportDecreaseInResolutionTimeCard,
            config: {
                label: 'Decrease in resolution time',
                description:
                    'The reduction in the average time to resolve a ticket when AI Agent is used, compared with tickets resolved manually by support agents.',
                metricFormat: 'duration' as const,
                value: 88770,
                prevValue: 88200,
            },
        },
        {
            name: 'AnalyticsOverviewAutomationRateCard',
            Component: AnalyticsOverviewAutomationRateCard,
            config: {
                label: 'Automation rate',
                description:
                    'The number of interactions automated by all automation features as a % of total customer interactions.',
                metricFormat: 'decimal-to-percent' as const,
                interpretAs: 'more-is-better',
                value: 12.5,
                prevValue: 10,
            },
        },
        {
            name: 'AnalyticsAiAgentAutomationRateCard',
            Component: AnalyticsAiAgentAutomationRateCard,
            config: {
                label: 'Automation rate',
                description:
                    'The percentage of customer interactions fully handled by the AI Agent.',
                metricFormat: 'decimal-to-percent' as const,
                interpretAs: 'more-is-better',
                value: 12.5,
                prevValue: 10,
            },
        },
    ]

    const mockDrillDownReturn = {
        openDrillDownModal: jest.fn(),
        tooltipText: 'Success rate',
    }

    beforeEach(() => {
        jest.clearAllMocks()
        mockUseDrillDownModalTrigger.mockReturnValue(mockDrillDownReturn)
    })

    describe.each(testCases)(
        '$name',
        ({ Component, config, hasDrillDown, drillDownParams }) => {
            const chartConfig = createChartConfig({
                Component,
                label: config.label,
                description: config.description,
                metricFormat: config.metricFormat,
            })

            const trendCardProps = createTrendCardProps({
                label: config.label,
                value: config.value,
                prevValue: config.prevValue,
                description: config.description,
                metricFormat: config.metricFormat,
            })

            beforeEach(() => {
                mockUseReportingTrendCardProps.mockReturnValue(trendCardProps)
            })

            it('should call useReportingTrendCardProps with correct arguments', () => {
                render(
                    <Component
                        chartConfig={chartConfig}
                        chartId="test-chart-id"
                        dashboard={mockDashboard}
                    />,
                )

                expect(mockUseReportingTrendCardProps).toHaveBeenCalledWith({
                    chartConfig,
                    chartId: 'test-chart-id',
                    dashboard: mockDashboard,
                    useTrend: expect.any(Function),
                    isAiAgentTrendCard: true,
                })
            })

            it('should pass useReportingTrendCardProps result to TrendCard', () => {
                render(<Component chartConfig={chartConfig} />)

                const expectedProps = hasDrillDown
                    ? { ...trendCardProps, drillDown: mockDrillDownReturn }
                    : trendCardProps
                expect(mockTrendCard).toHaveBeenCalledWith(expectedProps, {})

                if (drillDownParams) {
                    expect(mockUseDrillDownModalTrigger).toHaveBeenCalledWith(
                        drillDownParams,
                    )
                }
            })
        },
    )

    describe('AnalyticsAiAgentSuccessRateSalesCard drillDown guard', () => {
        it('should not enable drillDown when trend data is undefined', () => {
            mockUseReportingTrendCardProps.mockReturnValue({
                isLoading: false,
                metricFormat: 'decimal-to-percent' as const,
                interpretAs: 'more-is-better' as const,
                trendBadgeTooltipData: { period: 'Test Period' },
                withBorder: true,
                withFixedWidth: false,
                hint: { title: 'Success rate', caption: '' },
                actionMenu: undefined,
                trend: undefined,
            } as any)

            render(
                <AnalyticsAiAgentSuccessRateSalesCard
                    chartConfig={createChartConfig({
                        Component: AnalyticsAiAgentSuccessRateSalesCard,
                        label: 'Success rate',
                        description:
                            'The percentage of interactions handled by the AI Agent that are fully resolved without any human escalation.',
                        metricFormat: 'decimal-to-percent',
                    })}
                />,
            )

            expect(mockTrendCard).toHaveBeenCalledWith(
                expect.objectContaining({ drillDown: undefined }),
                {},
            )
        })
    })
})
