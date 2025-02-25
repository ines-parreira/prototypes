import {MetricTrendHook} from 'hooks/reporting/useMetricTrend'
import {TimeSeriesHook} from 'hooks/reporting/useTimeSeries'

import useGmvInfluecedTrend from 'pages/stats/aiSalesAgent/metrics/useGmvInfluecedTrend'
import useGmvInfluenceOverTimeSeries from 'pages/stats/aiSalesAgent/metrics/useGmvInfluenceOverTimeSeries'
import useGmvTrend from 'pages/stats/aiSalesAgent/metrics/useGmvTrend'
import useRoiRateTrend from 'pages/stats/aiSalesAgent/metrics/useRoiRateTrend'
import useTotalAIConvTrend from 'pages/stats/aiSalesAgent/metrics/useTotalAIConvTrend'
import {TooltipData} from 'pages/stats/types'

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
        interpretAs: 'more-is-better' | 'less-is-better' | 'neutral'
    }
> = {
    [AiSalesAgentChart.AiSalesAgentTotalSalesConv]: {
        title: 'Total AI Sales Conv',
        hint: {
            title: 'The total number of conversations handled or influenced by the AI Agent for Sales.',
        },
        useTrend: useTotalAIConvTrend,
        interpretAs: 'more-is-better',
    },
    [AiSalesAgentChart.AiSalesAgentGmv]: {
        title: 'GMV $',
        hint: {
            title: 'The total revenue generated from orders placed during or after a conversation with the AI Agent, without human intervention.',
        },
        useTrend: useGmvTrend,
        interpretAs: 'more-is-better',
    },
    [AiSalesAgentChart.AiSalesAgentGmvInfluenced]: {
        title: 'GMV Influenced %',
        hint: {
            title: 'The percentage of total revenue generated from AI-influenced orders, relative to all revenue.',
        },
        useTrend: useGmvInfluecedTrend,
        interpretAs: 'more-is-better',
    },
    [AiSalesAgentChart.AiSalesAgentRoiRate]: {
        title: 'ROI Rate',
        hint: {
            title: 'The return on investment, calculated as the ratio between the GMV generated and the cost of the AI Agent for Sales.',
        },
        useTrend: useRoiRateTrend,
        interpretAs: 'more-is-better',
    },
    [AiSalesAgentChart.AiSalesAgentTotalNumberOfOrders]: {
        title: 'Total Number of Orders',
        hint: {
            title: 'The total number of orders influenced by a conversation with the AI Agent, without human intervention.',
        },
        useTrend: useRoiRateTrend,
        interpretAs: 'more-is-better',
    },
    [AiSalesAgentChart.AiSalesAgentAverageOrderValue]: {
        title: 'Average Order Value',
        hint: {
            title: 'The average revenue per order influenced by the AI Agent for Sales.',
        },
        useTrend: useRoiRateTrend,
        interpretAs: 'more-is-better',
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
    }
> = {
    [AiSalesAgentChart.AiSalesAgentGmvInfluencedOverTime]: {
        title: 'GMV Influenced Over Time',
        hint: {
            title: 'The percentage of revenue influenced by the AI Agent over a specific period.',
        },
        useTimeSeries: useGmvInfluenceOverTimeSeries,
    },
}
