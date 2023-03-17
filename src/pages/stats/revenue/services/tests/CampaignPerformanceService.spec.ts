import * as cubeQueries from 'pages/stats/revenue/clients/CampaignCubeQueries'
import * as revenueAttributionClient from 'pages/stats/revenue/clients/RevenueAttributionClient'
import {
    getCampaignsPerformance,
    getGMVUplift,
    getTotals,
} from 'pages/stats/revenue/services/CampaignPerformanceService'
import {Stat} from 'models/stat/types'
import {
    CAMPAIGN_ORDER_CUBE,
    EVENTS_CUBE,
    ORDER_CUBE,
} from 'pages/stats/revenue/clients/CampaignCubeQueries'
import {CubeResponse} from 'pages/stats/revenue/clients/types'

describe('Revenue Attribution Service stats methods', () => {
    describe('getTotals', () => {
        const campaignEventsTotalsData = {
            data: [
                {
                    [`${CAMPAIGN_ORDER_CUBE}.impressions`]: '1000',
                    [`${CAMPAIGN_ORDER_CUBE}.engagement`]: '100',
                    [`${CAMPAIGN_ORDER_CUBE}.uniqueConversions`]: '10',
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
                    [`${ORDER_CUBE}.gmv`]: '3000',
                    [`${ORDER_CUBE}.influencedRevenueUplift`]: '23.45',
                    [`${ORDER_CUBE}.campaignSales`]: '2000',
                },
            ],
        } as CubeResponse
        const mockCampaignOrdersTotals = jest
            .spyOn(cubeQueries, 'getCampaignOrderTotalsData')
            .mockReturnValue(
                new Promise((resolve) => resolve(campaignOrdersTotalsData))
            )

        beforeEach(() => {
            mockCampaignEventsTotals.mockClear()
            mockCampaignOrdersTotals.mockClear()
        })

        it('should return prepared data for totals section', async () => {
            // act
            const result = await getTotals(
                42,
                '2023-01-01T00:00:00-08:00',
                '2023-02-01T00:00:00-08:00'
            )

            // assert
            expect(result).toMatchSnapshot()
        })
    })
    describe('getGMVUplift', () => {
        const gmvUpliftGraphData = {
            data: [
                {
                    [`${ORDER_CUBE}.influencedRevenueUplift`]: '43.32',
                    [`${ORDER_CUBE}.createdDatetime`]:
                        '2023-02-28T00:00:00.000',
                    [`${ORDER_CUBE}.createdDatetime.day`]:
                        '2023-02-28T00:00:00.000',
                },
            ],
        } as CubeResponse
        const mockGetGMVGraph = jest
            .spyOn(cubeQueries, 'getGMVUpliftGraphData')
            .mockReturnValue(
                new Promise((resolve) => resolve(gmvUpliftGraphData))
            )

        beforeEach(() => {
            mockGetGMVGraph.mockClear()
        })

        it('should return empty array if no campaignIds', async () => {
            // act
            const result = await getGMVUplift(
                '2023-01-01T00:00:00-08:00',
                '2023-02-01T00:00:00-08:00',
                []
            )

            // assert
            expect(result).toEqual([])
        })

        it('should return prepared data for chart', async () => {
            // act
            const result = await getGMVUplift(
                '2023-01-01T00:00:00-08:00',
                '2023-02-01T00:00:00-08:00',
                ['campaign1', 'campaign2']
            )

            // assert
            expect(result).toMatchSnapshot()
        })
    })
    describe('getCampaignsPerformance', () => {
        const campaignEventsPerformanceData = {
            data: [
                {
                    [`${EVENTS_CUBE}.campaignId`]: 'campaign1',
                    [`${EVENTS_CUBE}.traffic`]: '1234',
                    [`${EVENTS_CUBE}.impressions`]: '234',
                    [`${EVENTS_CUBE}.uniqueImpressions`]: '34',
                    [`${EVENTS_CUBE}.clicks`]: '24',
                    [`${EVENTS_CUBE}.clicksRate`]: '10.20',
                },
                {
                    [`${EVENTS_CUBE}.campaignId`]: 'campaign2',
                    [`${EVENTS_CUBE}.traffic`]: '4567',
                    [`${EVENTS_CUBE}.impressions`]: '567',
                    [`${EVENTS_CUBE}.uniqueImpressions`]: '67',
                    [`${EVENTS_CUBE}.clicks`]: '57',
                    [`${EVENTS_CUBE}.clicksRate`]: '21.34',
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
                    [`${ORDER_CUBE}.campaignId`]: 'campaign1',
                    [`${ORDER_CUBE}.gmv`]: '12345.67',
                    [`${ORDER_CUBE}.influencedRevenueUplift`]: '65.78',
                    [`${ORDER_CUBE}.ticketSales`]: '1234.47',
                    [`${ORDER_CUBE}.ticketSalesCount`]: '78',
                    [`${ORDER_CUBE}.discountSales`]: '4567.65',
                    [`${ORDER_CUBE}.discountSalesCount`]: '125',
                    [`${ORDER_CUBE}.clickSales`]: '3596.25',
                },
                {
                    [`${ORDER_CUBE}.campaignId`]: 'campaign2',
                    [`${ORDER_CUBE}.gmv`]: '12345.67',
                    [`${ORDER_CUBE}.influencedRevenueUplift`]: '65.78',
                    [`${ORDER_CUBE}.ticketSales`]: '1234.47',
                    [`${ORDER_CUBE}.ticketSalesCount`]: '78',
                    [`${ORDER_CUBE}.discountSales`]: '4567.65',
                    [`${ORDER_CUBE}.discountSalesCount`]: '125',
                    [`${ORDER_CUBE}.clickSales`]: '3596.25',
                },
            ],
        } as CubeResponse
        const mockCampaignOrdersPerformance = jest
            .spyOn(cubeQueries, 'getCampaignOrderPerformanceData')
            .mockReturnValue(
                new Promise((resolve) => resolve(campaignOrdersPerformanceData))
            )

        const campaignEventsOrdersPerformanceData = {
            data: [
                {
                    [`${CAMPAIGN_ORDER_CUBE}.campaignId`]: 'campaign1',
                    [`${CAMPAIGN_ORDER_CUBE}.engagement`]: '357',
                    [`${CAMPAIGN_ORDER_CUBE}.campaignCTR`]: '12.78',
                    [`${CAMPAIGN_ORDER_CUBE}.uniqueConversions`]: '125',
                    [`${CAMPAIGN_ORDER_CUBE}.totalConversionRate`]: '7.49',
                    [`${CAMPAIGN_ORDER_CUBE}.uniqueCampaignClicksConverted`]:
                        '117',
                },
                {
                    [`${CAMPAIGN_ORDER_CUBE}.campaignId`]: 'campaign2',
                    [`${CAMPAIGN_ORDER_CUBE}.engagement`]: '1357',
                    [`${CAMPAIGN_ORDER_CUBE}.campaignCTR`]: '11.25',
                    [`${CAMPAIGN_ORDER_CUBE}.uniqueConversions`]: '358',
                    [`${CAMPAIGN_ORDER_CUBE}.totalConversionRate`]: '9.87',
                    [`${CAMPAIGN_ORDER_CUBE}.uniqueCampaignClicksConverted`]:
                        '248',
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
            mockCampaignEventsOrdersPerformance.mockClear()
            mockCampaignTicketsPerformance.mockClear()
        })

        it('should return empty array if no campaignIds', async () => {
            // act
            const result = await getCampaignsPerformance(
                '2023-01-01T00:00:00-08:00',
                '2023-02-01T00:00:00-08:00',
                []
            )

            // assert
            expect(result).toEqual({})
        })

        it('should return prepared data for campaign performance table', async () => {
            // act
            const result = await getCampaignsPerformance(
                '2023-01-01T00:00:00-08:00',
                '2023-02-01T00:00:00-08:00',
                ['campaign1', 'campaign2']
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
                ['campaign1', 'campaign2']
            )

            // assert
            expect(result).toMatchSnapshot()
        })
    })
})
