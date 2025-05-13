import {
    MetricTrendFetch,
    MetricTrendHook,
} from 'hooks/reporting/useMetricTrend'
import { TimeSeriesFetch, TimeSeriesHook } from 'hooks/reporting/useTimeSeries'
import {
    discountCodesOfferedDrillDownQueryFactory,
    totalNumberOfAutomatedSalesDrillDownQueryFactory,
    totalNumberOfOrderDrillDownQueryFactory,
    totalNumberOfSalesOpportunityConvFromAIAgentDrillDownQueryFactory,
    totalNumberProductRecommendationsDrillDownQueryFactory,
} from 'models/reporting/queryFactories/ai-sales-agent/metrics'
import {
    fetchAverageOrderValueTrend,
    useAverageOrderValueTrend,
} from 'pages/stats/automate/aiSalesAgent/metrics/useAverageOrderValueTrend'
import {
    fetchDiscountCodesAppliedTrend,
    useDiscountCodesAppliedTrend,
} from 'pages/stats/automate/aiSalesAgent/metrics/useDiscountCodesAppliedTrend'
import {
    fetchDiscountCodesAverageValueTrend,
    useDiscountCodesAverageValueTrend,
} from 'pages/stats/automate/aiSalesAgent/metrics/useDiscountCodesAverageValueTrend'
import {
    fetchDiscountCodesOfferedTrend,
    useDiscountCodesOfferedTrend,
} from 'pages/stats/automate/aiSalesAgent/metrics/useDiscountCodesOfferedTrend'
import {
    fetchDiscountCodesRateAppliedTrend,
    useDiscountCodesRateAppliedTrend,
} from 'pages/stats/automate/aiSalesAgent/metrics/useDiscountCodesRateAppliedTrend'
import {
    fetchGmvInfluencedRateTrend,
    useGmvInfluencedRateTrend,
} from 'pages/stats/automate/aiSalesAgent/metrics/useGmvInfluencedRateTrend'
import {
    fetchGmvInfluencedTrend,
    useGmvInfluencedTrend,
} from 'pages/stats/automate/aiSalesAgent/metrics/useGmvInfluencedTrend'
import {
    fetchGmvInflueceOverTimeSeries,
    useGmvInfluenceOverTimeSeries,
} from 'pages/stats/automate/aiSalesAgent/metrics/useGmvInfluenceOverTimeSeries'
import {
    fetchRoiRateTrend,
    useRoiRateTrend,
} from 'pages/stats/automate/aiSalesAgent/metrics/useRoiRateTrend'
import {
    fetchSuccessRateTrend,
    useSuccessRateTrend,
} from 'pages/stats/automate/aiSalesAgent/metrics/useSuccessRateTrend'
import {
    fetchTimeSavedByAgentTrend,
    useTimeSavedByAgentTrend,
} from 'pages/stats/automate/aiSalesAgent/metrics/useTimeSavedByAgentTrend'
import {
    fetchTotalNumberOfOrdersTrend,
    useTotalNumberOfOrdersTrend,
} from 'pages/stats/automate/aiSalesAgent/metrics/useTotalNumberOfOrdersTrend'
import {
    fetchTotalNumberOfSalesConversationsTrend,
    useTotalNumberOfSalesConversationsTrend,
} from 'pages/stats/automate/aiSalesAgent/metrics/useTotalNumberOfSalesConversationsTrend'
import {
    fetchTotalProductRecommendations,
    useTotalProductRecommendations,
} from 'pages/stats/automate/aiSalesAgent/metrics/useTotalProductRecommendations'
import { DrillDownQueryFactory } from 'pages/stats/common/drill-down/DrillDownTableConfig'
import { Domain } from 'pages/stats/common/drill-down/types'
import { MetricTrendFormat } from 'pages/stats/common/utils'
import { TooltipData } from 'pages/stats/types'

import {
    fetchConversionRateTrend,
    useConversionRateTrend,
} from './metrics/useConversionRateTrend'
import {
    fetchProductBuyRateTrend,
    useProductBuyRateTrend,
} from './metrics/useProductBuyRateTrend'
import {
    fetchProductClickRateTrend,
    useProductClickRateTrend,
} from './metrics/useProductClickRateTrend'

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

type AiSalesMetricConfig = {
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
            title: 'The number of orders placed within 7 days of a Shopping Assistant conversation, without a direct handover.',
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
            title: 'Revenue from orders placed within 7 days of a Shopping Assistant conversation, without human help.',
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
            title: 'The average value of orders placed within 7 days of a conversation with Shopping Assistant.',
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
        title: 'Converted recommendations',
        hint: {
            title: 'The percentage of product recommendations that led to a purchase.',
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
            title: 'The percentage of Shopping Assistant interactions after which an order was placed within 7 days.',
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
        title: 'GMV influence rate (%) over time',
        hint: {
            title: 'The percentage of your store’s total GMV influenced by Shopping Assistant, shown over time.',
        },
        useTimeSeries: useGmvInfluenceOverTimeSeries,
        fetchTimeSeries: fetchGmvInflueceOverTimeSeries,
    },
}
