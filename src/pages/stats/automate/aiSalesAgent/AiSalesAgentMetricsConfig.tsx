import {
    MetricTrendFetch,
    MetricTrendHook,
} from 'hooks/reporting/useMetricTrend'
import { TimeSeriesFetch, TimeSeriesHook } from 'hooks/reporting/useTimeSeries'
import {
    discountCodesOfferedDrillDownQueryFactory,
    totalNumberOfAutomatedSalesDrillDownQueryFactory,
    totalNumberOfOrderDrillDownQueryFactory,
    totalNumberofSalesOpportunityConvFromAIAgentDrillDownQueryFactory,
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
    fetchTotalProductRecommendations,
    useTotalProductRecommendations,
} from 'pages/stats/automate/aiSalesAgent/metrics/useTotalProductRecommendations'
import {
    fetchTotalSalesOpportunityAIConvTrend,
    useTotalSalesOpportunityAIConvTrend,
} from 'pages/stats/automate/aiSalesAgent/metrics/useTotalSalesOpportunityAIConvTrend'
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
            title: 'The number of conversations handled or influenced by the AI Agent for Sales.',
        },
        useTrend: useTotalSalesOpportunityAIConvTrend,
        fetchTrend: fetchTotalSalesOpportunityAIConvTrend,
        interpretAs: 'more-is-better',
        metricFormat: 'decimal',
        drillDownMetric: AiSalesAgentChart.AiSalesAgentTotalSalesConv,
        drillDownQuery:
            totalNumberofSalesOpportunityConvFromAIAgentDrillDownQueryFactory,
        showMetric: false,
        domain: Domain.AiSalesAgent,
    },
    [AiSalesAgentChart.AiSalesAgentSuccessRate]: {
        title: 'Success rate',
        hint: {
            title: 'The percentage of AI Agent for Sales interactions that were successfully automated without human escalation.',
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
        title: 'Discount codes offered',
        hint: {
            title: 'Number of discount codes that were sent by AI Agent for Sales. ',
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
        title: 'Number of orders influenced',
        hint: {
            title: 'The number of orders influenced within 7 days of a conversation with the AI Agent for Sales, without human intervention.',
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
}

export const AiSalesAgentMetricConfig: Record<
    TrendMetric,
    AiSalesMetricConfig
> = {
    ...AiSalesAgentMetricsWithDrillDownConfig,
    [AiSalesAgentChart.AiSalesAgentGmv]: {
        title: 'GMV influenced $',
        hint: {
            title: 'The revenue generated from orders placed during or within 7 days after a conversation with the AI Agent for Sales, without human intervention.',
        },
        useTrend: useGmvInfluencedTrend,
        fetchTrend: fetchGmvInfluencedTrend,
        interpretAs: 'more-is-better',
        metricFormat: 'currency',
        showMetric: false,
        domain: Domain.AiSalesAgent,
    },
    [AiSalesAgentChart.AiSalesAgentGmvInfluenced]: {
        title: 'GMV influenced %',
        hint: {
            title: 'The percentage of revenue generated from AI-influenced orders, relative to all revenue.',
        },
        useTrend: useGmvInfluencedRateTrend,
        fetchTrend: fetchGmvInfluencedRateTrend,
        interpretAs: 'more-is-better',
        metricFormat: 'decimal-to-percent',
        showMetric: false,
        domain: Domain.AiSalesAgent,
    },
    [AiSalesAgentChart.AiSalesAgentRoiRate]: {
        title: 'ROI rate',
        hint: {
            title: 'The return on investment, calculated as the ratio between the GMV generated and the cost of the AI Agent for Sales.',
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
            title: 'The average revenue per order influenced by the AI Agent for Sales.',
        },
        useTrend: useAverageOrderValueTrend,
        fetchTrend: fetchAverageOrderValueTrend,
        interpretAs: 'more-is-better',
        metricFormat: 'currency',
        showMetric: false,
        domain: Domain.AiSalesAgent,
    },
    [AiSalesAgentChart.AiSalesAgentTotalProductRecommendations]: {
        title: 'Product recommendations',
        hint: {
            title: 'The number of product recommendations made by the AI Agent for Sales.',
        },
        useTrend: useTotalProductRecommendations,
        fetchTrend: fetchTotalProductRecommendations,
        interpretAs: 'more-is-better',
        metricFormat: 'decimal',
        showMetric: false,
        domain: Domain.AiSalesAgent,
    },
    [AiSalesAgentChart.AiSalesAgentProductClickRate]: {
        title: 'Click rate',
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
        title: 'Buy rate',
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
            title: 'The percentage of AI Agent for Sales interactions that resulted in a sale.',
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
            title: 'The estimated time saved by AI Agent for Sales in assisting customers with their purchases, reducing manual workload for human agents.',
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
            title: 'Number of discount codes sent by AI Agent for Sales used by customer to make a purchase.',
        },
        useTrend: useDiscountCodesAppliedTrend,
        fetchTrend: fetchDiscountCodesAppliedTrend,
        interpretAs: 'more-is-better',
        metricFormat: 'decimal',
        showMetric: false,
        domain: Domain.AiSalesAgent,
    },
    [AiSalesAgentChart.AiSalesDiscountRateApplied]: {
        title: '% discount applied',
        hint: {
            title: 'Percentage of discount codes sent by AI Agent for Sales used by customers for a purchase over the discount codes sent.',
        },
        useTrend: useDiscountCodesRateAppliedTrend,
        fetchTrend: fetchDiscountCodesRateAppliedTrend,
        interpretAs: 'more-is-better',
        metricFormat: 'decimal-to-percent',
        showMetric: false,
        domain: Domain.AiSalesAgent,
    },
    [AiSalesAgentChart.AiSalesAverageDiscount]: {
        title: 'Average discount used',
        hint: {
            title: 'Average discount (in $) of all the codes used by customers for a purchase.',
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
        title: 'GMV influenced % over time ',
        hint: {
            title: 'The percentage of revenue influenced by the AI Agent for Sales over a specific period of time.',
        },
        useTimeSeries: useGmvInfluenceOverTimeSeries,
        fetchTimeSeries: fetchGmvInflueceOverTimeSeries,
    },
}
