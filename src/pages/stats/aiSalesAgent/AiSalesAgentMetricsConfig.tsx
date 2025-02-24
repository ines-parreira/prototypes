import {MetricTrendHook} from 'hooks/reporting/useMetricTrend'

import useGmvInfluecedTrend from 'pages/stats/aiSalesAgent/metrics/useGmvInfluecedTrend'
import useGmvTrend from 'pages/stats/aiSalesAgent/metrics/useGmvTrend'
import useRoiRateTrend from 'pages/stats/aiSalesAgent/metrics/useRoiRateTrend'
import useTotalAIConvTrend from 'pages/stats/aiSalesAgent/metrics/useTotalAIConvTrend'

export enum AiSalesAgentChart {
    AiSalesAgentTotalSalesConv = 'aiSalesTotalSalesConv',
    AiSalesAgentGmv = 'aiSalesGmv',
    AiSalesAgentGmvInfluenced = 'aiSalesGmvInfluenced',
    AiSalesAgentRoiRate = 'aiSalesRoiRate',
}

export const AiSalesAgentMetricConfig: Record<
    AiSalesAgentChart,
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
