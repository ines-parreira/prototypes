import { TrendCard } from '@repo/reporting'
import type { MetricTrendFormat } from '@repo/reporting'
import { assumeMock, render } from '@repo/testing'

import { useReportingTrendCardProps } from 'domains/reporting/hooks/useReportingTrendCardProps'
import { AiAgentDrillDownMetricName } from 'domains/reporting/pages/automate/aiAgent/aiAgentDrillDownMetrics'
import type {
    ChartConfig,
    DashboardChartProps,
} from 'domains/reporting/pages/dashboards/types'
import { ChartType } from 'domains/reporting/pages/dashboards/types'
import { AnalyticsAiAgentAllAgentsAutomatedInteractionsCard } from 'pages/aiAgent/analyticsAiAgent/charts/AnalyticsAiAgentAllAgentsAutomatedInteractionsCard'
import { AnalyticsAiAgentAllAgentsAverageCsatCard } from 'pages/aiAgent/analyticsAiAgent/charts/AnalyticsAiAgentAllAgentsAverageCsatCard'
import { AnalyticsAiAgentAllAgentsDecreaseInFRTCard } from 'pages/aiAgent/analyticsAiAgent/charts/AnalyticsAiAgentAllAgentsDecreaseInFRTCard'
import { AnalyticsAiAgentAllAgentsHandoverInteractionsCard } from 'pages/aiAgent/analyticsAiAgent/charts/AnalyticsAiAgentAllAgentsHandoverInteractionsCard'
import { AnalyticsAiAgentAllAgentsSuccessRateCard } from 'pages/aiAgent/analyticsAiAgent/charts/AnalyticsAiAgentAllAgentsSuccessRateCard'
import { AnalyticsAiAgentAllAgentsTimeSavedCard } from 'pages/aiAgent/analyticsAiAgent/charts/AnalyticsAiAgentAllAgentsTimeSavedCard'
import { AnalyticsAiAgentAutomationRateCard } from 'pages/aiAgent/analyticsAiAgent/charts/AnalyticsAiAgentAutomationRateCard'
import { AnalyticsAiAgentAverageDiscountAmountCard } from 'pages/aiAgent/analyticsAiAgent/charts/AnalyticsAiAgentAverageDiscountAmountCard'
import { AnalyticsAiAgentAverageOrderValueCard } from 'pages/aiAgent/analyticsAiAgent/charts/AnalyticsAiAgentAverageOrderValueCard'
import { AnalyticsAiAgentBuyThroughRateCard } from 'pages/aiAgent/analyticsAiAgent/charts/AnalyticsAiAgentBuyThroughRateCard'
import { AnalyticsAiAgentClickThroughRateCard } from 'pages/aiAgent/analyticsAiAgent/charts/AnalyticsAiAgentClickThroughRateCard'
import { AnalyticsAiAgentClosedTicketsCard } from 'pages/aiAgent/analyticsAiAgent/charts/AnalyticsAiAgentClosedTicketsCard'
import { AnalyticsAiAgentConversionRateCard } from 'pages/aiAgent/analyticsAiAgent/charts/AnalyticsAiAgentConversionRateCard'
import { AnalyticsAiAgentCostSavedCard } from 'pages/aiAgent/analyticsAiAgent/charts/AnalyticsAiAgentCostSavedCard'
import { AnalyticsAiAgentCoverageRateCard } from 'pages/aiAgent/analyticsAiAgent/charts/AnalyticsAiAgentCoverageRateCard'
import { AnalyticsAiAgentDecreaseinFRTCard } from 'pages/aiAgent/analyticsAiAgent/charts/AnalyticsAiAgentDecreaseinFRTCard'
import { AnalyticsAiAgentDecreaseInResolutionTimeCard } from 'pages/aiAgent/analyticsAiAgent/charts/AnalyticsAiAgentDecreaseInResolutionTimeCard'
import { AnalyticsAiAgentDiscountCodesAppliedCard } from 'pages/aiAgent/analyticsAiAgent/charts/AnalyticsAiAgentDiscountCodesAppliedCard'
import { AnalyticsAiAgentDiscountsOfferedCard } from 'pages/aiAgent/analyticsAiAgent/charts/AnalyticsAiAgentDiscountsOfferedCard'
import { AnalyticsAiAgentDiscountUsageCard } from 'pages/aiAgent/analyticsAiAgent/charts/AnalyticsAiAgentDiscountUsageCard'
import { AnalyticsAiAgentMedianPurchaseTimeCard } from 'pages/aiAgent/analyticsAiAgent/charts/AnalyticsAiAgentMedianPurchaseTimeCard'
import { AnalyticsAiAgentOrdersInfluencedCard } from 'pages/aiAgent/analyticsAiAgent/charts/AnalyticsAiAgentOrdersInfluencedCard'
import { AnalyticsAiAgentProductRecommendationsCard } from 'pages/aiAgent/analyticsAiAgent/charts/AnalyticsAiAgentProductRecommendationsCard'
import { AnalyticsAiAgentRevenuePerInteractionCard } from 'pages/aiAgent/analyticsAiAgent/charts/AnalyticsAiAgentRevenuePerInteractionCard'
import { AnalyticsAiAgentSalesHandoverInteractionsCard } from 'pages/aiAgent/analyticsAiAgent/charts/AnalyticsAiAgentSalesHandoverInteractionsCard'
import { AnalyticsAiAgentShoppingAssistantAutomatedInteractionsCard } from 'pages/aiAgent/analyticsAiAgent/charts/AnalyticsAiAgentShoppingAssistantAutomatedInteractionsCard'
import { AnalyticsAiAgentShoppingAssistantSuccessRateCard } from 'pages/aiAgent/analyticsAiAgent/charts/AnalyticsAiAgentShoppingAssistantSuccessRateCard'
import { AnalyticsAiAgentSupportAgentAutomatedInteractionsCard } from 'pages/aiAgent/analyticsAiAgent/charts/AnalyticsAiAgentSupportAgentAutomatedInteractionsCard'
import { AnalyticsAiAgentSupportAgentCsatCard } from 'pages/aiAgent/analyticsAiAgent/charts/AnalyticsAiAgentSupportAgentCsatCard'
import { AnalyticsAiAgentSupportAgentSuccessRateCard } from 'pages/aiAgent/analyticsAiAgent/charts/AnalyticsAiAgentSupportAgentSuccessRateCard'
import { AnalyticsAiAgentSupportAgentTimeSavedCard } from 'pages/aiAgent/analyticsAiAgent/charts/AnalyticsAiAgentSupportAgentTimeSavedCard'
import { AnalyticsAiAgentSupportCostSavedCard } from 'pages/aiAgent/analyticsAiAgent/charts/AnalyticsAiAgentSupportCostSavedCard'
import { AnalyticsAiAgentSupportHandoverInteractionsCard } from 'pages/aiAgent/analyticsAiAgent/charts/AnalyticsAiAgentSupportHandoverInteractionsCard'
import { AnalyticsAiAgentTotalSalesCard } from 'pages/aiAgent/analyticsAiAgent/charts/AnalyticsAiAgentTotalSalesCard'
import { AnalyticsAiAgentZeroTouchTicketsCard } from 'pages/aiAgent/analyticsAiAgent/charts/AnalyticsAiAgentZeroTouchTicketsCard'
import { AnalyticsSupportAgentDecreaseInResolutionTimeCard } from 'pages/aiAgent/analyticsAiAgent/charts/AnalyticsSupportAgentDecreaseInResolutionTimeCard'
import { AnalyticsAiAgentHandoverInteractionsCard } from 'pages/aiAgent/analyticsOverview/charts/AnalyticsAiAgentHandoverInteractionsCard'
import { AnalyticsOverviewAutomatedInteractionsCard } from 'pages/aiAgent/analyticsOverview/charts/AnalyticsOverviewAutomatedInteractionsCard'
import { AnalyticsOverviewCostSavedCard } from 'pages/aiAgent/analyticsOverview/charts/AnalyticsOverviewCostSavedCard'
import { AnalyticsOverviewDecreaseInFRTCard } from 'pages/aiAgent/analyticsOverview/charts/AnalyticsOverviewDecreaseInFRTCard'
import { AnalyticsOverviewDecreaseInResolutionTimeCard } from 'pages/aiAgent/analyticsOverview/charts/AnalyticsOverviewDecreaseInResolutionTimeCard'
import { AnalyticsOverviewOverallAutomationRateCard } from 'pages/aiAgent/analyticsOverview/charts/AnalyticsOverviewOverallAutomationRateCard'
import { AnalyticsOverviewTimeSavedCard } from 'pages/aiAgent/analyticsOverview/charts/AnalyticsOverviewTimeSavedCard'

jest.mock('domains/reporting/hooks/useReportingTrendCardProps')
const mockUseReportingTrendCardProps = assumeMock(useReportingTrendCardProps)

jest.mock(
    'pages/automate/common/hooks/useMoneySavedPerInteractionWithAutomate',
    () => ({
        useMoneySavedPerInteractionWithAutomate: jest.fn().mockReturnValue(3.1),
    }),
)

jest.mock('@repo/reporting', () => ({
    ...jest.requireActual('@repo/reporting'),
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
    drillDown: undefined,
    timeSeriesView: undefined,
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
            timeSeriesView: { queryFactory: expect.any(Function) },
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
            timeSeriesView: { queryFactory: expect.any(Function) },
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
            name: 'AnalyticsAiAgentTotalSalesCard',
            Component: AnalyticsAiAgentTotalSalesCard,
            config: {
                label: 'Total sales',
                description:
                    'The revenue influenced by a Shopping Assistant interaction, measured from orders placed within 3 days of the interaction',
                metricFormat: 'currency-precision-1' as const,
                value: 7800,
                prevValue: 7500,
            },
            timeSeriesView: { queryFactory: expect.any(Function) },
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
            name: 'AnalyticsAiAgentOrdersInfluencedCard',
            Component: AnalyticsAiAgentOrdersInfluencedCard,
            config: {
                label: 'Orders influenced',
                description:
                    'The number of orders placed within 3 days of a Shopping Assistant conversation without a direct handover.',
                metricFormat: 'decimal' as const,
                value: 1029,
                prevValue: 1000,
            },
            timeSeriesView: { queryFactory: expect.any(Function) },
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
            timeSeriesView: { queryFactory: expect.any(Function) },
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
            name: 'AnalyticsAiAgentAllAgentsAverageCsatCard',
            Component: AnalyticsAiAgentAllAgentsAverageCsatCard,
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
            drillDownMetricName:
                AiAgentDrillDownMetricName.SupportAgentCsatCard,
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
            name: 'AnalyticsAiAgentShoppingAssistantSuccessRateCard',
            Component: AnalyticsAiAgentShoppingAssistantSuccessRateCard,
            drillDownMetricName:
                AiAgentDrillDownMetricName.ShoppingAssistantSuccessRateCard,
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
            name: 'AnalyticsAiAgentAllAgentsSuccessRateCard',
            Component: AnalyticsAiAgentAllAgentsSuccessRateCard,
            drillDownMetricName:
                AiAgentDrillDownMetricName.AllAgentsSuccessRateCard,
            config: {
                label: 'Success rate',
                description:
                    'The percentage of AI Agent interactions that were fully resolved without escalation to a human agent.',
                chartType: ChartType.Card,
                metricFormat: 'decimal-to-percent' as const,
                interpretAs: 'more-is-better',
                value: 55.5,
                prevValue: 12.0,
            },
        },
        {
            name: 'AnalyticsAiAgentSupportAgentSuccessRateCard',
            Component: AnalyticsAiAgentSupportAgentSuccessRateCard,
            drillDownMetricName:
                AiAgentDrillDownMetricName.SupportAgentSuccessRateCard,
            config: {
                label: 'Success rate',
                description:
                    'The percentage of AI Agent interactions that were fully resolved without escalation to a human agent.',
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
            name: 'AnalyticsAiAgentSupportCostSavedCard',
            Component: AnalyticsAiAgentSupportCostSavedCard,
            config: {
                label: 'Cost saved',
                description:
                    'The estimated amount saved by automating interactions that would have otherwise been handled by agents, based on Helpdesk ticket cost plus the benchmark agent cost of $3.10 per ticket.',
                metricFormat: 'currency-precision-1' as const,
                value: 1234.5,
                prevValue: 1000,
            },
            timeSeriesView: {
                queryFactory: expect.any(Function),
                valueTransform: expect.any(Function),
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
            drillDownMetricName:
                AiAgentDrillDownMetricName.AllAgentsClosedTicketsCard,
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
            name: 'AnalyticsAiAgentAllAgentsDecreaseInFRTCard',
            Component: AnalyticsAiAgentAllAgentsDecreaseInFRTCard,
            drillDownMetricName: AiAgentDrillDownMetricName.AllAgentsFRTCard,
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
            name: 'AnalyticsAiAgentDecreaseinFRTCard',
            Component: AnalyticsAiAgentDecreaseinFRTCard,
            drillDownMetricName: AiAgentDrillDownMetricName.SupportAgentFRTCard,
            config: {
                label: 'Decrease in first response time',
                description:
                    'The reduction in the average time shoppers wait for the first reply to their message when AI Agent is used, compared with tickets resolved manually by support agents.',
                metricFormat: 'duration' as const,
                value: 3600,
                prevValue: 4200,
            },
            timeSeriesView: { queryFactory: expect.any(Function) },
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
            drillDownMetricName:
                AiAgentDrillDownMetricName.SupportAgentHandoverInteractionsCard,
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
            drillDownMetricName:
                AiAgentDrillDownMetricName.AllAgentsHandoverInteractionsCard,
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
            drillDownMetricName:
                AiAgentDrillDownMetricName.ShoppingAssistantHandoverInteractionsCard,
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
            drillDownMetricName:
                AiAgentDrillDownMetricName.AllAgentsResolutionTimeCard,
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
            name: 'AnalyticsSupportAgentDecreaseInResolutionTimeCard',
            Component: AnalyticsSupportAgentDecreaseInResolutionTimeCard,
            drillDownMetricName:
                AiAgentDrillDownMetricName.SupportAgentResolutionTimeCard,
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
            name: 'AnalyticsOverviewOverallAutomationRateCard',
            Component: AnalyticsOverviewOverallAutomationRateCard,
            config: {
                label: 'Automation rate',
                description:
                    'The number of interactions automated by all automation features as a % of total customer interactions.',
                metricFormat: 'decimal-to-percent' as const,
                interpretAs: 'more-is-better',
                value: 12.5,
                prevValue: 10,
            },
            timeSeriesView: { queryFactory: expect.any(Function) },
        },
        {
            name: 'AnalyticsOverviewCostSavedCard',
            Component: AnalyticsOverviewCostSavedCard,
            config: {
                label: 'Cost saved',
                description:
                    'The estimated amount saved by automating interactions that would have otherwise been handled by agents, based on Helpdesk ticket cost plus the benchmark agent cost of $3.10 per ticket.',
                metricFormat: 'currency-precision-1' as const,
                value: 1234.5,
                prevValue: 1000,
            },
            timeSeriesView: {
                queryFactory: expect.any(Function),
                valueTransform: expect.any(Function),
            },
        },
        {
            name: 'AnalyticsAiAgentAllAgentsAutomatedInteractionsCard',
            Component: AnalyticsAiAgentAllAgentsAutomatedInteractionsCard,
            drillDownMetricName:
                AiAgentDrillDownMetricName.AutomatedInteractionsCard,
            config: {
                label: 'Automated interactions',
                description:
                    'The number of fully automated interactions solved without any human agent intervention.',
                metricFormat: 'decimal' as const,
                value: 4800,
                prevValue: 4600,
            },
            timeSeriesView: { queryFactory: expect.any(Function) },
        },
        {
            name: 'AnalyticsAiAgentAllAgentsTimeSavedCard',
            Component: AnalyticsAiAgentAllAgentsTimeSavedCard,
            config: {
                label: 'Time saved by agents',
                description:
                    'The time agent would have spent resolving customer inquiries without AI Agent.',
                metricFormat: 'duration' as const,
                value: 19800,
                prevValue: 19400,
            },
            timeSeriesView: { queryFactory: expect.any(Function) },
        },
        {
            name: 'AnalyticsAiAgentSupportAgentTimeSavedCard',
            Component: AnalyticsAiAgentSupportAgentTimeSavedCard,
            config: {
                label: 'Time saved by agents',
                description:
                    'The time agent would have spent resolving customer inquiries without AI Agent.',
                metricFormat: 'duration' as const,
                value: 19800,
                prevValue: 19400,
            },
            timeSeriesView: { queryFactory: expect.any(Function) },
        },
        {
            name: 'AnalyticsAiAgentShoppingAssistantAutomatedInteractionsCard',
            Component:
                AnalyticsAiAgentShoppingAssistantAutomatedInteractionsCard,
            drillDownMetricName:
                AiAgentDrillDownMetricName.ResolvedInteractionsCard,
            config: {
                label: 'Automated interactions',
                description:
                    'The number of interactions handled by Shopping Assistant in which the customer left without asking to talk to a human agent.',
                metricFormat: 'decimal' as const,
                value: 2400,
                prevValue: 2200,
            },
            timeSeriesView: { queryFactory: expect.any(Function) },
        },
        {
            name: 'AnalyticsAiAgentRevenuePerInteractionCard',
            Component: AnalyticsAiAgentRevenuePerInteractionCard,
            config: {
                label: 'Total sale per interaction',
                description:
                    'The average total sale generated from each Shopping Assistant interaction.',
                metricFormat: 'currency-precision-1' as const,
                value: 42.5,
                prevValue: 38.0,
            },
            timeSeriesView: { queryFactory: expect.any(Function) },
        },
        {
            name: 'AnalyticsAiAgentSupportAgentAutomatedInteractionsCard',
            Component: AnalyticsAiAgentSupportAgentAutomatedInteractionsCard,
            drillDownMetricName:
                AiAgentDrillDownMetricName.SupportInteractionsCard,
            config: {
                label: 'Automated interactions',
                description:
                    'The number of fully automated interactions by AI Agent Support skills without human agent intervention.',
                metricFormat: 'decimal' as const,
                value: 1800,
                prevValue: 1600,
            },
            timeSeriesView: { queryFactory: expect.any(Function) },
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
            timeSeriesView: { queryFactory: expect.any(Function) },
        },
    ]

    beforeEach(() => {
        jest.clearAllMocks()
    })

    describe.each(testCases)(
        '$name',
        ({ Component, config, drillDownMetricName, timeSeriesView }) => {
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
                    ...(drillDownMetricName ? { drillDownMetricName } : {}),
                    ...(timeSeriesView ? { timeSeriesView } : {}),
                })
            })

            it('should pass useReportingTrendCardProps result to TrendCard', () => {
                render(<Component chartConfig={chartConfig} />)

                expect(mockTrendCard).toHaveBeenCalledWith(trendCardProps, {})
            })

            if (timeSeriesView?.valueTransform) {
                it('should produce a number when valueTransform is called with a value', () => {
                    render(
                        <Component
                            chartConfig={chartConfig}
                            chartId="test-chart-id"
                            dashboard={mockDashboard}
                        />,
                    )

                    const capturedValueTransform =
                        mockUseReportingTrendCardProps.mock.calls[0][0]
                            .timeSeriesView?.valueTransform

                    expect(capturedValueTransform?.(100)).toEqual(
                        expect.any(Number),
                    )
                })
            }
        },
    )
})
