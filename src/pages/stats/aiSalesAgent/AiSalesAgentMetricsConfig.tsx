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
    fetchGmvInfluecedTrend,
    useGmvInfluecedTrend,
} from 'pages/stats/aiSalesAgent/metrics/useGmvInfluecedTrend'
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
    fetchTotalAIConvTrend,
    useTotalAIConvTrend,
} from 'pages/stats/aiSalesAgent/metrics/useTotalAIConvTrend'
import {
    fetchTotalNumberOfOrders,
    useTotalNumberOfOrders,
} from 'pages/stats/aiSalesAgent/metrics/useTotalNumberOfOrders'
import { MetricTrendFormat } from 'pages/stats/common/utils'
import { TooltipData } from 'pages/stats/types'

export enum AiSalesAgentChart {
    AiSalesAgentTotalSalesConv = 'aiSalesTotalSalesConv',
    AiSalesAgentGmv = 'aiSalesGmv',
    AiSalesAgentGmvInfluenced = 'aiSalesGmvInfluenced',
    AiSalesAgentRoiRate = 'aiSalesRoiRate',
    AiSalesAgentGmvInfluencedOverTime = 'aiSalesGmvInfluencedOverTime',
    AiSalesAgentTotalNumberOfOrders = 'aiSalesTotalNumberOfOrders',
    AiSalesAgentAverageOrderValue = 'aiSalesAverageOrderValue',
}

export type TrendMetric =
    | AiSalesAgentChart.AiSalesAgentTotalSalesConv
    | AiSalesAgentChart.AiSalesAgentGmv
    | AiSalesAgentChart.AiSalesAgentGmvInfluenced
    | AiSalesAgentChart.AiSalesAgentRoiRate
    | AiSalesAgentChart.AiSalesAgentTotalNumberOfOrders
    | AiSalesAgentChart.AiSalesAgentAverageOrderValue

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
        useTrend: useTotalAIConvTrend,
        fetchTrend: fetchTotalAIConvTrend,
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
        useTrend: useGmvInfluecedTrend,
        fetchTrend: fetchGmvInfluecedTrend,
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
