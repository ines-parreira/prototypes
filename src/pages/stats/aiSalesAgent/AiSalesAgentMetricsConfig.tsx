import {MetricTrendHook} from 'hooks/reporting/useMetricTrend'
import {TimeSeriesHook} from 'hooks/reporting/useTimeSeries'

import useGmvInfluecedTrend from 'pages/stats/aiSalesAgent/metrics/useGmvInfluecedTrend'
import useGmvInfluenceOverTimeSeries from 'pages/stats/aiSalesAgent/metrics/useGmvInfluenceOverTimeSeries'
import useGmvTrend from 'pages/stats/aiSalesAgent/metrics/useGmvTrend'
import useRoiRateTrend from 'pages/stats/aiSalesAgent/metrics/useRoiRateTrend'
import useTotalAIConvTrend from 'pages/stats/aiSalesAgent/metrics/useTotalAIConvTrend'

export enum AiSalesAgentChart {
    AiSalesAgentTotalSalesConv = 'aiSalesTotalSalesConv',
    AiSalesAgentGmv = 'aiSalesGmv',
    AiSalesAgentGmvInfluenced = 'aiSalesGmvInfluenced',
    AiSalesAgentRoiRate = 'aiSalesRoiRate',
    AiSalesAgentGmvInfluencedOverTime = 'aiSalesGmvInfluencedOverTime',
}

export type TrendMetric =
    | AiSalesAgentChart.AiSalesAgentTotalSalesConv
    | AiSalesAgentChart.AiSalesAgentGmv
    | AiSalesAgentChart.AiSalesAgentGmvInfluenced
    | AiSalesAgentChart.AiSalesAgentRoiRate

export const AiSalesAgentMetricConfig: Record<
    TrendMetric,
    {
        title: string
        useTrend: MetricTrendHook
        interpretAs: 'more-is-better' | 'less-is-better' | 'neutral'
    }
> = {
    [AiSalesAgentChart.AiSalesAgentTotalSalesConv]: {
        title: 'Total AI Sales Conv',
        useTrend: useTotalAIConvTrend,
        interpretAs: 'more-is-better',
    },
    [AiSalesAgentChart.AiSalesAgentGmv]: {
        title: 'GMV $',
        useTrend: useGmvTrend,
        interpretAs: 'more-is-better',
    },
    [AiSalesAgentChart.AiSalesAgentGmvInfluenced]: {
        title: 'GMV Influenced %',
        useTrend: useGmvInfluecedTrend,
        interpretAs: 'more-is-better',
    },
    [AiSalesAgentChart.AiSalesAgentRoiRate]: {
        title: 'ROI Rate',
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
        useTimeSeries: TimeSeriesHook
    }
> = {
    [AiSalesAgentChart.AiSalesAgentGmvInfluencedOverTime]: {
        title: 'GMV Influenced Over Time',
        useTimeSeries: useGmvInfluenceOverTimeSeries,
    },
}
