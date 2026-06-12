import moment from 'moment'
import { get, pickBy, unzip, zip } from '@gorgias/toolkit'

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

const hasOwnProperty = (object: object, key: PropertyKey): boolean =>
    Object.prototype.hasOwnProperty.call(object, key)

type RawMetricValue = string | number | undefined

const getValue = <T>(
    object: Record<string, any> | null | undefined,
    path: string | undefined,
    defaultValue: T,
): T => {
    if (!object || path === undefined) {
        return defaultValue
    }

    if (hasOwnProperty(object, path)) {
        return object[path] as T
    }

    return (get(object, path, defaultValue) ?? defaultValue) as T
}

const mapRecordValues = <TValue, TResult>(
    object: Record<string, TValue>,
    iteratee: (value: TValue) => TResult,
): Record<string, TResult> => {
    return Object.fromEntries(
        Object.entries(object).map(([key, value]) => [key, iteratee(value)]),
    )
}

const getRawMetricValue = (
    metric: CubeMetric,
    path: string,
): RawMetricValue => {
    return getValue<RawMetricValue>(metric, path, undefined)
}

const getGroupKey = (
    metric: CubeMetric,
    cube: Cube,
    groupDimension: GroupDimension,
): string => {
    return String(
        getValue<string | number | undefined>(
            metric,
            `${cube}.${groupDimension}`,
            undefined,
        ),
    )
}

const toMetricNumber = (value: RawMetricValue): number => {
    return value === undefined ? Number.NaN : ensureNumberValue(value)
}

const normalizeMetricValues = (
    values: Record<string, RawMetricValue>,
): Partial<CampaignPerformanceData> => {
    return mapRecordValues(
        values,
        toMetricNumber,
    ) as Partial<CampaignPerformanceData>
}

export const getDataFromStatResult = (result: Stat): StatData => {
    return getValue(result, 'data.data', [])
}

export const getMetricFromCubeData = (data: any): CubeMetric => {
    return getValue(data, 'data.data[0]', {})
}

export const getDataFromResult = (data: any): CubeData => {
    return getValue(data, 'data.data', [])
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
    return (data || []).reduce((acc, revenuePoint) => {
        const date = getValue<string | undefined>(
            revenuePoint,
            OrderConversionDimension.createdDatatime,
            undefined,
        )
        if (date !== undefined) {
            acc[date] = getMetricValue(revenuePoint, OrderConversionMeasure.gmv)
        }
        return acc
    }, {} as RevenueByDate)
}

export const transformToRevenueShareOverTime = (
    dataPoint: CubeMetric,
    revenueData: RevenueByDate,
    granularityValue: ReportingGranularity,
): RevenueGraphDataPoint => {
    const createdDatetime = getValue<string | undefined>(
        dataPoint,
        OrderConversionDimension.createdDatatime,
        undefined,
    )
    const totalSales = getValue(revenueData, createdDatetime, 0)
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
        x: moment(getValue(dataPoint, xDateColname, undefined)).format(
            dateFormat,
        ),
    }
}

export const transformToChatConversionRateOverTime = (
    data: CampaignGraphData | undefined,
): RevenueGraphDataPoint[] => {
    if (data === undefined) return []

    const combinedData = zip(
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

    return unzip(Object.values(allDates)) as RevenueGraphDataPoint[][]
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
    const eventsDataset = (eventsData || []).reduce(
        (dataset, metric) =>
            _eventsPerformanceReducer(dataset, metric, groupDimension),
        {} as CampaignsPerformanceDataset,
    )

    const ordersDataset = _getCubeDataOrDefault(ordersData).reduce(
        (dataset, metric) =>
            _ordersPerformanceReducer(
                dataset,
                metric,
                _getMetricOrDefault(storeTotal),
                groupDimension,
            ),
        eventsDataset,
    )
    const campaignsOrdersDataset = _getCubeDataOrDefault(
        campaignsOrdersData,
    ).reduce(
        (dataset, metric) =>
            _campaignsOrdersPerformanceReducer(dataset, metric, groupDimension),
        ordersDataset,
    )

    return mapRecordValues(
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
        [AbTestMetricNames.firstImpression]: getValue(
            metric,
            CampaignOrderEventsMeasure.firstCampaignDisplay,
            undefined,
        ),
    }
}

const _eventsPerformanceReducer = (
    dataset: CampaignsPerformanceDataset,
    metric: CubeMetric,
    groupDimension: GroupDimension,
): CampaignsPerformanceDataset => {
    const groupId = getGroupKey(metric, Cube.events, groupDimension)
    const eventMetricValue = normalizeMetricValues({
        impressions: getRawMetricValue(metric, EventsMeasure.impressions),
        clicks: getRawMetricValue(metric, EventsMeasure.clicks),
        clicksRate: getRawMetricValue(metric, EventsMeasure.clicksRate),
        ticketsCreated: getRawMetricValue(metric, EventsMeasure.ticketsCreated),
    })

    const value = {
        ...getValue<Partial<CampaignPerformanceData>>(dataset, groupId, {}),
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
    const groupId = getGroupKey(metric, Cube.orderConversion, groupDimension)

    const totalRevenue = getRawMetricValue(
        metric,
        OrderConversionMeasure.campaignSales,
    )
    const totalStoreRevenue = getRawMetricValue(
        storeTotalMetric,
        OrderConversionMeasure.gmv,
    )

    const totalRevenueShare =
        toMetricNumber(totalRevenue) / toMetricNumber(totalStoreRevenue)

    const orderMetricValue = normalizeMetricValues({
        totalRevenue: totalRevenue,
        totalRevenueShare: totalRevenueShare * 100,
        ticketsConverted: getRawMetricValue(
            metric,
            OrderConversionMeasure.ticketSalesCount,
        ),
        ticketsRevenue: getRawMetricValue(
            metric,
            OrderConversionMeasure.ticketSales,
        ),
        clicksRevenue: getRawMetricValue(
            metric,
            OrderConversionMeasure.clickSales,
        ),
        clicksConverted: getRawMetricValue(
            metric,
            OrderConversionMeasure.clickSalesCount,
        ),
        discountCodesUsed: getRawMetricValue(
            metric,
            OrderConversionMeasure.discountSalesCount,
        ),
        discountCodesRevenue: getRawMetricValue(
            metric,
            OrderConversionMeasure.discountSales,
        ),
        campaignSalesCount: getRawMetricValue(
            metric,
            OrderConversionMeasure.campaignSalesCount,
        ),
    })

    const value = {
        ...getValue<Partial<CampaignPerformanceData>>(dataset, groupId, {}),
        ...orderMetricValue,
    }

    return { ...dataset, [groupId]: value } as CampaignsPerformanceDataset
}

const _campaignsOrdersPerformanceReducer = (
    dataset: CampaignsPerformanceDataset,
    metric: CubeMetric,
    groupDimension: GroupDimension,
): CampaignsPerformanceDataset => {
    const groupId = getGroupKey(
        metric,
        Cube.campaignOrderEvents,
        groupDimension,
    )
    const campaignOrderMetricValue = normalizeMetricValues({
        engagement: getRawMetricValue(
            metric,
            CampaignOrderEventsMeasure.engagement,
        ),
        totalConversionRate: getRawMetricValue(
            metric,
            CampaignOrderEventsMeasure.totalConversionRate,
        ),
        clickThroughRate: getRawMetricValue(
            metric,
            CampaignOrderEventsMeasure.campaignCTR,
        ),
    })

    const value = {
        ...getValue<Partial<CampaignPerformanceData>>(dataset, groupId, {}),
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
        ...pickBy(
            campaign,
            (value) => value !== undefined && value !== null && !isNaN(value),
        ),
    }
}

const _computeCompoundMetrics = (
    campaign: CampaignPerformanceData,
): CampaignPerformanceData => {
    const impressions = getValue(campaign, 'impressions', 0) || 0
    const clicks = getValue(campaign, 'clicks', 0) || 0
    const clicksConverted = getValue(campaign, 'clicksConverted', 0) || 0

    const ticketsCreated = getValue(campaign, 'ticketsCreated', 0) || 0
    const ticketsConverted = getValue(campaign, 'ticketsConverted', 0) || 0

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
