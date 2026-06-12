import _bind from 'lodash/bind'
import _divide from 'lodash/divide'
import _get from 'lodash/get'
import _mapValues from 'lodash/mapValues'
import _pickBy from 'lodash/pickBy'
import _reduce from 'lodash/reduce'
import _unzip from 'lodash/unzip'
import _values from 'lodash/values'
import _zip from 'lodash/zip'
import moment from 'moment'

import { getMomentGranularityFromReportingGranularity } from 'domains/reporting/hooks/helpers'
import type {
    AggregationWindow,
    Stat,
} from 'domains/reporting/models/stat/types'
import { ReportingGranularity } from 'domains/reporting/models/types'
import {
    formatCurrency,
    formatNumber,
} from 'domains/reporting/pages/common/utils'
import {
    CampaignOrderEventsDimension,
    CampaignOrderEventsMeasure,
    Cube,
    EventsMeasure,
    OrderConversionDimension,
    OrderConversionMeasure,
} from 'domains/reporting/pages/convert/clients/constants'
import type {
    CubeData,
    CubeMetric,
    GroupDimension,
} from 'domains/reporting/pages/convert/clients/types'
import {
    AbTestMetricNames,
    CampaignsTotalsMetricNames,
    COMPARISON_DATA_FORMAT,
    GRAPH_LABEL_DATE_FORMAT,
} from 'domains/reporting/pages/convert/services/constants'
import type {
    CalculatedTotals,
    CampaignGraphData,
    CampaignPerformanceData,
    CampaignsPerformanceDataset,
    EventsTotals,
    OrdersTotals,
    RevenueByDate,
    RevenueGraphDataPoint,
    StatData,
    StoreTotal,
} from 'domains/reporting/pages/convert/services/types'
import { getMetricValue } from 'domains/reporting/pages/convert/services/utils'
import { ensureNumberValue, formatPercentage } from 'pages/common/utils/numbers'

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

const _influencedGmvShare = (gmv: number, campaignSales: number): number => {
    return gmv > 0 ? (campaignSales / gmv) * 100 : 0
}

const _getInfluencedGmvShareFromMetrics = (
    orderData: CubeMetric | undefined,
    totalData: CubeMetric | undefined,
): number => {
    const orderMetric: CubeMetric = _getMetricOrDefault(orderData)
    const totalMetric: CubeMetric = _getMetricOrDefault(totalData)

    const campaignSales = getMetricValue(
        orderMetric,
        OrderConversionMeasure.campaignSales,
    )
    const totalSales = getMetricValue(totalMetric, OrderConversionMeasure.gmv)

    return _toFixed(_influencedGmvShare(totalSales, campaignSales))
}

export const transformToCampaignEventsTotals = (
    data: CubeMetric | undefined,
): EventsTotals => {
    const metric: CubeMetric = _getMetricOrDefault(data)

    return {
        [CampaignsTotalsMetricNames.impressions]: formatNumber(
            getMetricValue(metric, CampaignOrderEventsMeasure.impressions),
        ),
        [CampaignsTotalsMetricNames.engagement]: formatNumber(
            getMetricValue(metric, CampaignOrderEventsMeasure.engagement),
        ),
    }
}

export const transformToCampaignOrdersTotals = (
    data: CubeMetric | undefined,
    currency: string,
): OrdersTotals => {
    const metric: CubeMetric = _getMetricOrDefault(data)

    return {
        [CampaignsTotalsMetricNames.revenue]: formatCurrency(
            getMetricValue(metric, OrderConversionMeasure.campaignSales),
            currency,
        ),
        [CampaignsTotalsMetricNames.campaignSalesCount]: formatNumber(
            getMetricValue(metric, OrderConversionMeasure.campaignSalesCount),
        ),
    }
}

export const transformToCampaignCalculatedTotals = (
    orderData: CubeMetric | undefined,
    totalData: CubeMetric | undefined,
): CalculatedTotals => {
    const influencedGmvShare = _getInfluencedGmvShareFromMetrics(
        orderData,
        totalData,
    )

    return {
        [CampaignsTotalsMetricNames.influencedRevenueShare]:
            formatPercentage(influencedGmvShare),
    }
}

export const transformToStoreTotal = (
    data: CubeMetric | undefined,
    currency: string,
): StoreTotal => {
    const metric: CubeMetric = data || {}

    return {
        [CampaignsTotalsMetricNames.gmv]: formatCurrency(
            getMetricValue(metric, OrderConversionMeasure.gmv),
            currency,
        ),
    }
}

export const transformToRevenueByDate = (
    data: CubeData | undefined,
): RevenueByDate => {
    return _reduce(
        data || [],
        (acc, revenuePoint) => {
            const date = _get(
                revenuePoint,
                OrderConversionDimension.createdDatatime,
            )
            if (date !== undefined) {
                acc[date] = getMetricValue(
                    revenuePoint,
                    OrderConversionMeasure.gmv,
                )
            }
            return acc
        },
        {} as RevenueByDate,
    )
}

export const transformToRevenueShareOverTime = (
    dataPoint: CubeMetric,
    revenueData: RevenueByDate,
    granularityValue: ReportingGranularity,
): RevenueGraphDataPoint => {
    const createdDatetime = _get(
        dataPoint,
        OrderConversionDimension.createdDatatime,
    )
    const totalSales = _get(revenueData, createdDatetime, 0)
    const campaignSales = getMetricValue(
        dataPoint,
        OrderConversionMeasure.campaignSales,
    )

    const influencedGmvShare = _toFixed(
        _influencedGmvShare(totalSales, campaignSales),
    )

    return _transformToGraphOverTime(
        {
            ...dataPoint,
            [CampaignsTotalsMetricNames.influencedRevenueShare]:
                influencedGmvShare.toString(),
        },
        CampaignsTotalsMetricNames.influencedRevenueShare,
        `${OrderConversionDimension.createdDatatime}.${granularityValue}`,
        GRAPH_LABEL_DATE_FORMAT,
    )
}

export const transformToCampaignRevenueOverTime = (
    dataPoint: CubeMetric,
    granularityValue: ReportingGranularity,
): RevenueGraphDataPoint => {
    return _transformToGraphOverTime(
        dataPoint,
        OrderConversionMeasure.campaignSales,
        `${OrderConversionDimension.createdDatatime}.${granularityValue}`,
    )
}

export const transformToCampaignCTROverTime = (
    dataPoint: CubeMetric,
    granularityValue: ReportingGranularity,
): RevenueGraphDataPoint => {
    return _transformToGraphOverTime(
        dataPoint,
        CampaignOrderEventsMeasure.campaignCTR,
        `${CampaignOrderEventsDimension.createdDatatime}.${granularityValue}`,
    )
}

export const transformToCampaignConversionRateOverTime = (
    dataPoint: CubeMetric,
    granularityValue: ReportingGranularity,
): RevenueGraphDataPoint => {
    return _transformToGraphOverTime(
        dataPoint,
        CampaignOrderEventsMeasure.totalConversionRate,
        `${CampaignOrderEventsDimension.createdDatatime}.${granularityValue}`,
    )
}

const _transformToGraphOverTime = (
    dataPoint: CubeMetric,
    yColname: string,
    xDateColname: string,
    dateFormat: string = COMPARISON_DATA_FORMAT,
): RevenueGraphDataPoint => {
    return {
        y: getMetricValue(dataPoint, yColname),
        x: moment(_get(dataPoint, xDateColname)).format(dateFormat),
    }
}

export const transformToChatConversionRateOverTime = (
    data: CampaignGraphData | undefined,
): RevenueGraphDataPoint[] => {
    if (data === undefined) return []

    const combinedData = _zip(
        data.axes.x, // timestamps
        data.lines[0].data, // tickets created
        data.lines[1].data, // tickets converted
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

export const backFillGraphData = (
    data: RevenueGraphDataPoint[][],
    startDate: string,
    endDate: string,
    granularity: AggregationWindow = ReportingGranularity.Day,
): RevenueGraphDataPoint[][] => {
    const allDates = _getDefaultsForAllDates(
        startDate,
        endDate,
        granularity,
        data.length,
    )
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
    granularity: AggregationWindow,
    defaultsLength: number,
): { [key: string]: RevenueGraphDataPoint[] } => {
    let start = moment(startDate)
    const end = moment(endDate)

    const momentGranularity =
        getMomentGranularityFromReportingGranularity(granularity)

    const allDates = {} as { [key: string]: RevenueGraphDataPoint[] }
    while (start <= end) {
        allDates[
            start.startOf(momentGranularity).format(COMPARISON_DATA_FORMAT)
        ] = Array.from({ length: defaultsLength }, () => ({
            x: start.startOf(momentGranularity).format(GRAPH_LABEL_DATE_FORMAT),
            y: 0,
        }))
        start = moment(start).add(1, granularity)
    }
    return allDates
}

export const transformToCampaignsPerformanceTable = (
    groupDimension: GroupDimension,
    eventsData: CubeData | undefined,
    ordersData: CubeData | undefined,
    campaignsOrdersData: CubeData | undefined,
    storeTotal: CubeMetric | undefined,
): CampaignsPerformanceDataset => {
    const eventsDataset = _reduce(
        eventsData,
        _bind(
            _eventsPerformanceReducer,
            _bind.placeholder,
            _bind.placeholder,
            _bind.placeholder,
            groupDimension,
        ),
        {},
    )

    const ordersDataset = _reduce(
        _getCubeDataOrDefault(ordersData),
        _bind(
            _ordersPerformanceReducer,
            _bind.placeholder,
            _bind.placeholder,
            _bind.placeholder,
            _getMetricOrDefault(storeTotal),
            groupDimension,
        ),
        eventsDataset,
    )
    const campaignsOrdersDataset = _reduce(
        _getCubeDataOrDefault(campaignsOrdersData),
        _bind(
            _campaignsOrdersPerformanceReducer,
            _bind.placeholder,
            _bind.placeholder,
            _bind.placeholder,
            groupDimension,
        ),
        ordersDataset,
    )

    return _mapValues(
        { ...campaignsOrdersDataset } as CampaignsPerformanceDataset,
        _processCampaignsPerformanceData,
    )
}

export const transformToCampaignAbTestEvent = (
    data: CubeMetric | undefined,
) => {
    const metric: CubeMetric = _getMetricOrDefault(data)

    return {
        [AbTestMetricNames.orderCount]: getMetricValue(
            metric,
            CampaignOrderEventsMeasure.orderCount,
        ),
        [AbTestMetricNames.firstImpression]: _get(
            metric,
            CampaignOrderEventsMeasure.firstCampaignDisplay,
        ),
    }
}

const _eventsPerformanceReducer = (
    dataset: CampaignsPerformanceDataset,
    metric: CubeMetric,
    groupDimension: GroupDimension,
): CampaignsPerformanceDataset => {
    const groupId = _get(metric, `${Cube.events}.${groupDimension}`)
    const eventMetricValue = _mapValues(
        {
            impressions: _get(metric, EventsMeasure.impressions),
            clicks: _get(metric, EventsMeasure.clicks),
            clicksRate: _get(metric, EventsMeasure.clicksRate),
            ticketsCreated: _get(metric, EventsMeasure.ticketsCreated),
        },
        ensureNumberValue,
    )

    const value = {
        ..._get(dataset, groupId, {}),
        ...eventMetricValue,
    }

    return { ...dataset, [groupId]: value } as CampaignsPerformanceDataset
}

const _ordersPerformanceReducer = (
    dataset: CampaignsPerformanceDataset,
    metric: CubeMetric,
    storeTotalMetric: CubeMetric,
    groupDimension: GroupDimension,
): CampaignsPerformanceDataset => {
    const groupId = _get(metric, `${Cube.orderConversion}.${groupDimension}`)

    const totalRevenue = _get(metric, OrderConversionMeasure.campaignSales)
    const totalStoreRevenue = _get(storeTotalMetric, OrderConversionMeasure.gmv)

    const totalRevenueShare = _divide(
        parseFloat(totalRevenue),
        parseFloat(totalStoreRevenue),
    )

    const orderMetricValue = _mapValues(
        {
            totalRevenue: totalRevenue,
            totalRevenueShare: totalRevenueShare * 100,
            ticketsConverted: _get(
                metric,
                OrderConversionMeasure.ticketSalesCount,
            ),
            ticketsRevenue: _get(metric, OrderConversionMeasure.ticketSales),
            clicksRevenue: _get(metric, OrderConversionMeasure.clickSales),
            clicksConverted: _get(
                metric,
                OrderConversionMeasure.clickSalesCount,
            ),
            discountCodesUsed: _get(
                metric,
                OrderConversionMeasure.discountSalesCount,
            ),
            discountCodesRevenue: _get(
                metric,
                OrderConversionMeasure.discountSales,
            ),
            campaignSalesCount: _get(
                metric,
                OrderConversionMeasure.campaignSalesCount,
            ),
        },
        ensureNumberValue,
    )

    const value = {
        ..._get(dataset, groupId, {}),
        ...orderMetricValue,
    }

    return { ...dataset, [groupId]: value } as CampaignsPerformanceDataset
}

const _campaignsOrdersPerformanceReducer = (
    dataset: CampaignsPerformanceDataset,
    metric: CubeMetric,
    groupDimension: GroupDimension,
): CampaignsPerformanceDataset => {
    const groupId = _get(
        metric,
        `${Cube.campaignOrderEvents}.${groupDimension}`,
    )
    const campaignOrderMetricValue = _mapValues(
        {
            engagement: _get(metric, CampaignOrderEventsMeasure.engagement),
            totalConversionRate: _get(
                metric,
                CampaignOrderEventsMeasure.totalConversionRate,
            ),
            clickThroughRate: _get(
                metric,
                CampaignOrderEventsMeasure.campaignCTR,
            ),
        },
        ensureNumberValue,
    )

    const value = {
        ..._get(dataset, groupId, {}),
        ...campaignOrderMetricValue,
    }

    return { ...dataset, [groupId]: value } as CampaignsPerformanceDataset
}

const _processCampaignsPerformanceData = (
    campaign: CampaignPerformanceData,
): CampaignPerformanceData => {
    return _computeCompoundMetrics(_addDefaultValues(campaign))
}

const _addDefaultValues = (
    campaign: CampaignPerformanceData,
): CampaignPerformanceData => {
    const defaultValues = {
        totalRevenue: 0,
        totalRevenueShare: 0,
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
            (value) => value !== undefined && value !== null && !isNaN(value),
        ),
    }
}

const _computeCompoundMetrics = (
    campaign: CampaignPerformanceData,
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
