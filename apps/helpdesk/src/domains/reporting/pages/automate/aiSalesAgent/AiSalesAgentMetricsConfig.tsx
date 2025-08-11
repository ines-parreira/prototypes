import {
    MetricTrendFetch,
    MetricTrendHook,
} from 'domains/reporting/hooks/useMetricTrend'
import {
    TimeSeriesFetch,
    TimeSeriesHook,
} from 'domains/reporting/hooks/useTimeSeries'
import {
    discountCodesOfferedDrillDownQueryFactory,
    totalNumberOfAutomatedSalesDrillDownQueryFactory,
    totalNumberOfOrderDrillDownQueryFactory,
    totalNumberOfSalesOpportunityConvFromAIAgentDrillDownQueryFactory,
    totalNumberProductRecommendationsDrillDownQueryFactory,
} from 'domains/reporting/models/queryFactories/ai-sales-agent/metrics'
import {
    fetchAverageOrderValueTrend,
    useAverageOrderValueTrend,
} from 'domains/reporting/pages/automate/aiSalesAgent/metrics/useAverageOrderValueTrend'
import {
    fetchConversionRateTrend,
    useConversionRateTrend,
} from 'domains/reporting/pages/automate/aiSalesAgent/metrics/useConversionRateTrend'
import {
    fetchDiscountCodesAppliedTrend,
    useDiscountCodesAppliedTrend,
} from 'domains/reporting/pages/automate/aiSalesAgent/metrics/useDiscountCodesAppliedTrend'
import {
    fetchDiscountCodesAverageValueTrend,
    useDiscountCodesAverageValueTrend,
} from 'domains/reporting/pages/automate/aiSalesAgent/metrics/useDiscountCodesAverageValueTrend'
import {
    fetchDiscountCodesOfferedTrend,
    useDiscountCodesOfferedTrend,
} from 'domains/reporting/pages/automate/aiSalesAgent/metrics/useDiscountCodesOfferedTrend'
import {
    fetchDiscountCodesRateAppliedTrend,
    useDiscountCodesRateAppliedTrend,
} from 'domains/reporting/pages/automate/aiSalesAgent/metrics/useDiscountCodesRateAppliedTrend'
import {
    fetchGmvInfluencedRateTrend,
    useGmvInfluencedRateTrend,
} from 'domains/reporting/pages/automate/aiSalesAgent/metrics/useGmvInfluencedRateTrend'
import {
    fetchGmvInfluencedTrend,
    useGmvInfluencedTrend,
} from 'domains/reporting/pages/automate/aiSalesAgent/metrics/useGmvInfluencedTrend'
import {
    fetchGmvInflueceOverTimeSeries,
    useGmvInfluenceOverTimeSeries,
} from 'domains/reporting/pages/automate/aiSalesAgent/metrics/useGmvInfluenceOverTimeSeries'
import {
    fetchProductBuyRateTrend,
    useProductBuyRateTrend,
} from 'domains/reporting/pages/automate/aiSalesAgent/metrics/useProductBuyRateTrend'
import {
    fetchProductClickRateTrend,
    useProductClickRateTrend,
} from 'domains/reporting/pages/automate/aiSalesAgent/metrics/useProductClickRateTrend'
import {
    fetchRoiRateTrend,
    useRoiRateTrend,
} from 'domains/reporting/pages/automate/aiSalesAgent/metrics/useRoiRateTrend'
import {
    fetchSuccessRateTrend,
    useSuccessRateTrend,
} from 'domains/reporting/pages/automate/aiSalesAgent/metrics/useSuccessRateTrend'
import {
    fetchTimeSavedByAgentTrend,
    useTimeSavedByAgentTrend,
} from 'domains/reporting/pages/automate/aiSalesAgent/metrics/useTimeSavedByAgentTrend'
import {
    fetchTotalNumberOfOrdersTrend,
    useTotalNumberOfOrdersTrend,
} from 'domains/reporting/pages/automate/aiSalesAgent/metrics/useTotalNumberOfOrdersTrend'
import {
    fetchTotalNumberOfSalesConversationsTrend,
    useTotalNumberOfSalesConversationsTrend,
} from 'domains/reporting/pages/automate/aiSalesAgent/metrics/useTotalNumberOfSalesConversationsTrend'
import {
    fetchTotalProductRecommendations,
    useTotalProductRecommendations,
} from 'domains/reporting/pages/automate/aiSalesAgent/metrics/useTotalProductRecommendations'
import {
    Domain,
    DrillDownQueryFactory,
} from 'domains/reporting/pages/common/drill-down/types'
import { MetricTrendFormat } from 'domains/reporting/pages/common/utils'
import { TooltipData } from 'domains/reporting/pages/types'

export enum AiSalesAgentChart {
    AiSalesAgentTotalSalesConv = 'aiSalesTotalSalesConv',
    AiSalesAgentGmv = 'aiSalesGmv',
    AiSalesAgentGmvInfluenced = 'aiSalesGmvInfluenced',
    AiSalesAgentRoiRate = 'aiSalesRoiRate',
    AiSalesAgentGmvInfluencedOverTime = 'aiSalesGmvInfluencedOverTime',
    AiSalesAgentTotalNumberOfOrders = 'aiSalesTotalNumberOfOrders',
    AiSalesAgentAverageOrderValue = 'aiSalesAverageOrderValue',
    AiSalesAgentTotalProductRecommendations = 'aiSalesTotalProductRecommendations',
    AiSalesAgentProductClickRate = 'aiSalesProductClickRate',
    AiSalesAgentProductBuyRate = 'aiSalesProductBuyRate',
    AiSalesAgentProductsTable = 'aiSalesProductsTable',
    AiSalesAgentSuccessRate = 'aiSalesSuccessRate',
    AiSalesAgentConversionRate = 'aiSalesConversionRate',
    AiSalesTimeSavedByAgent = 'aiSalesTimeSavedByAgent',
    AiSalesDiscountOffered = 'aiSalesDiscountOffered',
    AiSalesDiscountApplied = 'aiSalesDiscountApplied',
    AiSalesDiscountRateApplied = 'aiSalesDiscountRateApplied',
    AiSalesAverageDiscount = 'aiSalesAverageDiscount',
}

export type TrendMetric =
    | AiSalesAgentChart.AiSalesAgentTotalSalesConv
    | AiSalesAgentChart.AiSalesAgentGmv
    | AiSalesAgentChart.AiSalesAgentGmvInfluenced
    | AiSalesAgentChart.AiSalesAgentRoiRate
    | AiSalesAgentChart.AiSalesAgentTotalNumberOfOrders
    | AiSalesAgentChart.AiSalesAgentAverageOrderValue
    | AiSalesAgentChart.AiSalesAgentTotalProductRecommendations
    | AiSalesAgentChart.AiSalesAgentProductClickRate
    | AiSalesAgentChart.AiSalesAgentProductBuyRate
    | AiSalesAgentChart.AiSalesAgentSuccessRate
    | AiSalesAgentChart.AiSalesAgentConversionRate
    | AiSalesAgentChart.AiSalesTimeSavedByAgent
    | AiSalesAgentChart.AiSalesDiscountOffered
    | AiSalesAgentChart.AiSalesDiscountApplied
    | AiSalesAgentChart.AiSalesDiscountRateApplied
    | AiSalesAgentChart.AiSalesAverageDiscount

export type AiSalesMetricConfig = {
    title: string
    hint: TooltipData
    useTrend: MetricTrendHook
    fetchTrend: MetricTrendFetch
    interpretAs: 'more-is-better' | 'less-is-better' | 'neutral'
    metricFormat: MetricTrendFormat
    showMetric: boolean
    domain: Domain
}

export type AiSalesAgentDrillDownMetrics =
    | AiSalesAgentChart.AiSalesAgentTotalSalesConv
    | AiSalesAgentChart.AiSalesAgentSuccessRate
    | AiSalesAgentChart.AiSalesDiscountOffered
    | AiSalesAgentChart.AiSalesAgentTotalNumberOfOrders
    | AiSalesAgentChart.AiSalesAgentTotalProductRecommendations

type DrillDownConfig = {
    drillDownMetric: AiSalesAgentDrillDownMetrics
    drillDownQuery: DrillDownQueryFactory
}

export const AiSalesAgentMetricsWithDrillDownConfig: Record<
    AiSalesAgentDrillDownMetrics,
    AiSalesMetricConfig & DrillDownConfig
> = {
    [AiSalesAgentChart.AiSalesAgentTotalSalesConv]: {
        title: 'Conversations',
        hint: {
            title: 'The number of conversations handled using Shopping Assistant skills.',
        },
        useTrend: useTotalNumberOfSalesConversationsTrend,
        fetchTrend: fetchTotalNumberOfSalesConversationsTrend,
        interpretAs: 'more-is-better',
        metricFormat: 'decimal',
        drillDownMetric: AiSalesAgentChart.AiSalesAgentTotalSalesConv,
        drillDownQuery:
            totalNumberOfSalesOpportunityConvFromAIAgentDrillDownQueryFactory,
        showMetric: false,
        domain: Domain.AiSalesAgent,
    },
    [AiSalesAgentChart.AiSalesAgentSuccessRate]: {
        title: 'Success rate',
        hint: {
            title: 'The percentage of Shopping Assistant conversations that were fully resolved without human escalation.',
        },
        useTrend: useSuccessRateTrend,
        fetchTrend: fetchSuccessRateTrend,
        drillDownMetric: AiSalesAgentChart.AiSalesAgentSuccessRate,
        drillDownQuery: totalNumberOfAutomatedSalesDrillDownQueryFactory,
        interpretAs: 'more-is-better',
        metricFormat: 'decimal-to-percent',
        showMetric: false,
        domain: Domain.AiSalesAgent,
    },
    [AiSalesAgentChart.AiSalesDiscountOffered]: {
        title: 'Discount offered',
        hint: {
            title: 'The number of discount codes sent by Shopping Assistant.',
        },
        useTrend: useDiscountCodesOfferedTrend,
        fetchTrend: fetchDiscountCodesOfferedTrend,
        interpretAs: 'more-is-better',
        metricFormat: 'decimal',
        showMetric: true,
        domain: Domain.AiSalesAgent,
        drillDownQuery: discountCodesOfferedDrillDownQueryFactory,
        drillDownMetric: AiSalesAgentChart.AiSalesDiscountOffered,
    },
    [AiSalesAgentChart.AiSalesAgentTotalNumberOfOrders]: {
        title: 'Orders influenced',
        hint: {
            title: 'The number of orders placed within 3 days of a Shopping Assistant conversation, without a direct handover.',
        },
        useTrend: useTotalNumberOfOrdersTrend,
        fetchTrend: fetchTotalNumberOfOrdersTrend,
        interpretAs: 'more-is-better',
        metricFormat: 'decimal',
        drillDownMetric: AiSalesAgentChart.AiSalesAgentTotalNumberOfOrders,
        showMetric: false,
        domain: Domain.AiSalesAgent,
        drillDownQuery: totalNumberOfOrderDrillDownQueryFactory,
    },
    [AiSalesAgentChart.AiSalesAgentTotalProductRecommendations]: {
        title: 'Product recommendations',
        hint: {
            title: 'The number of products recommended by Shopping Assistant.',
        },
        useTrend: useTotalProductRecommendations,
        fetchTrend: fetchTotalProductRecommendations,
        interpretAs: 'more-is-better',
        metricFormat: 'decimal',
        showMetric: false,
        domain: Domain.AiSalesAgent,
        drillDownQuery: totalNumberProductRecommendationsDrillDownQueryFactory,
        drillDownMetric:
            AiSalesAgentChart.AiSalesAgentTotalProductRecommendations,
    },
}

export const AiSalesAgentMetricConfig: Record<
    TrendMetric,
    AiSalesMetricConfig
> = {
    ...AiSalesAgentMetricsWithDrillDownConfig,
    [AiSalesAgentChart.AiSalesAgentGmv]: {
        title: 'GMV Influenced',
        hint: {
            title: 'Revenue from orders placed within 3 days of a Shopping Assistant conversation, without human help.',
        },
        useTrend: useGmvInfluencedTrend,
        fetchTrend: fetchGmvInfluencedTrend,
        interpretAs: 'more-is-better',
        metricFormat: 'currency',
        showMetric: false,
        domain: Domain.AiSalesAgent,
    },
    [AiSalesAgentChart.AiSalesAgentGmvInfluenced]: {
        title: 'GMV Influence Rate',
        hint: {
            title: 'The percentage of your store’s total revenue influenced by Shopping Assistant.',
        },
        useTrend: useGmvInfluencedRateTrend,
        fetchTrend: fetchGmvInfluencedRateTrend,
        interpretAs: 'more-is-better',
        metricFormat: 'decimal-to-percent',
        showMetric: false,
        domain: Domain.AiSalesAgent,
    },
    [AiSalesAgentChart.AiSalesAgentRoiRate]: {
        title: 'ROI',
        hint: {
            title: 'The return on investment from Shopping Assistant, based on revenue generated and your cost.',
        },
        useTrend: useRoiRateTrend,
        fetchTrend: fetchRoiRateTrend,
        interpretAs: 'more-is-better',
        metricFormat: 'ratio',
        showMetric: false,
        domain: Domain.AiSalesAgent,
    },
    [AiSalesAgentChart.AiSalesAgentAverageOrderValue]: {
        title: 'Average order value',
        hint: {
            title: 'The average value of orders placed within 3 days of a conversation with Shopping Assistant.',
        },
        useTrend: useAverageOrderValueTrend,
        fetchTrend: fetchAverageOrderValueTrend,
        interpretAs: 'more-is-better',
        metricFormat: 'currency',
        showMetric: false,
        domain: Domain.AiSalesAgent,
    },
    [AiSalesAgentChart.AiSalesAgentProductClickRate]: {
        title: 'Click through rate',
        hint: {
            title: 'The percentage of product recommendations clicked by customers.',
        },
        useTrend: useProductClickRateTrend,
        fetchTrend: fetchProductClickRateTrend,
        interpretAs: 'more-is-better',
        metricFormat: 'percent',
        showMetric: false,
        domain: Domain.AiSalesAgent,
    },
    [AiSalesAgentChart.AiSalesAgentProductBuyRate]: {
        title: 'Buy through rate',
        hint: {
            title: 'The percentage of tickets with product recommendations that led to a purchase.',
        },
        useTrend: useProductBuyRateTrend,
        fetchTrend: fetchProductBuyRateTrend,
        interpretAs: 'more-is-better',
        metricFormat: 'percent',
        showMetric: false,
        domain: Domain.AiSalesAgent,
    },

    [AiSalesAgentChart.AiSalesAgentConversionRate]: {
        title: 'Conversion rate',
        hint: {
            title: 'The percentage of Shopping Assistant interactions after which an order was placed within 3 days.',
        },
        useTrend: useConversionRateTrend,
        fetchTrend: fetchConversionRateTrend,
        interpretAs: 'more-is-better',
        metricFormat: 'decimal-to-percent',
        showMetric: false,
        domain: Domain.AiSalesAgent,
    },
    [AiSalesAgentChart.AiSalesTimeSavedByAgent]: {
        title: 'Time saved by agents',
        hint: {
            title: 'The estimated time that human agents would have spent on conversations handled autonomously by Shopping Assistant.',
        },
        useTrend: useTimeSavedByAgentTrend,
        fetchTrend: fetchTimeSavedByAgentTrend,
        interpretAs: 'more-is-better',
        metricFormat: 'duration',
        showMetric: false,
        domain: Domain.AiSalesAgent,
    },

    [AiSalesAgentChart.AiSalesDiscountApplied]: {
        title: 'Discount codes applied',
        hint: {
            title: 'The number of purchases placed using discount codes sent by Shopping Assistant.',
        },
        useTrend: useDiscountCodesAppliedTrend,
        fetchTrend: fetchDiscountCodesAppliedTrend,
        interpretAs: 'more-is-better',
        metricFormat: 'decimal',
        showMetric: false,
        domain: Domain.AiSalesAgent,
    },
    [AiSalesAgentChart.AiSalesDiscountRateApplied]: {
        title: 'Discount usage',
        hint: {
            title: 'The percentage of discounts sent by Shopping Assistant that customers apply.',
        },
        useTrend: useDiscountCodesRateAppliedTrend,
        fetchTrend: fetchDiscountCodesRateAppliedTrend,
        interpretAs: 'more-is-better',
        metricFormat: 'decimal-to-percent',
        showMetric: false,
        domain: Domain.AiSalesAgent,
    },
    [AiSalesAgentChart.AiSalesAverageDiscount]: {
        title: 'Average discount amount',
        hint: {
            title: 'The average discount ($) offered by Shopping Assistant and applied by customers.',
        },
        useTrend: useDiscountCodesAverageValueTrend,
        fetchTrend: fetchDiscountCodesAverageValueTrend,
        interpretAs: 'more-is-better',
        metricFormat: 'currency',
        showMetric: false,
        domain: Domain.AiSalesAgent,
    },
}

export type TimeSeriesMetric =
    AiSalesAgentChart.AiSalesAgentGmvInfluencedOverTime

export const AiSalesAgentChartConfig: Record<
    TimeSeriesMetric,
    {
        title: string
        hint: TooltipData
        useTimeSeries: TimeSeriesHook
        fetchTimeSeries: TimeSeriesFetch
    }
> = {
    [AiSalesAgentChart.AiSalesAgentGmvInfluencedOverTime]: {
        title: 'GMV influenced over time',
        hint: {
            title: 'The value of your store’s total GMV influenced by Shopping Assistant, shown over time.',
        },
        useTimeSeries: useGmvInfluenceOverTimeSeries,
        fetchTimeSeries: fetchGmvInflueceOverTimeSeries,
    },
}
