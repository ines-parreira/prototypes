import _get from 'lodash/get'
import _reduce from 'lodash/reduce'
import _parseInt from 'lodash/parseInt'
import _mapValues from 'lodash/mapValues'
import {
    CampaignPerformanceData,
    CampaignsPerformanceDataset,
    CampaignStat,
    CampaignStatData,
    CampaignsTotals,
    GMVGraphDataPoint,
} from 'pages/stats/revenue/services/types'
import {Stat, StatType} from 'models/stat/types'
import {
    CubeData,
    CubeMetric,
    CubeResponse,
    TimeGranularity,
} from 'pages/stats/revenue/clients/types'
import {
    CampaignOrderEventsDimensions,
    CampaignOrderEventsMeasures,
    EventsDimensions,
    EventsMeasures,
    OrderConversionDimensions,
    OrderConversionMeasures,
} from 'pages/stats/revenue/clients/constants'

export const getDataFromResultSet = (resultSet: CubeResponse): CubeData => {
    return _get(resultSet, 'data', []) as CubeData
}

export const getDataFromStatResult = (result: Stat): CampaignStatData => {
    return _get(result, 'data.data', []) as CampaignStatData
}

export const transformToCampaignEventsTotals = (
    data: CubeData
): CampaignsTotals => {
    const metric: CubeMetric = _get(data, '[0]', {})
    return [
        {
            name: 'impressions',
            value: _get(metric, CampaignOrderEventsMeasures.impressions, '0'),
            type: StatType.Number,
        },
        {
            name: 'engagement',
            value: _get(metric, CampaignOrderEventsMeasures.engagement, '0'),
            type: StatType.Number,
        },
        {
            name: 'uniqueConversions',
            value: _get(
                metric,
                CampaignOrderEventsMeasures.uniqueConversions,
                '0'
            ),
            type: StatType.Number,
        },
    ]
}

export const transformToCampaignOrdersTotals = (
    data: CubeData,
    currency: string
): CampaignsTotals => {
    const metric: CubeMetric = _get(data, '[0]', {})
    return [
        {
            name: 'gmv',
            value: parseFloat(_get(metric, OrderConversionMeasures.gmv, '0')),
            type: StatType.Currency,
            currency: currency,
        },
        {
            name: 'influencedRevenueUplift',
            value: _toFixed(
                parseFloat(
                    _get(
                        metric,
                        OrderConversionMeasures.influencedRevenueUplift,
                        '0'
                    )
                )
            ),
            type: StatType.Percent,
        },
        {
            name: 'revenue',
            value: parseFloat(
                _get(metric, OrderConversionMeasures.campaignSales, '0')
            ),
            type: StatType.Currency,
            currency: currency,
        },
    ]
}

export const transformToGMVUpliftOverTime = (
    dataPoint: CubeMetric,
    granularityValue: TimeGranularity
): GMVGraphDataPoint => {
    return {
        influencedRevenueUplift: _get(
            dataPoint,
            OrderConversionMeasures.influencedRevenueUplift
        ),
        createdDatetime: _get(
            dataPoint,
            OrderConversionDimensions.createdDatatime
        ),
        granularityUnit: granularityValue,
        granularityValue: _get(
            dataPoint,
            `${OrderConversionDimensions.createdDatatime}.${granularityValue}`
        ),
    }
}

export const transformToCampaignsPerformanceTable = (
    eventsData: CubeData,
    ordersData: CubeData,
    campaignsOrdersData: CubeData,
    ticketsData: CampaignStatData
): CampaignsPerformanceDataset => {
    const eventsDataset = _reduce(eventsData, _eventsPerformanceReducer, {})
    const ordersDataset = _reduce(
        ordersData,
        _ordersPerformanceReducer,
        eventsDataset
    )
    const campaignsOrdersDataset = _reduce(
        campaignsOrdersData,
        _campaignsOrdersPerformanceReducer,
        ordersDataset
    )
    const ticketsDataset = _reduce(
        ticketsData,
        _ticketsPerformanceReducer,
        campaignsOrdersDataset
    )

    return _mapValues({...ticketsDataset}, _processCampaignsPerformanceData)
}

const _eventsPerformanceReducer = (
    dataset: CampaignsPerformanceDataset,
    metric: CubeMetric
): CampaignsPerformanceDataset => {
    const campaignId = _get(metric, EventsDimensions.campaignId)
    const eventMetricValue = _mapValues(
        {
            traffic: _get(metric, EventsMeasures.traffic),
            impressions: _get(metric, EventsMeasures.impressions),
            uniqueImpressions: _get(metric, EventsMeasures.uniqueImpressions),
            clicks: _get(metric, EventsMeasures.clicks),
            clicksRate: _get(metric, EventsMeasures.clicksRate),
        },
        _parseInt
    )

    const value = {
        ..._get(dataset, campaignId, {}),
        ...eventMetricValue,
    }

    return {...dataset, [campaignId]: value} as CampaignsPerformanceDataset
}

const _ordersPerformanceReducer = (
    dataset: CampaignsPerformanceDataset,
    metric: CubeMetric
): CampaignsPerformanceDataset => {
    const campaignId = _get(metric, OrderConversionDimensions.campaignId)
    const orderMetricValue = _mapValues(
        {
            totalRevenue: _get(metric, OrderConversionMeasures.gmv),
            revenueUplift: _get(
                metric,
                OrderConversionMeasures.influencedRevenueUplift
            ),
            ticketsConverted: _get(
                metric,
                OrderConversionMeasures.ticketSalesCount
            ),
            ticketsRevenue: _get(metric, OrderConversionMeasures.ticketSales),
            clicksRevenue: _get(metric, OrderConversionMeasures.clickSales),
            discountCodeUsed: _get(
                metric,
                OrderConversionMeasures.discountSalesCount
            ),
            discountCodeRevenue: _get(
                metric,
                OrderConversionMeasures.discountSales
            ),
        },
        _parseInt
    )

    const value = {
        ..._get(dataset, campaignId, {}),
        ...orderMetricValue,
    }

    return {...dataset, [campaignId]: value} as CampaignsPerformanceDataset
}

const _campaignsOrdersPerformanceReducer = (
    dataset: CampaignsPerformanceDataset,
    metric: CubeMetric
): CampaignsPerformanceDataset => {
    const campaignId = _get(metric, CampaignOrderEventsDimensions.campaignId)
    const campaignOrderMetricValue = _mapValues(
        {
            engagement: _get(metric, CampaignOrderEventsMeasures.engagement),
            clickThroughRate: _get(
                metric,
                CampaignOrderEventsMeasures.campaignCTR
            ),
            uniqueConversions: _get(
                metric,
                CampaignOrderEventsMeasures.uniqueConversions
            ),
            totalConversionRate: _get(
                metric,
                CampaignOrderEventsMeasures.totalConversionRate
            ),
            clicksConverted: _get(
                metric,
                CampaignOrderEventsMeasures.uniqueCampaignClicksConverted
            ),
        },
        _parseInt
    )

    const value = {
        ..._get(dataset, campaignId, {}),
        ...campaignOrderMetricValue,
    }

    return {...dataset, [campaignId]: value} as CampaignsPerformanceDataset
}

const _ticketsPerformanceReducer = (
    dataset: CampaignsPerformanceDataset,
    ticketData: CampaignStat
) => {
    if (!ticketData || ticketData.length !== 2) return dataset

    const campaignId = ticketData[0]
    const ticketsCreated = ticketData[1]

    const value = {
        ..._get(dataset, campaignId, {}),
        ticketsCreated: ticketsCreated,
    }

    return {...dataset, [campaignId]: value}
}

const _processCampaignsPerformanceData = (
    campaign: CampaignPerformanceData
): CampaignPerformanceData => {
    return _computeCompoundMetrics(_addDefaultValues(campaign))
}

const _addDefaultValues = (
    campaign: CampaignPerformanceData
): CampaignPerformanceData => {
    const defaultValues = {
        totalRevenue: 0,
        revenueUplift: 0,
        traffic: 0,
        impressions: 0,
        uniqueImpressions: 0,
        engagement: 0,
        clickThroughRate: 0,
        uniqueConversions: 0,
        totalConversionRate: 0,
        ticketsCreated: 0,
        ticketsCreationRate: 0,
        ticketsConverted: 0,
        ticketsConversionRate: 0,
        ticketsRevenue: 0,
        clicks: 0,
        clicksRate: 0,
        clicksConverted: 0,
        clicksConversionRate: 0,
        clicksRevenue: 0,
        discountCodesUsed: 0,
        discountCodesRevenue: 0,
    }

    return {...defaultValues, ...campaign}
}

const _computeCompoundMetrics = (
    campaign: CampaignPerformanceData
): CampaignPerformanceData => {
    const impressions = _get(campaign, 'impressions') || 0
    const clicks = _get(campaign, 'clicks') || 0
    const clicksConverted = _get(campaign, 'clicksConverted') || 0

    const ticketsCreated = _get(campaign, 'ticketsCreated') || 0
    const ticketsConverted = _get(campaign, 'ticketsConverted') || 0

    const clicksConversionRate = clicksConverted ? clicksConverted / clicks : 0
    const ticketsCreationRate = impressions ? ticketsCreated / impressions : 0
    const ticketsConversionRate = ticketsCreated
        ? ticketsConverted / ticketsCreated
        : 0

    return {
        ...campaign,
        clicksConversionRate: clicksConversionRate * 100,
        ticketsCreationRate: ticketsCreationRate * 100,
        ticketsConversionRate: ticketsConversionRate * 100,
    }
}

const _toFixed = (value: number, precision = 2): number => {
    return Number(value.toFixed(precision))
}
