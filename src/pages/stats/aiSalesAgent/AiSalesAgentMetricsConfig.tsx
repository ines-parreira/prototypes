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
    fetchGmvInfluencedTrend,
    useGmvInfluencedTrend,
} from 'pages/stats/aiSalesAgent/metrics/useGmvInfluencedTrend'
import {
    fetchGmvInflueceOverTimeSeries,
    useGmvInfluenceOverTimeSeries,
} from 'pages/stats/aiSalesAgent/metrics/useGmvInfluenceOverTimeSeries'
import {
    fetchGmvTrend,
    useGmvTrend,
} from 'pages/stats/aiSalesAgent/metrics/useGmvTrend'
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
        title: 'Total AI Sales Conv',
        hint: {
            title: 'The total number of conversations handled or influenced by the AI Agent for Sales.',
        },
        useTrend: useTotalSalesOportunityAIConvTrend,
        fetchTrend: fetchTotalSalesOportunityAIConvTrend,
        interpretAs: 'more-is-better',
        metricFormat: 'decimal',
    },
    [AiSalesAgentChart.AiSalesAgentGmv]: {
        title: 'GMV $',
        hint: {
            title: 'The total revenue generated from orders placed during or after a conversation with the AI Agent, without human intervention.',
        },
        useTrend: useGmvTrend,
        fetchTrend: fetchGmvTrend,
        interpretAs: 'more-is-better',
        metricFormat: 'decimal',
    },
    [AiSalesAgentChart.AiSalesAgentGmvInfluenced]: {
        title: 'GMV Influenced %',
        hint: {
            title: 'The percentage of total revenue generated from AI-influenced orders, relative to all revenue.',
        },
        useTrend: useGmvInfluencedTrend,
        fetchTrend: fetchGmvInfluencedTrend,
        interpretAs: 'more-is-better',
        metricFormat: 'decimal',
    },
    [AiSalesAgentChart.AiSalesAgentRoiRate]: {
        title: 'ROI Rate',
        hint: {
            title: 'The return on investment, calculated as the ratio between the GMV generated and the cost of the AI Agent for Sales.',
        },
        useTrend: useRoiRateTrend,
        fetchTrend: fetchRoiRateTrend,
        interpretAs: 'more-is-better',
        metricFormat: 'decimal',
    },
    [AiSalesAgentChart.AiSalesAgentTotalNumberOfOrders]: {
        title: 'Total Number of Orders',
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
        metricFormat: 'decimal',
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
            title: 'The percentage of product recommendations clicked by the customer.',
        },
        useTrend: useProductClickRate,
        fetchTrend: fetchProductClickRate,
        interpretAs: 'more-is-better',
        metricFormat: 'decimal',
    },
    [AiSalesAgentChart.AiSalesAgentProductBuyRate]: {
        title: 'Buy Rate',
        hint: {
            title: 'The percentage of product recommendations that led to a purchase.',
        },
        useTrend: useProductBuyRate,
        fetchTrend: fetchProductBuyRate,
        interpretAs: 'more-is-better',
        metricFormat: 'decimal',
    },
    [AiSalesAgentChart.AiSalesAgentSuccessRate]: {
        title: 'Success Rate',
        hint: {
            title: 'The percentage of AI Agent interactions that were successfully automated without human escalation.',
        },
        useTrend: useSuccessRateTrend,
        fetchTrend: fetchSuccessRateTrend,
        interpretAs: 'more-is-better',
        metricFormat: 'decimal',
    },
    [AiSalesAgentChart.AiSalesAgentConversionRate]: {
        title: 'Conversion Rate',
        hint: {
            title: 'The percentage of AI Agent interactions that resulted in a sale.',
        },
        useTrend: useConversionRate,
        fetchTrend: fetchConversionRate,
        interpretAs: 'more-is-better',
        metricFormat: 'decimal',
    },
    [AiSalesAgentChart.AiSalesTimeSavedByAgent]: {
        title: 'Time Saved by Agent',
        hint: {
            title: 'The estimated time saved by AI Agent for Sales in assisting customers with their purchases, reducing manual workload for human agents.',
        },
        useTrend: useTimeSavedByAgentTrend,
        fetchTrend: fetchTimeSavedByAgentTrend,
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
        title: 'GMV Influenced Over Time',
        hint: {
            title: 'The percentage of revenue influenced by the AI Agent over a specific period.',
        },
        useTimeSeries: useGmvInfluenceOverTimeSeries,
        fetchTimeSeries: fetchGmvInflueceOverTimeSeries,
    },
}
