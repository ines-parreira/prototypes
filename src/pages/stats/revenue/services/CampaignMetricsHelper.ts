import _get from 'lodash/get'
import _reduce from 'lodash/reduce'
import _mapValues from 'lodash/mapValues'
import _unzip from 'lodash/unzip'
import _values from 'lodash/values'
import _zip from 'lodash/zip'
import _pickBy from 'lodash/pickBy'
import _bind from 'lodash/bind'
import _sum from 'lodash/sum'
import moment from 'moment'

import {ensureNumberValue, formatPercentage} from 'pages/common/utils/numbers'
import {
    CalculatedTotals,
    CampaignGraphData,
    CampaignPerformanceData,
    CampaignsPerformanceDataset,
    CampaignStat,
    EventsTotals,
    OrdersTotals,
    RevenueGraphDataPoint,
    StatData,
    StoreTotal,
    TicketPerformanceData,
} from 'pages/stats/revenue/services/types'
import {Stat} from 'models/stat/types'
import {
    CubeData,
    CubeMetric,
    CubeResponse,
    TimeGranularity,
} from 'pages/stats/revenue/clients/types'
import {
    CampaignOrderEventsDimension,
    CampaignOrderEventsMeasure,
    EventsDimension,
    EventsMeasure,
    OrderConversionDimension,
    OrderConversionMeasure,
} from 'pages/stats/revenue/clients/constants'
import {
    CampaignsTotalsMetricNames,
    COMPARISON_DATA_FORMAT,
    GRAPH_LABEL_DATE_FORMAT,
} from 'pages/stats/revenue/services/constants'
import {formatCurrency, formatNumber} from 'pages/stats/common/utils'

export const getDataFromResultSet = (resultSet: CubeResponse): CubeData => {
    return _get(resultSet, 'data', []) as CubeData
}

export const getDataFromStatResult = (result: Stat): StatData => {
    return _get(result, 'data.data', []) as StatData
}

const _getMetricFromCubeData = (data: CubeData): CubeMetric => {
    return _get(data, '[0]', {}) as CubeMetric
}

const _gmvUplift = (gmv: number, campaignSales: number): number => {
    const initialGMV = gmv - campaignSales

    return initialGMV > 0 ? (campaignSales / initialGMV) * 100 : 0
}

const _calculateTraffic = (
    trafficData: CubeData,
    startDate: string,
    endDate: string
): number => {
    const start = moment(startDate)
    const end = moment(endDate)

    return _sum(
        trafficData.map((metric) => {
            const date = moment(
                _get(metric, EventsDimension.createdDatetime)
            ).date()
            if (date >= start.date() && date <= end.date()) {
                return parseInt(_get(metric, EventsMeasure.traffic, '0'))
            }
            return 0
        })
    )
}

export const transformToCampaignEventsTotals = (
    data: CubeData
): EventsTotals => {
    const metric: CubeMetric = _getMetricFromCubeData(data)
    return {
        [CampaignsTotalsMetricNames.impressions]: formatNumber(
            parseFloat(
                _get(metric, CampaignOrderEventsMeasure.impressions, '0')
            )
        ),
        [CampaignsTotalsMetricNames.engagement]: formatNumber(
            parseFloat(_get(metric, CampaignOrderEventsMeasure.engagement, '0'))
        ),
    }
}

export const transformToCampaignOrdersTotals = (
    data: CubeData,
    currency: string
): OrdersTotals => {
    const metric: CubeMetric = _getMetricFromCubeData(data)

    return {
        [CampaignsTotalsMetricNames.revenue]: formatCurrency(
            parseFloat(_get(metric, OrderConversionMeasure.campaignSales, '0')),
            currency
        ),
        [CampaignsTotalsMetricNames.campaignSalesCount]: formatNumber(
            parseFloat(
                _get(metric, OrderConversionMeasure.campaignSalesCount, '0')
            )
        ),
    }
}

export const transformToCampaignCalculatedTotals = (
    orderData: CubeData,
    totalData: CubeData
): CalculatedTotals => {
    const orderMetric: CubeMetric = _getMetricFromCubeData(orderData)
    const totalMetric: CubeMetric = _getMetricFromCubeData(totalData)

    const campaignSales = parseFloat(
        _get(orderMetric, OrderConversionMeasure.campaignSales, '0')
    )
    const totalSales = parseFloat(
        _get(totalMetric, OrderConversionMeasure.gmv, '0')
    )

    return {
        [CampaignsTotalsMetricNames.influencedRevenueUplift]: formatPercentage(
            _toFixed(_gmvUplift(totalSales, campaignSales))
        ),
    }
}

export const transformToStoreTotal = (
    data: CubeData,
    currency: string
): StoreTotal => {
    const metric: CubeMetric = _getMetricFromCubeData(data)

    return {
        [CampaignsTotalsMetricNames.gmv]: formatCurrency(
            parseFloat(_get(metric, OrderConversionMeasure.gmv, '0')),
            currency
        ),
    }
}

export const transformToRevenueUpliftOverTime = (
    dataPoint: CubeMetric,
    granularityValue: TimeGranularity
): RevenueGraphDataPoint => {
    return _transformToGraphOverTime(
        dataPoint,
        OrderConversionMeasure.influencedRevenueUplift,
        `${OrderConversionDimension.createdDatatime}.${granularityValue}`,
        GRAPH_LABEL_DATE_FORMAT
    )
}

export const transformToCampaignCTROverTime = (
    dataPoint: CubeMetric,
    granularityValue: TimeGranularity
): RevenueGraphDataPoint => {
    return _transformToGraphOverTime(
        dataPoint,
        CampaignOrderEventsMeasure.campaignCTR,
        `${CampaignOrderEventsDimension.createdDatatime}.${granularityValue}`
    )
}

export const transformToCampaignConversionRateOverTime = (
    dataPoint: CubeMetric,
    granularityValue: TimeGranularity
): RevenueGraphDataPoint => {
    return _transformToGraphOverTime(
        dataPoint,
        CampaignOrderEventsMeasure.totalConversionRate,
        `${CampaignOrderEventsDimension.createdDatatime}.${granularityValue}`
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
    trafficData: CubeData,
    ticketsData: TicketPerformanceData
): CampaignsPerformanceDataset => {
    const eventsDataset = _reduce(
        eventsData,
        _bind(
            _eventsPerformanceReducer,
            _bind.placeholder,
            _bind.placeholder,
            _bind.placeholder,
            trafficData
        ),
        {}
    )
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
    metric: CubeMetric,
    trafficData: CubeData
): CampaignsPerformanceDataset => {
    const campaignId = _get(metric, EventsDimension.campaignId)
    const eventMetricValue = _mapValues(
        {
            traffic: _calculateTraffic(
                trafficData,
                _get(metric, EventsMeasure.firstCampaignDisplay),
                _get(metric, EventsMeasure.lastCampaignDisplay)
            ),
            impressions: _get(metric, EventsMeasure.impressions),
            clicks: _get(metric, EventsMeasure.clicks),
            clicksRate: _get(metric, EventsMeasure.clicksRate),
        },
        ensureNumberValue
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
    const campaignId = _get(metric, OrderConversionDimension.campaignId)

    const orderMetricValue = _mapValues(
        {
            totalRevenue: _get(metric, OrderConversionMeasure.campaignSales),
            ticketsConverted: _get(
                metric,
                OrderConversionMeasure.ticketSalesCount
            ),
            ticketsRevenue: _get(metric, OrderConversionMeasure.ticketSales),
            clicksRevenue: _get(metric, OrderConversionMeasure.clickSales),
            clicksConverted: _get(
                metric,
                OrderConversionMeasure.clickSalesCount
            ),
            discountCodesUsed: _get(
                metric,
                OrderConversionMeasure.discountSalesCount
            ),
            discountCodesRevenue: _get(
                metric,
                OrderConversionMeasure.discountSales
            ),
            campaignSalesCount: _get(
                metric,
                OrderConversionMeasure.campaignSalesCount
            ),
        },
        ensureNumberValue
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
    const campaignId = _get(metric, CampaignOrderEventsDimension.campaignId)
    const campaignOrderMetricValue = _mapValues(
        {
            engagement: _get(metric, CampaignOrderEventsMeasure.engagement),
        },
        ensureNumberValue
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
        traffic: 0,
        impressions: 0,
        engagement: 0,
        clickThroughRate: 0,
        campaignSalesCount: 0,
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

    return {
        ...defaultValues,
        ..._pickBy(
            campaign,
            (value) => value !== undefined && value !== null && !isNaN(value)
        ),
    }
}

const _computeCompoundMetrics = (
    campaign: CampaignPerformanceData
): CampaignPerformanceData => {
    const impressions = _get(campaign, 'impressions') || 0
    const clicks = _get(campaign, 'clicks') || 0
    const clicksConverted = _get(campaign, 'clicksConverted') || 0

    const ticketsCreated = _get(campaign, 'ticketsCreated') || 0
    const ticketsConverted = _get(campaign, 'ticketsConverted') || 0

    const orders = _get(campaign, 'campaignSalesCount') || 0
    const engagement = _get(campaign, 'engagement') || 0

    const clicksConversionRate = clicks ? clicksConverted / clicks : 0
    const ticketsCreationRate = impressions ? ticketsCreated / impressions : 0
    const ticketsConversionRate = ticketsCreated
        ? ticketsConverted / ticketsCreated
        : 0

    const totalEngagement = engagement + ticketsCreated
    const clickThroughRate = impressions ? totalEngagement / impressions : 0
    const totalConversionRate = totalEngagement ? orders / totalEngagement : 0

    return {
        ...campaign,
        clicksConversionRate: clicksConversionRate * 100,
        ticketsCreationRate: ticketsCreationRate * 100,
        ticketsConversionRate: ticketsConversionRate * 100,
        engagement: totalEngagement,
        clickThroughRate: clickThroughRate * 100,
        totalConversionRate: totalConversionRate * 100,
    }
}

const _toFixed = (value: number, precision = 2): number => {
    return Number(value.toFixed(precision))
}
