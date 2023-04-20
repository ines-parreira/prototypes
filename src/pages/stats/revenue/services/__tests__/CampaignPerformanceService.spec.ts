import moment from 'moment'
import * as cubeQueries from 'pages/stats/revenue/clients/CampaignCubeQueries'
import * as revenueAttributionClient from 'pages/stats/revenue/clients/RevenueAttributionClient'
import {
    getCampaignsAndChatPerformanceOverTime,
    getRevenueUpliftOverTime,
} from 'pages/stats/revenue/services/CampaignPerformanceService'
import {Stat} from 'models/stat/types'
import {CubeResponse} from 'pages/stats/revenue/clients/types'
import {
    CampaignOrderEventsDimension,
    CampaignOrderEventsMeasure,
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
})
