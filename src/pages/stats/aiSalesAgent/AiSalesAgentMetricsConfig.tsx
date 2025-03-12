import {
    MetricTrendFetch,
    MetricTrendHook,
} from 'hooks/reporting/useMetricTrend'
import { TimeSeriesFetch, TimeSeriesHook } from 'hooks/reporting/useTimeSeries'
import {
    fetchAverageOrderValue,
    useAverageOrderValue,
} from 'pages/stats/aiSalesAgent/metrics/useAverageOrderValue'
import {
    fetchDiscountCodesApplied,
    useDiscountCodesApplied,
} from 'pages/stats/aiSalesAgent/metrics/useDiscountCodesApplied'
import {
    fetchDiscountCodesAverageValue,
    useDiscountCodesAverageValue,
} from 'pages/stats/aiSalesAgent/metrics/useDiscountCodesAverageValue'
import {
    fetchDiscountCodesOffered,
    useDiscountCodesOffered,
} from 'pages/stats/aiSalesAgent/metrics/useDiscountCodesOffered'
import {
    fetchDiscountCodesRateApplied,
    useDiscountCodesRateApplied,
} from 'pages/stats/aiSalesAgent/metrics/useDiscountCodesRateApplied'
import {
    fetchGmvInfluencedRateTrend,
    useGmvInfluencedRateTrend,
} from 'pages/stats/aiSalesAgent/metrics/useGmvInfluencedRateTrend'
import {
    fetchGmvInfluencedTrend,
    useGmvInfluencedTrend,
} from 'pages/stats/aiSalesAgent/metrics/useGmvInfluencedTrend'
import {
    fetchGmvInflueceOverTimeSeries,
    useGmvInfluenceOverTimeSeries,
} from 'pages/stats/aiSalesAgent/metrics/useGmvInfluenceOverTimeSeries'
import {
    fetchRoiRateTrend,
    useRoiRateTrend,
} from 'pages/stats/aiSalesAgent/metrics/useRoiRateTrend'
import {
    fetchSuccessRateTrend,
    useSuccessRateTrend,
} from 'pages/stats/aiSalesAgent/metrics/useSuccessRateTrend'
import {
    fetchTimeSavedByAgentTrend,
    useTimeSavedByAgentTrend,
} from 'pages/stats/aiSalesAgent/metrics/useTimeSavedByAgentTrend'
import {
    fetchTotalNumberOfOrders,
    useTotalNumberOfOrders,
} from 'pages/stats/aiSalesAgent/metrics/useTotalNumberOfOrders'
import {
    fetchTotalProductRecommendations,
    useTotalProductRecommendations,
} from 'pages/stats/aiSalesAgent/metrics/useTotalProductRecommendations'
import {
    fetchTotalSalesOportunityAIConvTrend,
    useTotalSalesOportunityAIConvTrend,
} from 'pages/stats/aiSalesAgent/metrics/useTotalSalesOportunityAIConvTrend'
import { MetricTrendFormat } from 'pages/stats/common/utils'
import { TooltipData } from 'pages/stats/types'

import {
    fetchConversionRate,
    useConversionRate,
} from './metrics/useConversionRate'
import {
    fetchProductBuyRate,
    useProductBuyRate,
} from './metrics/useProductBuyRate'
import {
    fetchProductClickRate,
    useProductClickRate,
} from './metrics/useProductClickRate'

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

export const AiSalesAgentMetricConfig: Record<
    TrendMetric,
    {
        title: string
        hint: TooltipData
        useTrend: MetricTrendHook
        fetchTrend: MetricTrendFetch
        interpretAs: 'more-is-better' | 'less-is-better' | 'neutral'
        metricFormat: MetricTrendFormat
    }
> = {
    [AiSalesAgentChart.AiSalesAgentTotalSalesConv]: {
        title: 'Total Conversations',
        hint: {
            title: 'The total number of conversations handled or influenced by the AI Agent for Sales.',
        },
        useTrend: useTotalSalesOportunityAIConvTrend,
        fetchTrend: fetchTotalSalesOportunityAIConvTrend,
        interpretAs: 'more-is-better',
        metricFormat: 'decimal',
    },
    [AiSalesAgentChart.AiSalesAgentGmv]: {
        title: 'GMV Influenced $',
        hint: {
            title: 'The total revenue generated from orders placed during or after a conversation with the AI Agent, without human intervention.',
        },
        useTrend: useGmvInfluencedTrend,
        fetchTrend: fetchGmvInfluencedTrend,
        interpretAs: 'more-is-better',
        metricFormat: 'currency',
    },
    [AiSalesAgentChart.AiSalesAgentGmvInfluenced]: {
        title: 'GMV Influenced %',
        hint: {
            title: 'The percentage of total revenue generated from AI-influenced orders, relative to all revenue.',
        },
        useTrend: useGmvInfluencedRateTrend,
        fetchTrend: fetchGmvInfluencedRateTrend,
        interpretAs: 'more-is-better',
        metricFormat: 'decimal-to-percent',
    },
    [AiSalesAgentChart.AiSalesAgentRoiRate]: {
        title: 'ROI Rate',
        hint: {
            title: 'The return on investment, calculated as the ratio between the GMV generated and the cost of the AI Agent for Sales.',
        },
        useTrend: useRoiRateTrend,
        fetchTrend: fetchRoiRateTrend,
        interpretAs: 'more-is-better',
        metricFormat: 'ratio',
    },
    [AiSalesAgentChart.AiSalesAgentTotalNumberOfOrders]: {
        title: 'Total Number of Orders influenced',
        hint: {
            title: 'The total number of orders influenced by a conversation with the AI Agent, without human intervention.',
        },
        useTrend: useTotalNumberOfOrders,
        fetchTrend: fetchTotalNumberOfOrders,
        interpretAs: 'more-is-better',
        metricFormat: 'decimal',
    },
    [AiSalesAgentChart.AiSalesAgentAverageOrderValue]: {
        title: 'Average Order Value',
        hint: {
            title: 'The average revenue per order influenced by the AI Agent for Sales.',
        },
        useTrend: useAverageOrderValue,
        fetchTrend: fetchAverageOrderValue,
        interpretAs: 'more-is-better',
        metricFormat: 'currency',
    },
    [AiSalesAgentChart.AiSalesAgentTotalProductRecommendations]: {
        title: 'Total Product Recommendations',
        hint: {
            title: 'The total number of product recommendations made by the AI Agent for Sales.',
        },
        useTrend: useTotalProductRecommendations,
        fetchTrend: fetchTotalProductRecommendations,
        interpretAs: 'more-is-better',
        metricFormat: 'decimal',
    },
    [AiSalesAgentChart.AiSalesAgentProductClickRate]: {
        title: 'Click Rate',
        hint: {
            title: 'The percentage of product recommendations clicked by customers.',
        },
        useTrend: useProductClickRate,
        fetchTrend: fetchProductClickRate,
        interpretAs: 'more-is-better',
        metricFormat: 'percent',
    },
    [AiSalesAgentChart.AiSalesAgentProductBuyRate]: {
        title: 'Buy Rate',
        hint: {
            title: 'The percentage of product recommendations that led to a purchase.',
        },
        useTrend: useProductBuyRate,
        fetchTrend: fetchProductBuyRate,
        interpretAs: 'more-is-better',
        metricFormat: 'percent',
    },
    [AiSalesAgentChart.AiSalesAgentSuccessRate]: {
        title: 'Success Rate',
        hint: {
            title: 'The percentage of AI Agent interactions that were successfully automated without human escalation.',
        },
        useTrend: useSuccessRateTrend,
        fetchTrend: fetchSuccessRateTrend,
        interpretAs: 'more-is-better',
        metricFormat: 'percent',
    },
    [AiSalesAgentChart.AiSalesAgentConversionRate]: {
        title: 'Conversion Rate',
        hint: {
            title: 'The percentage of AI Agent interactions that resulted in a sale.',
        },
        useTrend: useConversionRate,
        fetchTrend: fetchConversionRate,
        interpretAs: 'more-is-better',
        metricFormat: 'percent',
    },
    [AiSalesAgentChart.AiSalesTimeSavedByAgent]: {
        title: 'Time Saved by Agents',
        hint: {
            title: 'The estimated time saved by AI Agent for Sales in assisting customers with their purchases, reducing manual workload for human agents.',
        },
        useTrend: useTimeSavedByAgentTrend,
        fetchTrend: fetchTimeSavedByAgentTrend,
        interpretAs: 'more-is-better',
        metricFormat: 'duration',
    },
    [AiSalesAgentChart.AiSalesDiscountOffered]: {
        title: '# Discount Codes Offered',
        hint: {
            title: 'Number of discount codes that were sent by AI Agent for Sales. ',
        },
        useTrend: useDiscountCodesOffered,
        fetchTrend: fetchDiscountCodesOffered,
        interpretAs: 'more-is-better',
        metricFormat: 'decimal',
    },
    [AiSalesAgentChart.AiSalesDiscountApplied]: {
        title: '# Discount Codes Applied',
        hint: {
            title: 'Number of discount codes sent by AI Agent for Sales used by customer to make a purchase.',
        },
        useTrend: useDiscountCodesApplied,
        fetchTrend: fetchDiscountCodesApplied,
        interpretAs: 'more-is-better',
        metricFormat: 'decimal',
    },
    [AiSalesAgentChart.AiSalesDiscountRateApplied]: {
        title: '% Discount Applied',
        hint: {
            title: 'Percentage of discount codes sent by AI Agent used by customers for a purchase over the total of discount codes sent.',
        },
        useTrend: useDiscountCodesRateApplied,
        fetchTrend: fetchDiscountCodesRateApplied,
        interpretAs: 'more-is-better',
        metricFormat: 'decimal-to-percent',
    },
    [AiSalesAgentChart.AiSalesAverageDiscount]: {
        title: 'Average Discount',
        hint: {
            title: 'Average discount of all the codes used by customers for a purchase. ',
        },
        useTrend: useDiscountCodesAverageValue,
        fetchTrend: fetchDiscountCodesAverageValue,
        interpretAs: 'more-is-better',
        metricFormat: 'decimal',
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
        title: 'GMV Influenced % Over Time ',
        hint: {
            title: 'The percentage of revenue influenced by the AI Agent over a specific period of time.',
        },
        useTimeSeries: useGmvInfluenceOverTimeSeries,
        fetchTimeSeries: fetchGmvInflueceOverTimeSeries,
    },
}
