import _get from 'lodash/get'
import _reduce from 'lodash/reduce'
import _parseInt from 'lodash/parseInt'
import _mapValues from 'lodash/mapValues'
import _unzip from 'lodash/unzip'
import _values from 'lodash/values'
import _zip from 'lodash/zip'
import _pickBy from 'lodash/pickBy'
import moment from 'moment'
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
    CampaignOrderEventsDimensions,
    CampaignOrderEventsMeasures,
    EventsDimensions,
    EventsMeasures,
    OrderConversionDimensions,
    OrderConversionMeasures,
} from 'pages/stats/revenue/clients/constants'
import {
    CampaignsTotalsMetricNames,
    COMPARISON_DATA_FORMAT,
    GRAPH_LABEL_DATE_FORMAT,
} from 'pages/stats/revenue/services/constants'
import {
    formatCurrency,
    formatNumber,
    formatPercent,
} from 'pages/stats/common/utils'

export const getDataFromResultSet = (resultSet: CubeResponse): CubeData => {
    return _get(resultSet, 'data', []) as CubeData
}

export const getDataFromStatResult = (result: Stat): StatData => {
    return _get(result, 'data.data', []) as StatData
}

const _getMetricFromCubeData = (data: CubeData): CubeMetric => {
    return _get(data, '[0]', {}) as CubeMetric
}

const _enrichCubeData = (data: CubeData, metrics: CubeMetric): CubeData => {
    return data.map((row) => ({...row, ...metrics}))
}

const _gmvUplift = (gmv: number, campaignSales: number): number => {
    const initialGMV = gmv - campaignSales

    return initialGMV > 0 ? (campaignSales / initialGMV) * 100 : 0
}

export const transformToCampaignEventsTotals = (
    data: CubeData
): EventsTotals => {
    const metric: CubeMetric = _getMetricFromCubeData(data)
    return {
        [CampaignsTotalsMetricNames.impressions]: formatNumber(
            parseFloat(
                _get(metric, CampaignOrderEventsMeasures.impressions, '0')
            )
        ),
        [CampaignsTotalsMetricNames.engagement]: formatNumber(
            parseFloat(
                _get(metric, CampaignOrderEventsMeasures.engagement, '0')
            )
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
            parseFloat(
                _get(metric, OrderConversionMeasures.campaignSales, '0')
            ),
            currency
        ),
        [CampaignsTotalsMetricNames.campaignSalesCount]: formatNumber(
            parseFloat(
                _get(metric, OrderConversionMeasures.campaignSalesCount, '0')
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
        _get(orderMetric, OrderConversionMeasures.campaignSales, '0')
    )
    const totalSales = parseFloat(
        _get(totalMetric, OrderConversionMeasures.gmv, '0')
    )

    return {
        [CampaignsTotalsMetricNames.influencedRevenueUplift]: formatPercent(
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
            parseFloat(_get(metric, OrderConversionMeasures.gmv, '0')),
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
    storeTotalData: CubeData,
    ticketsData: TicketPerformanceData
): CampaignsPerformanceDataset => {
    const eventsDataset = _reduce(eventsData, _eventsPerformanceReducer, {})
    const ordersDataset = _reduce(
        _enrichCubeData(ordersData, _getMetricFromCubeData(storeTotalData)),
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
    const campaignSales = _parseInt(
        _get(metric, OrderConversionMeasures.campaignSales, '0')
    )
    const gmv = _parseInt(_get(metric, OrderConversionMeasures.gmv, '0'))

    const orderMetricValue = _mapValues(
        {
            totalRevenue: _get(metric, OrderConversionMeasures.campaignSales),
            revenueUplift: _gmvUplift(gmv, campaignSales),
            ticketsConverted: _get(
                metric,
                OrderConversionMeasures.ticketSalesCount
            ),
            ticketsRevenue: _get(metric, OrderConversionMeasures.ticketSales),
            clicksRevenue: _get(metric, OrderConversionMeasures.clickSales),
            clicksConverted: _get(
                metric,
                OrderConversionMeasures.clickSalesCount
            ),
            discountCodesUsed: _get(
                metric,
                OrderConversionMeasures.discountSalesCount
            ),
            discountCodesRevenue: _get(
                metric,
                OrderConversionMeasures.discountSales
            ),
            campaignSalesCount: _get(
                metric,
                OrderConversionMeasures.campaignSalesCount
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
            totalConversionRate: _get(
                metric,
                CampaignOrderEventsMeasures.totalConversionRate
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

    const clicksConversionRate = clicks ? clicksConverted / clicks : 0
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
