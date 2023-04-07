import moment from 'moment'
import * as cubeQueries from 'pages/stats/revenue/clients/CampaignCubeQueries'
import * as revenueAttributionClient from 'pages/stats/revenue/clients/RevenueAttributionClient'
import {
    getCampaignsAndChatPerformanceOverTime,
    getCampaignsPerformance,
    getRevenueUpliftOverTime,
    getTotals,
} from 'pages/stats/revenue/services/CampaignPerformanceService'
import {Stat} from 'models/stat/types'
import {CubeResponse} from 'pages/stats/revenue/clients/types'
import {
    CampaignOrderEventsDimensions,
    CampaignOrderEventsMeasures,
    EventsDimensions,
    EventsMeasures,
    OrderConversionDimensions,
    OrderConversionMeasures,
} from 'pages/stats/revenue/clients/constants'

describe('Revenue Attribution Service stats methods', () => {
    describe('getTotals', () => {
        const campaignEventsTotalsData = {
            data: [
                {
                    [CampaignOrderEventsMeasures.impressions]: '1000',
                    [CampaignOrderEventsMeasures.engagement]: '100',
                },
            ],
        } as CubeResponse
        const mockCampaignEventsTotals = jest
            .spyOn(cubeQueries, 'getCampaignEventsTotalsData')
            .mockReturnValue(
                new Promise((resolve) => resolve(campaignEventsTotalsData))
            )

        const campaignOrdersTotalsData = {
            data: [
                {
                    [OrderConversionMeasures.influencedRevenueUplift]: '23.45',
                    [OrderConversionMeasures.campaignSales]: '2000',
                    [OrderConversionMeasures.campaignSalesCount]: '10',
                },
            ],
        } as CubeResponse
        const mockCampaignOrdersTotals = jest
            .spyOn(cubeQueries, 'getCampaignOrderTotalsData')
            .mockReturnValue(
                new Promise((resolve) => resolve(campaignOrdersTotalsData))
            )

        const storeTotalData = {
            data: [
                {
                    [OrderConversionMeasures.gmv]: '3000',
                },
            ],
        } as CubeResponse
        const mockStoreTotalData = jest
            .spyOn(cubeQueries, 'getStoreRevenueTotalData')
            .mockReturnValueOnce(
                new Promise((resolve) => resolve(storeTotalData))
            )

        beforeEach(() => {
            mockCampaignEventsTotals.mockClear()
            mockCampaignOrdersTotals.mockClear()
            mockStoreTotalData.mockClear()
        })

        it('should return prepared data for totals section', async () => {
            // act
            const result = await getTotals(
                'shopify:slow-formulas-for-sale',
                ['campaign231', 'campaign232'],
                'EUR',
                '2023-01-01T00:00:00-08:00',
                '2023-02-01T00:00:00-08:00'
            )

            // assert
            expect(result).toMatchSnapshot()
        })
    })
    describe('getRevenueUpliftOverTime', () => {
        const revenueUpliftGraphData = {
            data: [
                {
                    [OrderConversionMeasures.influencedRevenueUplift]: '43.32',
                    [OrderConversionDimensions.createdDatatime]:
                        '2023-02-28T00:00:00.000',
                    [`${OrderConversionDimensions.createdDatatime}.day`]:
                        '2023-02-28T00:00:00.000',
                },
            ],
        } as CubeResponse
        const mockGetRevenueUpliftGraph = jest
            .spyOn(cubeQueries, 'getRevenueUpliftGraphData')
            .mockReturnValue(
                new Promise((resolve) => resolve(revenueUpliftGraphData))
            )

        beforeEach(() => {
            mockGetRevenueUpliftGraph.mockClear()
        })

        it('should return prepared data for chart', async () => {
            // act
            const result = await getRevenueUpliftOverTime(
                '2023-01-01T00:00:00-08:00',
                '2023-02-01T00:00:00-08:00',
                'shopify:square-wheels-company',
                ['campaign1', 'campaign2']
            )

            // assert
            expect(result).toMatchSnapshot()
        })
    })

    describe('getCampaignsAndChatPerformanceOverTime', () => {
        const startDate = '2023-02-28T00:00:00.000'
        const endDate = '2023-03-02T00:00:00.000'
        const campaignsPerformanceGraphData = {
            data: [
                {
                    [CampaignOrderEventsMeasures.campaignCTR]: '12.32',
                    [CampaignOrderEventsMeasures.totalConversionRate]: '13.25',
                    [CampaignOrderEventsDimensions.createdDatatime]: startDate,
                    [`${CampaignOrderEventsDimensions.createdDatatime}.day`]:
                        startDate,
                },
            ],
        } as CubeResponse
        const mockGetCampaignsPerformanceGraph = jest
            .spyOn(cubeQueries, 'getCampaignsPerformanceGraphData')
            .mockReturnValue(
                new Promise((resolve) => resolve(campaignsPerformanceGraphData))
            )

        const ticketsPerformanceData = {
            data: {
                data: {
                    axes: {
                        x: [
                            moment(startDate).unix(),
                            moment(endDate).subtract(1, 'day').unix(),
                        ],
                        y: ['Day is 28.2.2023', 'Day is 1.3.2023'],
                    },
                    lines: [
                        {
                            data: [125, 68], // tickets created
                        },
                        {
                            data: [12, 2], // tickets converted
                        },
                    ],
                },
            },
        } as unknown as Stat
        const mockTicketsPerformance = jest
            .spyOn(revenueAttributionClient, 'getTicketsPerformanceData')
            .mockReturnValue(
                new Promise((resolve) => resolve(ticketsPerformanceData))
            )

        beforeEach(() => {
            mockGetCampaignsPerformanceGraph.mockClear()
            mockTicketsPerformance.mockClear()
        })

        it('should return prepared and backfilled data for chart', async () => {
            // Test spans across 3 days, but metrics have 1 or 2 days of data only
            // We expect to get backfilled data for the missing days
            // act
            const result = await getCampaignsAndChatPerformanceOverTime(
                startDate,
                endDate,
                'shopify:square-wheels-company',
                ['campaign1', 'campaign2'],
                42
            )

            // assert
            expect(result).toMatchSnapshot()
        })
    })
    describe('getCampaignsPerformance', () => {
        const campaignEventsPerformanceData = {
            data: [
                {
                    [EventsDimensions.campaignId]: 'campaign1',
                    [EventsMeasures.traffic]: '1234',
                    [EventsMeasures.impressions]: '234',
                    [EventsMeasures.uniqueImpressions]: '34',
                    [EventsMeasures.clicks]: '24',
                    [EventsMeasures.clicksRate]: '10.20',
                },
                {
                    [EventsDimensions.campaignId]: 'campaign2',
                    [EventsMeasures.traffic]: '4567',
                    [EventsMeasures.impressions]: '567',
                    [EventsMeasures.uniqueImpressions]: '67',
                    [EventsMeasures.clicks]: '57',
                    [EventsMeasures.clicksRate]: '21.34',
                },
            ],
        } as CubeResponse
        const mockCampaignEventsPerformance = jest
            .spyOn(cubeQueries, 'getCampaignEventsPerformanceData')
            .mockReturnValue(
                new Promise((resolve) => resolve(campaignEventsPerformanceData))
            )

        const campaignOrdersPerformanceData = {
            data: [
                {
                    [OrderConversionDimensions.campaignId]: 'campaign1',
                    [OrderConversionMeasures.campaignSales]: '12345.67',
                    [OrderConversionMeasures.ticketSales]: '1234.47',
                    [OrderConversionMeasures.ticketSalesCount]: '78',
                    [OrderConversionMeasures.discountSales]: '4567.65',
                    [OrderConversionMeasures.discountSalesCount]: '125',
                    [OrderConversionMeasures.clickSales]: '3596.25',
                    [OrderConversionMeasures.clickSalesCount]: '117',
                    [OrderConversionMeasures.campaignSalesCount]: '125',
                },
                {
                    [OrderConversionDimensions.campaignId]: 'campaign2',
                    [OrderConversionMeasures.campaignSales]: '12345.67',
                    [OrderConversionMeasures.ticketSales]: '1234.47',
                    [OrderConversionMeasures.ticketSalesCount]: '78',
                    [OrderConversionMeasures.discountSales]: '4567.65',
                    [OrderConversionMeasures.discountSalesCount]: '125',
                    [OrderConversionMeasures.clickSales]: '3596.25',
                    [OrderConversionMeasures.clickSalesCount]: '248',
                    [OrderConversionMeasures.campaignSalesCount]: '358',
                },
            ],
        } as CubeResponse
        const mockCampaignOrdersPerformance = jest
            .spyOn(cubeQueries, 'getCampaignOrderPerformanceData')
            .mockReturnValue(
                new Promise((resolve) => resolve(campaignOrdersPerformanceData))
            )

        const revenueTotalData = {
            data: [
                {
                    [OrderConversionMeasures.gmv]: '52345.67',
                },
            ],
        } as CubeResponse
        const mockStoreRevenueTotal = jest
            .spyOn(cubeQueries, 'getStoreRevenueTotalData')
            .mockReturnValue(
                new Promise((resolve) => resolve(revenueTotalData))
            )

        const campaignEventsOrdersPerformanceData = {
            data: [
                {
                    [CampaignOrderEventsDimensions.campaignId]: 'campaign1',
                    [CampaignOrderEventsMeasures.engagement]: '357',
                    [CampaignOrderEventsMeasures.campaignCTR]: '12.78',
                    [CampaignOrderEventsMeasures.totalConversionRate]: '7.49',
                },
                {
                    [CampaignOrderEventsDimensions.campaignId]: 'campaign2',
                    [CampaignOrderEventsMeasures.engagement]: '1357',
                    [CampaignOrderEventsMeasures.campaignCTR]: '11.25',
                    [CampaignOrderEventsMeasures.totalConversionRate]: '9.87',
                },
            ],
        } as CubeResponse
        const mockCampaignEventsOrdersPerformance = jest
            .spyOn(cubeQueries, 'getCampaignEventsOrdersPerformanceData')
            .mockReturnValue(
                new Promise((resolve) =>
                    resolve(campaignEventsOrdersPerformanceData)
                )
            )

        const campaignTicketsPerformanceData = {
            data: {
                data: [
                    ['campaign1', 157],
                    ['campaign2', 357],
                ],
            },
        } as unknown as Stat
        const mockCampaignTicketsPerformance = jest
            .spyOn(
                revenueAttributionClient,
                'getCampaignTicketsPerformanceData'
            )
            .mockReturnValue(
                new Promise((resolve) =>
                    resolve(campaignTicketsPerformanceData)
                )
            )

        beforeEach(() => {
            mockCampaignEventsPerformance.mockClear()
            mockCampaignOrdersPerformance.mockClear()
            mockStoreRevenueTotal.mockClear()
            mockCampaignEventsOrdersPerformance.mockClear()
            mockCampaignTicketsPerformance.mockClear()
        })

        it('should return empty array if no campaignIds', async () => {
            // act
            const result = await getCampaignsPerformance(
                '2023-01-01T00:00:00-08:00',
                '2023-02-01T00:00:00-08:00',
                [],
                'shopify:slow-formulas-for-sale'
            )

            // assert
            expect(result).toEqual({})
        })

        it('should return prepared data for campaign performance table', async () => {
            // act
            const result = await getCampaignsPerformance(
                '2023-01-01T00:00:00-08:00',
                '2023-02-01T00:00:00-08:00',
                ['campaign1', 'campaign2'],
                'shopify:slow-formulas-for-sale'
            )

            // assert
            expect(result).toMatchSnapshot()
        })

        it('should fill default values if data is missing', async () => {
            // arrange
            // let's pretend one metric doesn't return values
            mockCampaignOrdersPerformance.mockReturnValue(
                new Promise((resolve) => resolve({} as CubeResponse))
            )

            // act
            const result = await getCampaignsPerformance(
                '2023-01-01T00:00:00-08:00',
                '2023-02-01T00:00:00-08:00',
                ['campaign1', 'campaign2'],
                'shopify:slow-formulas-for-sale'
            )

            // assert
            expect(result).toMatchSnapshot()
        })
    })
})
