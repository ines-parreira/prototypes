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
    RevenueByDate,
    RevenueGraphDataPoint,
    StatData,
    StoreTotal,
    TicketPerformanceData,
} from 'pages/stats/revenue/services/types'
import {Stat} from 'models/stat/types'
import {CubeData, CubeMetric} from 'pages/stats/revenue/clients/types'
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
import {ReportingGranularity} from 'models/reporting/types'
import {getMetricValue} from 'pages/stats/revenue/services/utils'

export const getDataFromStatResult = (result: Stat): StatData => {
    return _get(result, 'data.data', []) as StatData
}

export const getMetricFromCubeData = (data: any): CubeMetric => {
    return _get(data, 'data.data[0]', {}) as CubeMetric
}

export const getDataFromResult = (data: any): CubeData => {
    return _get(data, 'data.data', []) as CubeData
}

const _getMetricOrDefault = (data: CubeMetric | undefined): CubeMetric => {
    return data || {}
}

const _getCubeDataOrDefault = (data: CubeData | undefined): CubeData => {
    return data || []
}

const _getStatDataOrDefault = (data: StatData | undefined): StatData => {
    return data || []
}

const _gmvUplift = (gmv: number, campaignSales: number): number => {
    const initialGMV = gmv - campaignSales

    return initialGMV > 0 ? (campaignSales / initialGMV) * 100 : 0
}

const _getGmvUpliftFromMetrics = (
    orderData: CubeMetric | undefined,
    totalData: CubeMetric | undefined
): number => {
    const orderMetric: CubeMetric = _getMetricOrDefault(orderData)
    const totalMetric: CubeMetric = _getMetricOrDefault(totalData)

    const campaignSales = getMetricValue(
        orderMetric,
        OrderConversionMeasure.campaignSales
    )
    const totalSales = getMetricValue(totalMetric, OrderConversionMeasure.gmv)

    return _toFixed(_gmvUplift(totalSales, campaignSales))
}

const _calculateTraffic = (
    trafficData: CubeData,
    startDate: string,
    endDate: string
): number => {
    const start = moment(startDate).startOf('day').valueOf()
    const end = moment(endDate).endOf('day').valueOf()

    return _sum(
        trafficData.map((metric) => {
            const dateTime = moment(
                _get(metric, EventsDimension.createdDatetime)
            ).valueOf()

            if (dateTime >= start && dateTime <= end) {
                return getMetricValue(
                    metric,
                    EventsMeasure.traffic,
                    '0',
                    parseInt
                )
            }
            return 0
        })
    )
}

export const transformToCampaignEventsTotals = (
    data: CubeMetric | undefined
): EventsTotals => {
    const metric: CubeMetric = _getMetricOrDefault(data)
    return {
        [CampaignsTotalsMetricNames.impressions]: formatNumber(
            getMetricValue(metric, CampaignOrderEventsMeasure.impressions)
        ),
        [CampaignsTotalsMetricNames.engagement]: formatNumber(
            getMetricValue(metric, CampaignOrderEventsMeasure.engagement)
        ),
    }
}

export const transformToCampaignOrdersTotals = (
    data: CubeMetric | undefined,
    currency: string
): OrdersTotals => {
    const metric: CubeMetric = _getMetricOrDefault(data)

    return {
        [CampaignsTotalsMetricNames.revenue]: formatCurrency(
            getMetricValue(metric, OrderConversionMeasure.campaignSales),
            currency
        ),
        [CampaignsTotalsMetricNames.campaignSalesCount]: formatNumber(
            getMetricValue(metric, OrderConversionMeasure.campaignSalesCount)
        ),
    }
}

export const transformToCampaignCalculatedTotals = (
    orderData: CubeMetric | undefined,
    totalData: CubeMetric | undefined
): CalculatedTotals => {
    const gmvUplift = _getGmvUpliftFromMetrics(orderData, totalData)

    return {
        [CampaignsTotalsMetricNames.influencedRevenueUplift]:
            formatPercentage(gmvUplift),
    }
}

export const transformToStoreTotal = (
    data: CubeMetric | undefined,
    currency: string
): StoreTotal => {
    const metric: CubeMetric = data || {}

    return {
        [CampaignsTotalsMetricNames.gmv]: formatCurrency(
            getMetricValue(metric, OrderConversionMeasure.gmv),
            currency
        ),
    }
}

export const transformToRevenueByDate = (
    data: CubeData | undefined
): RevenueByDate => {
    return _reduce(
        data || [],
        (acc, revenuePoint) => {
            const date = _get(
                revenuePoint,
                OrderConversionDimension.createdDatatime
            )
            if (date !== undefined) {
                acc[date] = getMetricValue(
                    revenuePoint,
                    OrderConversionMeasure.gmv
                )
            }
            return acc
        },
        {} as RevenueByDate
    )
}

export const transformToRevenueUpliftOverTime = (
    dataPoint: CubeMetric,
    revenueData: RevenueByDate,
    granularityValue: ReportingGranularity
): RevenueGraphDataPoint => {
    const createdDatetime = _get(
        dataPoint,
        OrderConversionDimension.createdDatatime
    )
    const totalSales = _get(revenueData, createdDatetime, 0)
    const campaignSales = getMetricValue(
        dataPoint,
        OrderConversionMeasure.campaignSales
    )

    const gmvUplift = _toFixed(_gmvUplift(totalSales, campaignSales))

    return _transformToGraphOverTime(
        {
            ...dataPoint,
            [OrderConversionMeasure.influencedRevenueUplift]:
                gmvUplift.toString(),
        },
        OrderConversionMeasure.influencedRevenueUplift,
        `${OrderConversionDimension.createdDatatime}.${granularityValue}`,
        GRAPH_LABEL_DATE_FORMAT
    )
}

export const transformToCampaignCTROverTime = (
    dataPoint: CubeMetric,
    granularityValue: ReportingGranularity
): RevenueGraphDataPoint => {
    return _transformToGraphOverTime(
        dataPoint,
        CampaignOrderEventsMeasure.campaignCTR,
        `${CampaignOrderEventsDimension.createdDatatime}.${granularityValue}`
    )
}

export const transformToCampaignConversionRateOverTime = (
    dataPoint: CubeMetric,
    granularityValue: ReportingGranularity
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
        y: getMetricValue(dataPoint, yColname),
        x: moment(_get(dataPoint, xDateColname)).format(dateFormat),
    }
}

export const transformToChatConversionRateOverTime = (
    data: CampaignGraphData | undefined
): RevenueGraphDataPoint[] => {
    if (data === undefined) return []

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
    eventsData: CubeData | undefined,
    ordersData: CubeData | undefined,
    campaignsOrdersData: CubeData | undefined,
    trafficData: CubeData | undefined,
    ticketsData: TicketPerformanceData | undefined
): CampaignsPerformanceDataset => {
    const eventsDataset = _reduce(
        _getCubeDataOrDefault(eventsData),
        _bind(
            _eventsPerformanceReducer,
            _bind.placeholder,
            _bind.placeholder,
            _bind.placeholder,
            _getCubeDataOrDefault(trafficData)
        ),
        {}
    )
    const ordersDataset = _reduce(
        _getCubeDataOrDefault(ordersData),
        _ordersPerformanceReducer,
        eventsDataset
    )
    const campaignsOrdersDataset = _reduce(
        _getCubeDataOrDefault(campaignsOrdersData),
        _campaignsOrdersPerformanceReducer,
        ordersDataset
    )
    const ticketsDataset = _reduce(
        _getStatDataOrDefault(ticketsData),
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
