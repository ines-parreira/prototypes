import moment from 'moment'
import * as cubeQueries from 'pages/stats/revenue/clients/CampaignCubeQueries'
import * as revenueAttributionClient from 'pages/stats/revenue/clients/RevenueAttributionClient'
import {
    getCampaignsAndChatPerformanceOverTime,
    getCampaignsPerformance,
    getRevenueUpliftOverTime,
} from 'pages/stats/revenue/services/CampaignPerformanceService'
import {Stat} from 'models/stat/types'
import {CubeResponse} from 'pages/stats/revenue/clients/types'
import {
    CampaignOrderEventsDimension,
    CampaignOrderEventsMeasure,
    EventsDimension,
    EventsMeasure,
    OrderConversionDimension,
    OrderConversionMeasure,
} from 'pages/stats/revenue/clients/constants'

describe('Revenue Attribution Service stats methods', () => {
    describe('getRevenueUpliftOverTime', () => {
        const revenueUpliftGraphData = {
            data: [
                {
                    [OrderConversionMeasure.influencedRevenueUplift]: '43.32',
                    [OrderConversionDimension.createdDatatime]:
                        '2023-02-28T00:00:00.000',
                    [`${OrderConversionDimension.createdDatatime}.day`]:
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
                    [CampaignOrderEventsMeasure.campaignCTR]: '12.32',
                    [CampaignOrderEventsMeasure.totalConversionRate]: '13.25',
                    [CampaignOrderEventsDimension.createdDatatime]: startDate,
                    [`${CampaignOrderEventsDimension.createdDatatime}.day`]:
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
                    [EventsDimension.campaignId]: 'campaign1',
                    [EventsMeasure.impressions]: '234',
                    [EventsMeasure.firstCampaignDisplay]:
                        '2023-03-10T00:00:00.000',
                    [EventsMeasure.lastCampaignDisplay]:
                        '2023-03-11T00:00:00.000',
                    [EventsMeasure.clicks]: '24',
                    [EventsMeasure.clicksRate]: '10.20',
                },
                {
                    [EventsDimension.campaignId]: 'campaign2',
                    [EventsMeasure.impressions]: '567',
                    [EventsMeasure.firstCampaignDisplay]:
                        '2023-03-11T00:00:00.000',
                    [EventsMeasure.lastCampaignDisplay]:
                        '2023-03-12T00:00:00.000',
                    [EventsMeasure.clicks]: '57',
                    [EventsMeasure.clicksRate]: '21.34',
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
                    [OrderConversionDimension.campaignId]: 'campaign1',
                    [OrderConversionMeasure.campaignSales]: '12345.67',
                    [OrderConversionMeasure.ticketSales]: '1234.47',
                    [OrderConversionMeasure.ticketSalesCount]: '78',
                    [OrderConversionMeasure.discountSales]: '4567.65',
                    [OrderConversionMeasure.discountSalesCount]: '125',
                    [OrderConversionMeasure.clickSales]: '3596.25',
                    [OrderConversionMeasure.clickSalesCount]: '117',
                    [OrderConversionMeasure.campaignSalesCount]: '125',
                },
                {
                    [OrderConversionDimension.campaignId]: 'campaign2',
                    [OrderConversionMeasure.campaignSales]: '12345.67',
                    [OrderConversionMeasure.ticketSales]: '1234.47',
                    [OrderConversionMeasure.ticketSalesCount]: '78',
                    [OrderConversionMeasure.discountSales]: '4567.65',
                    [OrderConversionMeasure.discountSalesCount]: '125',
                    [OrderConversionMeasure.clickSales]: '3596.25',
                    [OrderConversionMeasure.clickSalesCount]: '248',
                    [OrderConversionMeasure.campaignSalesCount]: '358',
                },
            ],
        } as CubeResponse
        const mockCampaignOrdersPerformance = jest
            .spyOn(cubeQueries, 'getCampaignOrderPerformanceData')
            .mockReturnValue(
                new Promise((resolve) => resolve(campaignOrdersPerformanceData))
            )

        const trafficData = {
            data: [
                {
                    [EventsDimension.createdDatetime]:
                        '2023-03-09T00:00:00.000',
                    [EventsMeasure.traffic]: '1',
                },
                {
                    [EventsDimension.createdDatetime]:
                        '2023-03-10T00:00:00.000',
                    [EventsMeasure.traffic]: '2',
                },
                {
                    [EventsDimension.createdDatetime]:
                        '2023-03-11T00:00:00.000',
                    [EventsMeasure.traffic]: '3',
                },
            ],
        } as CubeResponse
        const mockTrafficData = jest
            .spyOn(cubeQueries, 'getTrafficData')
            .mockReturnValue(new Promise((resolve) => resolve(trafficData)))

        const campaignEventsOrdersPerformanceData = {
            data: [
                {
                    [CampaignOrderEventsDimension.campaignId]: 'campaign1',
                    [CampaignOrderEventsMeasure.engagement]: '357',
                    [CampaignOrderEventsMeasure.campaignCTR]: '12.78',
                    [CampaignOrderEventsMeasure.totalConversionRate]: '7.49',
                },
                {
                    [CampaignOrderEventsDimension.campaignId]: 'campaign2',
                    [CampaignOrderEventsMeasure.engagement]: '1357',
                    [CampaignOrderEventsMeasure.campaignCTR]: '11.25',
                    [CampaignOrderEventsMeasure.totalConversionRate]: '9.87',
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
            mockTrafficData.mockClear()
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
