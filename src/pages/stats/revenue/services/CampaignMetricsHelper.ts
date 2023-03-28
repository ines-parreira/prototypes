import _get from 'lodash/get'
import _reduce from 'lodash/reduce'
import _parseInt from 'lodash/parseInt'
import _mapValues from 'lodash/mapValues'
import _unzip from 'lodash/unzip'
import _values from 'lodash/values'
import _zip from 'lodash/zip'
import moment from 'moment'
import {
    CampaignGraphData,
    CampaignPerformanceData,
    CampaignsPerformanceDataset,
    CampaignStat,
    CampaignsTotals,
    RevenueGraphDataPoint,
    StatData,
    TicketPerformanceData,
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
import {
    COMPARISON_DATA_FORMAT,
    GRAPH_LABEL_DATE_FORMAT,
} from 'pages/stats/revenue/services/constants'

export const getDataFromResultSet = (resultSet: CubeResponse): CubeData => {
    return _get(resultSet, 'data', []) as CubeData
}

export const getDataFromStatResult = (result: Stat): StatData => {
    return _get(result, 'data.data', []) as StatData
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

export const transformToRevenueUpliftOverTime = (
    dataPoint: CubeMetric,
    granularityValue: TimeGranularity
): RevenueGraphDataPoint => {
    return _transformToGraphOverTime(
        dataPoint,
        OrderConversionMeasures.influencedRevenueUplift,
        `${OrderConversionDimensions.createdDatatime}.${granularityValue}`,
        GRAPH_LABEL_DATE_FORMAT
    )
}

export const transformToCampaignCTROverTime = (
    dataPoint: CubeMetric,
    granularityValue: TimeGranularity
): RevenueGraphDataPoint => {
    return _transformToGraphOverTime(
        dataPoint,
        CampaignOrderEventsMeasures.campaignCTR,
        `${CampaignOrderEventsDimensions.createdDatatime}.${granularityValue}`
    )
}

export const transformToCampaignConversionRateOverTime = (
    dataPoint: CubeMetric,
    granularityValue: TimeGranularity
): RevenueGraphDataPoint => {
    return _transformToGraphOverTime(
        dataPoint,
        CampaignOrderEventsMeasures.totalConversionRate,
        `${CampaignOrderEventsDimensions.createdDatatime}.${granularityValue}`
    )
}

const _transformToGraphOverTime = (
    dataPoint: CubeMetric,
    yColname: string,
    xDateColname: string,
    dateFormat: string = COMPARISON_DATA_FORMAT
): RevenueGraphDataPoint => {
    return {
        y: parseFloat(_get(dataPoint, yColname, '0')),
        x: moment(_get(dataPoint, xDateColname)).format(dateFormat),
    }
}

export const transformToChatConversionRateOverTime = (
    data: CampaignGraphData
): RevenueGraphDataPoint[] => {
    const combinedData = _zip(
        data.axes.x, // timestamps
        data.lines[0].data, // tickets created
        data.lines[1].data // tickets converted
    )

    return combinedData.map(([x, ticketsCreated, ticketsConverted]) => {
        const created = ticketsCreated === undefined ? 0 : ticketsCreated
        const converted = ticketsConverted === undefined ? 0 : ticketsConverted
        return {
            y: created > 0 ? (converted * 100) / created : 0,
            x:
                x === undefined
                    ? ''
                    : moment.unix(x).format(COMPARISON_DATA_FORMAT),
        }
    })
}

export const backfillGraphData = (
    data: RevenueGraphDataPoint[][],
    startDate: string,
    endDate: string
): RevenueGraphDataPoint[][] => {
    const allDates = _getDefaultsForAllDates(startDate, endDate, data.length)

    data.map((dataSet: RevenueGraphDataPoint[], i) => {
        dataSet.map((dataPoint: RevenueGraphDataPoint) => {
            // override default value in allDates with actual data
            if (dataPoint.x in allDates) {
                allDates[dataPoint.x][i] = {
                    x: allDates[dataPoint.x][i].x, // display-formatted date
                    y: dataPoint.y,
                }
            }
        })
    })

    return _unzip(_values(allDates))
}

const _getDefaultsForAllDates = (
    startDate: string,
    endDate: string,
    defaultsLength: number
): {[key: string]: RevenueGraphDataPoint[]} => {
    let start = moment(startDate)
    const end = moment(endDate)

    // allDates will contain `defaultsLength` long array
    const allDates = {} as {[key: string]: RevenueGraphDataPoint[]}
    while (start <= end) {
        allDates[start.format(COMPARISON_DATA_FORMAT)] = new Array(
            defaultsLength
        ).fill({
            x: start.format(GRAPH_LABEL_DATE_FORMAT),
            y: 0,
        })
        start = moment(start).add(1, 'days')
    }
    return allDates
}

export const transformToCampaignsPerformanceTable = (
    eventsData: CubeData,
    ordersData: CubeData,
    campaignsOrdersData: CubeData,
    ticketsData: TicketPerformanceData
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
