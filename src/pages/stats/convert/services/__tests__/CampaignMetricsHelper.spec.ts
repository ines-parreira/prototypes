import moment from 'moment'

import { ReportingGranularity } from 'models/reporting/types'
import { Stat } from 'models/stat/types'
import {
    CampaignOrderEventsDimension,
    CampaignOrderEventsMeasure,
    EventsDimension,
    EventsMeasure,
    OrderConversionDimension,
    OrderConversionMeasure,
    SharedDimension,
} from 'pages/stats/convert/clients/constants'
import {
    backFillGraphData,
    getDataFromResult,
    getDataFromStatResult,
    getMetricFromCubeData,
    transformToCampaignAbTestEvent,
    transformToCampaignCalculatedTotals,
    transformToCampaignConversionRateOverTime,
    transformToCampaignCTROverTime,
    transformToCampaignEventsTotals,
    transformToCampaignOrdersTotals,
    transformToCampaignRevenueOverTime,
    transformToCampaignsPerformanceTable,
    transformToChatConversionRateOverTime,
    transformToRevenueByDate,
    transformToRevenueShareOverTime,
    transformToStoreTotal,
} from 'pages/stats/convert/services/CampaignMetricsHelper'
import {
    AbTestMetricNames,
    CampaignsTotalsMetricNames,
    GRAPH_LABEL_DATE_FORMAT,
} from 'pages/stats/convert/services/constants'
import { RevenueByDate } from 'pages/stats/convert/services/types'

describe('Campaign metrics helper tests', () => {
    const cubeDataMissing = {
        onlyWrongKeyHere: '12345678',
    }

    describe('getDataFromStatResult', () => {
        const statResponse = {
            data: {
                data: [1, 2, 3, 4],
            },
        }

        it.each([
            [statResponse, [1, 2, 3, 4]],
            [{ data: 'need one more' }, []],
            [{ data: { nodata: 'no metric' } }, []],
            [{ nodata: 'no metric' }, []],
            [{}, []],
            [null, []],
            [undefined, []],
        ])('For data %p should return %p', (data, expected) => {
            const result = getDataFromStatResult(data as Stat)
            expect(result).toEqual(expected)
        })
    })

    describe('getDataFromResult', () => {
        const response = {
            data: {
                data: [1, 2, 3, 4],
            },
        }

        it.each([
            [response, [1, 2, 3, 4]],
            [{ data: 'need one more' }, []],
            [{ data: { nodata: 'no metric' } }, []],
            [{ nodata: 'no metric' }, []],
            [{}, []],
            [null, []],
            [undefined, []],
        ])('For data %p should return %p', (data, expected) => {
            const result = getDataFromResult(data)
            expect(result).toEqual(expected)
        })
    })

    describe('getMetricFromCubeData', () => {
        const cubeResponse = {
            data: {
                data: [{ someKey: 'someVal' }],
            },
        }

        it.each([
            [cubeResponse, { someKey: 'someVal' }],
            [{ data: 'need one more' }, {}],
            [{ data: { nodata: 'no metric' } }, {}],
            [{ nodata: 'no metric' }, {}],
            [{}, {}],
            [null, {}],
            [undefined, {}],
        ])('For data %p should return %p', (data, expected) => {
            const result = getMetricFromCubeData(data)
            expect(result).toEqual(expected)
        })
    })

    describe('transformToCampaignEventsTotals', () => {
        const cubeData = {
            [CampaignOrderEventsMeasure.impressions]: '12345678',
            [CampaignOrderEventsMeasure.engagement]: '2345678',
        }

        it('should return correct data', () => {
            const result = transformToCampaignEventsTotals(cubeData)
            expect(result).toStrictEqual({
                [CampaignsTotalsMetricNames.impressions]: '12,345,678',
                [CampaignsTotalsMetricNames.engagement]: '2,345,678',
            })
        })

        it('should return the defaults for missing data', () => {
            const result = transformToCampaignEventsTotals(cubeDataMissing)
            expect(result).toStrictEqual({
                [CampaignsTotalsMetricNames.impressions]: '0',
                [CampaignsTotalsMetricNames.engagement]: '0',
            })
        })

        it('should return the defaults for wrong data', () => {
            const result = transformToCampaignEventsTotals(undefined)
            expect(result).toStrictEqual({
                [CampaignsTotalsMetricNames.impressions]: '0',
                [CampaignsTotalsMetricNames.engagement]: '0',
            })
        })
    })

    describe('transformToCampaignOrdersTotals', () => {
        const currency = 'USD'
        const cubeData = {
            [OrderConversionMeasure.campaignSales]: '34.56',
            [OrderConversionMeasure.campaignSalesCount]: '345678',
        }

        it('should return correct data', () => {
            const result = transformToCampaignOrdersTotals(cubeData, currency)
            expect(result).toStrictEqual({
                [CampaignsTotalsMetricNames.revenue]: '$34.56',
                [CampaignsTotalsMetricNames.campaignSalesCount]: '345,678',
            })
        })

        it('should return the defaults for missing data', () => {
            const result = transformToCampaignOrdersTotals(
                cubeDataMissing,
                currency,
            )
            expect(result).toStrictEqual({
                [CampaignsTotalsMetricNames.revenue]: '$0',
                [CampaignsTotalsMetricNames.campaignSalesCount]: '0',
            })
        })

        it('should return the defaults for wrong data', () => {
            const result = transformToCampaignOrdersTotals(undefined, currency)
            expect(result).toStrictEqual({
                [CampaignsTotalsMetricNames.revenue]: '$0',
                [CampaignsTotalsMetricNames.campaignSalesCount]: '0',
            })
        })
    })

    describe('transformToCampaignCalculatedTotals', () => {
        const orderCubeData = {
            [OrderConversionMeasure.campaignSales]: '750',
            [OrderConversionMeasure.campaignSalesCount]: '345678',
        }
        const totalCubeData = {
            [OrderConversionMeasure.gmv]: '1000',
        }

        it('should return correct data', () => {
            const result = transformToCampaignCalculatedTotals(
                orderCubeData,
                totalCubeData,
            )
            expect(result).toStrictEqual({
                [CampaignsTotalsMetricNames.influencedRevenueShare]: '75%',
            })
        })

        it('should return the defaults for missing data', () => {
            const result = transformToCampaignCalculatedTotals(
                cubeDataMissing,
                cubeDataMissing,
            )
            expect(result).toStrictEqual({
                [CampaignsTotalsMetricNames.influencedRevenueShare]: '0%',
            })
        })

        it('should return the defaults for wrong data', () => {
            const result = transformToCampaignCalculatedTotals(
                undefined,
                undefined,
            )
            expect(result).toStrictEqual({
                [CampaignsTotalsMetricNames.influencedRevenueShare]: '0%',
            })
        })
    })

    describe('transformToStoreTotal', () => {
        const currency = 'USD'
        const cubeData = {
            [OrderConversionMeasure.gmv]: '12345.678',
        }

        it('should return correct data', () => {
            const result = transformToStoreTotal(cubeData, currency)
            expect(result).toStrictEqual({
                [CampaignsTotalsMetricNames.gmv]: '$12,345.68',
            })
        })

        it('should return the defaults for missing data', () => {
            const result = transformToStoreTotal(cubeDataMissing, currency)
            expect(result).toStrictEqual({
                [CampaignsTotalsMetricNames.gmv]: '$0',
            })
        })

        it('should return the defaults for wrong data', () => {
            const result = transformToStoreTotal(undefined, currency)
            expect(result).toStrictEqual({
                [CampaignsTotalsMetricNames.gmv]: '$0',
            })
        })
    })

    describe('transformToRevenueByDate', () => {
        const cubeData = [
            {
                [OrderConversionMeasure.gmv]: '1234.56',
                [`${OrderConversionDimension.createdDatatime}.day`]:
                    '2023-02-28T00:00:00.000',
                [OrderConversionDimension.createdDatatime]:
                    '2023-02-28T00:00:00.000',
            },
        ]

        it('should return correct data', () => {
            const result = transformToRevenueByDate(cubeData)
            expect(result).toStrictEqual({
                '2023-02-28T00:00:00.000': 1234.56,
            })
        })

        it('should return defaults if no revenue data', () => {
            const result = transformToRevenueByDate([cubeDataMissing])
            expect(result).toStrictEqual({})
        })

        it('should return defaults if no data', () => {
            const result = transformToRevenueByDate(undefined)
            expect(result).toStrictEqual({})
        })
    })

    describe('transformToRevenueShareOverTime', () => {
        const revenueByDate: RevenueByDate = {
            '2023-02-28T00:00:00.000': 4567.89,
        }
        const revenueDataPoint = {
            [OrderConversionMeasure.campaignSales]: '1234.56',
            [`${OrderConversionDimension.createdDatatime}.day`]:
                '2023-02-28T00:00:00.000',
            [OrderConversionDimension.createdDatatime]:
                '2023-02-28T00:00:00.000',
        }

        it('should return correct data', () => {
            const result = transformToRevenueShareOverTime(
                revenueDataPoint,
                revenueByDate,
                ReportingGranularity.Day,
            )
            expect(result).toStrictEqual({
                x: 'Feb 28th',
                y: 27.03,
            })
        })

        it('should return defaults if no revenue data', () => {
            const result = transformToRevenueShareOverTime(
                revenueDataPoint,
                {},
                ReportingGranularity.Day,
            )
            expect(result).toStrictEqual({
                x: 'Feb 28th',
                y: 0,
            })
        })
    })

    describe('transformToCampaignCTROverTime', () => {
        const ctrDataPoint = {
            [CampaignOrderEventsMeasure.campaignCTR]: '15.65',
            [`${CampaignOrderEventsDimension.createdDatatime}.day`]:
                '2023-01-16T07:00:00.000',
            [CampaignOrderEventsDimension.createdDatatime]:
                '2023-01-16T07:00:00.000',
        }

        it('should return correct data', () => {
            const result = transformToCampaignCTROverTime(
                ctrDataPoint,
                ReportingGranularity.Day,
            )
            expect(result).toStrictEqual({
                x: '2023-01-16',
                y: 15.65,
            })
        })
    })

    describe('transformToCampaignConversionRateOverTime', () => {
        const conversionDataPoint = {
            [CampaignOrderEventsMeasure.totalConversionRate]: '7.18',
            [`${CampaignOrderEventsDimension.createdDatatime}.day`]:
                '2023-02-01T00:08:00.000',
            [CampaignOrderEventsDimension.createdDatatime]:
                '2023-02-01T00:08:00.000',
        }

        it('should return correct data', () => {
            const result = transformToCampaignConversionRateOverTime(
                conversionDataPoint,
                ReportingGranularity.Day,
            )
            expect(result).toStrictEqual({
                x: '2023-02-01',
                y: 7.18,
            })
        })
    })

    describe('transformToCampaignConversionRateOverTime', () => {
        it('should return graph data with conversion computed', () => {
            const result = transformToChatConversionRateOverTime({
                axes: {
                    x: [1612137600, 1612224000, 1612310400],
                    y: [0, 0, 0],
                },
                lines: [
                    {
                        data: [4, 8, 12],
                    },
                    {
                        data: [2, 4, 6],
                    },
                ],
            })
            expect(result).toStrictEqual([
                {
                    x: '2021-02-01',
                    y: 50,
                },
                {
                    x: '2021-02-02',
                    y: 50,
                },
                {
                    x: '2021-02-03',
                    y: 50,
                },
            ])
        })

        it('should return graph data with defaults for missing values', () => {
            const result = transformToChatConversionRateOverTime({
                axes: {
                    x: [1612137600, 1612224000],
                    y: [0, 0, 0],
                },
                lines: [
                    {
                        data: [4, 12],
                    },
                    {
                        data: [2, 6, 1234],
                    },
                ],
            })
            expect(result).toStrictEqual([
                {
                    x: '2021-02-01',
                    y: 50,
                },
                {
                    x: '2021-02-02',
                    y: 50,
                },
                {
                    x: '',
                    y: 0,
                },
            ])
        })
    })

    describe('backfillGraphData', () => {
        const graphData1 = [
            {
                x: '2021-02-01',
                y: 1,
            },
            {
                x: '2021-02-02',
                y: 2,
            },
            {
                x: '2021-02-03',
                y: 3,
            },
        ]
        const graphData2 = [
            {
                x: '2021-02-02',
                y: 20,
            },
            {
                x: '2021-02-03',
                y: 30,
            },
        ]
        const graphData3 = [
            {
                x: '2021-02-01',
                y: 100,
            },
            {
                x: '2021-02-02',
                y: 200,
            },
        ]
        const data = [graphData1, graphData2, graphData3]

        it('should backfill graph data for missing days', () => {
            const startDate = '2021-01-31'
            const endDate = '2021-02-03'
            const result = backFillGraphData(data, startDate, endDate)
            expect(result).toMatchSnapshot()
        })

        it('should backfill graph data for inner empty data', () => {
            const startDate = '2021-02-01'
            const endDate = '2021-02-03'
            const result = backFillGraphData(
                [graphData1, []],
                startDate,
                endDate,
            )
            expect(result).toMatchSnapshot()
        })

        it('should not backfill graph data for empty data', () => {
            const startDate = '2021-02-01'
            const endDate = '2021-02-03'
            const result = backFillGraphData([], startDate, endDate)
            expect(result).toStrictEqual([])
        })

        it('should not loop forever if dates are passed wrongly', () => {
            const startDate = '2021-02-03'
            const endDate = '2021-02-01'
            const result = backFillGraphData(
                [graphData1, []],
                startDate,
                endDate,
            )
            expect(result).toStrictEqual([])
        })

        it('should handle data with weekly granularity', () => {
            const startDate = '2024-10-09'
            const endDate = '2024-10-23'
            const weeklyData = [
                [
                    {
                        x: '2024-10-07',
                        y: 100,
                    },
                    {
                        x: '2024-10-14',
                        y: 200,
                    },
                ],
                [
                    {
                        x: '2024-10-07',
                        y: 100,
                    },
                    {
                        x: '2024-10-21',
                        y: 200,
                    },
                ],
            ]
            const granularity = ReportingGranularity.Week

            const result = backFillGraphData(
                weeklyData,
                startDate,
                endDate,
                granularity,
            )
            expect(result).toStrictEqual([
                [
                    {
                        x: moment('2024-10-07').format(GRAPH_LABEL_DATE_FORMAT),
                        y: 100,
                    },
                    {
                        x: moment('2021-10-14').format(GRAPH_LABEL_DATE_FORMAT),
                        y: 200,
                    },
                    {
                        x: moment('2021-10-21').format(GRAPH_LABEL_DATE_FORMAT),
                        y: 0,
                    },
                ],
                [
                    {
                        x: moment('2024-10-07').format(GRAPH_LABEL_DATE_FORMAT),
                        y: 100,
                    },
                    {
                        x: moment('2021-10-14').format(GRAPH_LABEL_DATE_FORMAT),
                        y: 0,
                    },
                    {
                        x: moment('2024-10-21').format(GRAPH_LABEL_DATE_FORMAT),
                        y: 200,
                    },
                ],
            ])
        })

        it('should handle data with monthly granularity', () => {
            const startDate = '2024-09-09'
            const endDate = '2024-11-23'
            const weeklyData = [
                [
                    {
                        x: '2024-09-01',
                        y: 100,
                    },
                    {
                        x: '2024-10-01',
                        y: 200,
                    },
                ],
                [
                    {
                        x: '2024-10-01',
                        y: 100,
                    },
                    {
                        x: '2024-11-01',
                        y: 200,
                    },
                ],
            ]
            const granularity = ReportingGranularity.Month

            const result = backFillGraphData(
                weeklyData,
                startDate,
                endDate,
                granularity,
            )
            expect(result).toStrictEqual([
                [
                    {
                        x: moment('2024-09-01').format(GRAPH_LABEL_DATE_FORMAT),
                        y: 100,
                    },
                    {
                        x: moment('2021-10-01').format(GRAPH_LABEL_DATE_FORMAT),
                        y: 200,
                    },
                    {
                        x: moment('2021-11-01').format(GRAPH_LABEL_DATE_FORMAT),
                        y: 0,
                    },
                ],
                [
                    {
                        x: moment('2024-09-01').format(GRAPH_LABEL_DATE_FORMAT),
                        y: 0,
                    },
                    {
                        x: moment('2021-10-01').format(GRAPH_LABEL_DATE_FORMAT),
                        y: 100,
                    },
                    {
                        x: moment('2024-11-01').format(GRAPH_LABEL_DATE_FORMAT),
                        y: 200,
                    },
                ],
            ])
        })
    })

    describe('transformToCampaignsPerformanceTable', () => {
        const campaignEventsPerformanceData = [
            {
                [EventsDimension.campaignId]: 'campaign1',
                [EventsMeasure.impressions]: '2000',
                [EventsMeasure.firstCampaignDisplay]: '2023-03-10T00:00:00.000',
                [EventsMeasure.lastCampaignDisplay]: '2023-03-11T00:00:00.000',
                [EventsMeasure.clicks]: '1000',
                [EventsMeasure.clicksRate]: '10.20',
                [EventsMeasure.ticketsCreated]: '300',
            },
            {
                [EventsDimension.campaignId]: 'campaign2',
                [EventsMeasure.impressions]: '4000',
                [EventsMeasure.firstCampaignDisplay]: '2023-03-09T00:00:00.000',
                [EventsMeasure.lastCampaignDisplay]: '2023-03-10T00:00:00.000',
                [EventsMeasure.clicks]: '2000',
                [EventsMeasure.clicksRate]: '21.34',
                [EventsMeasure.ticketsCreated]: '400',
            },
        ]

        const campaignOrdersPerformanceData = [
            {
                [OrderConversionDimension.campaignId]: 'campaign1',
                [OrderConversionMeasure.campaignSales]: '12345.67',
                [OrderConversionMeasure.ticketSales]: '1234.47',
                [OrderConversionMeasure.ticketSalesCount]: '60',
                [OrderConversionMeasure.discountSales]: '4567.65',
                [OrderConversionMeasure.discountSalesCount]: '125',
                [OrderConversionMeasure.clickSales]: '3596.25',
                [OrderConversionMeasure.clickSalesCount]: '20',
                [OrderConversionMeasure.campaignSalesCount]: '125',
            },
            {
                [OrderConversionDimension.campaignId]: 'campaign2',
                [OrderConversionMeasure.campaignSales]: '12345.67',
                [OrderConversionMeasure.ticketSales]: '1234.47',
                [OrderConversionMeasure.ticketSalesCount]: '80',
                [OrderConversionMeasure.discountSales]: '4567.65',
                [OrderConversionMeasure.discountSalesCount]: '125',
                [OrderConversionMeasure.clickSales]: '3596.25',
                [OrderConversionMeasure.clickSalesCount]: '40',
                [OrderConversionMeasure.campaignSalesCount]: '358',
            },
        ]

        const totalStoreData = {
            [OrderConversionMeasure.gmv]: '1234.47',
        }

        const campaignEventsOrdersPerformanceData = [
            {
                [CampaignOrderEventsDimension.campaignId]: 'campaign1',
                [CampaignOrderEventsMeasure.engagement]: '657',
                [CampaignOrderEventsMeasure.campaignCTR]: '12.78',
                [CampaignOrderEventsMeasure.totalConversionRate]: '7.49',
            },
            {
                [CampaignOrderEventsDimension.campaignId]: 'campaign2',
                [CampaignOrderEventsMeasure.engagement]: '1757',
                [CampaignOrderEventsMeasure.campaignCTR]: '11.25',
                [CampaignOrderEventsMeasure.totalConversionRate]: '9.87',
            },
        ]

        it('should transform data from metrics to table data', () => {
            const result = transformToCampaignsPerformanceTable(
                SharedDimension.campaignId,
                campaignEventsPerformanceData,
                campaignOrdersPerformanceData,
                campaignEventsOrdersPerformanceData,
                totalStoreData,
            )
            expect(result).toMatchSnapshot()
        })

        it('should return defaults for missing data', () => {
            const result = transformToCampaignsPerformanceTable(
                SharedDimension.campaignId,
                [
                    { [EventsDimension.campaignId]: 'campaign1' },
                    { [EventsDimension.campaignId]: 'campaign2' },
                ],
                [],
                [],
                {},
            )
            expect(result).toMatchSnapshot()
        })

        it('should not divide by zero for compound metrics', () => {
            const result = transformToCampaignsPerformanceTable(
                SharedDimension.campaignId,
                [
                    {
                        [EventsDimension.campaignId]: 'campaign1',
                        [EventsMeasure.impressions]: '0',
                        [EventsMeasure.clicks]: '0',
                    },
                ],
                [
                    {
                        [OrderConversionDimension.campaignId]: 'campaign1',
                        [OrderConversionMeasure.ticketSalesCount]: '60',
                        [OrderConversionMeasure.clickSalesCount]: '20',
                    },
                ],
                [
                    {
                        [CampaignOrderEventsDimension.campaignId]: 'campaign1',
                    },
                ],
                {},
            )
            expect(result).toMatchSnapshot()
        })
    })

    describe('transformToCampaignAbTestEvent', () => {
        const cubeData = {
            [CampaignOrderEventsMeasure.orderCount]: '1',
            [CampaignOrderEventsMeasure.firstCampaignDisplay]:
                '2024-03-10T07:31:49.000',
        }

        it('should return correct data', () => {
            const result = transformToCampaignAbTestEvent(cubeData)
            expect(result).toStrictEqual({
                [AbTestMetricNames.orderCount]: 1,
                [AbTestMetricNames.firstImpression]: '2024-03-10T07:31:49.000',
            })
        })
    })

    describe('transformToCampaignRevenueOverTime', () => {
        const ctrDataPoint = {
            [OrderConversionMeasure.campaignSales]: '15.65',
            [`${OrderConversionDimension.createdDatatime}.day`]:
                '2024-08-16T07:00:00.000',
            [OrderConversionDimension.createdDatatime]:
                '2024-08-16T07:00:00.000',
        }

        it('should return correct data', () => {
            const result = transformToCampaignRevenueOverTime(
                ctrDataPoint,
                ReportingGranularity.Day,
            )
            expect(result).toStrictEqual({
                x: '2024-08-16',
                y: 15.65,
            })
        })
    })
})
