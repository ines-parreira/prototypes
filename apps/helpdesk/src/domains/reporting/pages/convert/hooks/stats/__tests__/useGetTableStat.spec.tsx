import { assumeMock, renderHook } from '@repo/testing'
import type { UseQueryResult } from '@tanstack/react-query'

import { METRIC_NAMES } from 'domains/reporting/hooks/metricNames'
import {
    fetchPostReporting,
    usePostReporting,
} from 'domains/reporting/models/queries'
import { LogicalOperatorEnum } from 'domains/reporting/pages/common/components/Filter/constants'
import {
    CampaignOrderEventsDimension,
    CampaignOrderEventsMeasure,
    EventsDimension,
    EventsMeasure,
    OrderConversionDimension,
    OrderConversionMeasure,
    SharedDimension,
} from 'domains/reporting/pages/convert/clients/constants'
import type { GroupDimension } from 'domains/reporting/pages/convert/clients/types'
import {
    fetchGetTableStat,
    useGetTableStat,
} from 'domains/reporting/pages/convert/hooks/stats/useGetTableStat'
import { getDataFromResult } from 'domains/reporting/pages/convert/services/CampaignMetricsHelper'

jest.mock('domains/reporting/models/queries')
const usePostReportingMock = assumeMock(usePostReporting)
const fetchPostReportingMock = assumeMock(fetchPostReporting)

describe('GetTableStat', () => {
    const defaultReporting = {
        isFetching: false,
        isError: false,
    } as UseQueryResult

    const hookArgs: {
        groupDimension: GroupDimension
        namespacedShopName: string
        campaignIds: string[] | null
        campaignsOperator?: LogicalOperatorEnum
        startDate: string
        endDate: string
        timezone: string
        enabled?: boolean
    } = {
        groupDimension: SharedDimension.campaignId,
        namespacedShopName: 'shopify:slow-formulas-for-sale',
        campaignIds: ['campaign1', 'campaign2'],
        campaignsOperator: LogicalOperatorEnum.ONE_OF,
        startDate: '2023-02-01T00:00:00-08:00',
        endDate: '2023-04-01T00:00:00-08:00',
        timezone: 'America/Los_Angeles',
        enabled: true,
    }

    const campaignEventsPerformanceData = [
        {
            [EventsDimension.campaignId]: 'campaign1',
            [EventsMeasure.impressions]: '234',
            [EventsMeasure.firstCampaignDisplay]: '2023-03-10T00:00:00.000',
            [EventsMeasure.lastCampaignDisplay]: '2023-03-11T00:00:00.000',
            [EventsMeasure.clicks]: '24',
            [EventsMeasure.clicksRate]: '10.20',
            [EventsMeasure.ticketsCreated]: '157',
        },
        {
            [EventsDimension.campaignId]: 'campaign2',
            [EventsMeasure.impressions]: '567',
            [EventsMeasure.firstCampaignDisplay]: '2023-03-11T00:00:00.000',
            [EventsMeasure.lastCampaignDisplay]: '2023-03-12T00:00:00.000',
            [EventsMeasure.clicks]: '57',
            [EventsMeasure.clicksRate]: '21.34',
            [EventsMeasure.ticketsCreated]: '357',
        },
    ]

    const campaignOrdersPerformanceData = [
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
    ]

    const totalStoreData = [
        {
            [OrderConversionMeasure.gmv]: '12345.67',
        },
    ]

    const campaignEventsOrdersPerformanceData = [
        {
            [CampaignOrderEventsDimension.campaignId]: 'campaign1',
            [CampaignOrderEventsMeasure.engagement]: '514',
            [CampaignOrderEventsMeasure.campaignCTR]: '12.78',
            [CampaignOrderEventsMeasure.totalConversionRate]: '7.49',
        },
        {
            [CampaignOrderEventsDimension.campaignId]: 'campaign2',
            [CampaignOrderEventsMeasure.engagement]: '1714',
            [CampaignOrderEventsMeasure.campaignCTR]: '11.25',
            [CampaignOrderEventsMeasure.totalConversionRate]: '9.87',
        },
    ]

    const requestPayload = [
        [
            [
                {
                    metricName:
                        METRIC_NAMES.CONVERT_CAMPAIGN_EVENTS_PERFORMANCE,
                    dimensions: ['CampaignEvents.campaignId'],
                    filters: [
                        {
                            member: 'CampaignEvents.periodStart',
                            operator: 'afterDate',
                            values: ['2023-02-01T00:00:00.000'],
                        },
                        {
                            member: 'CampaignEvents.periodEnd',
                            operator: 'beforeDate',
                            values: ['2023-04-01T00:00:00.000'],
                        },
                        {
                            member: 'CampaignEvents.campaignId',
                            operator: 'equals',
                            values: ['campaign1', 'campaign2'],
                        },
                    ],
                    measures: [
                        'CampaignEvents.impressions',
                        'CampaignEvents.firstCampaignDisplay',
                        'CampaignEvents.lastCampaignDisplay',
                        'CampaignEvents.clicks',
                        'CampaignEvents.clicksRate',
                        'CampaignEvents.ticketsCreated',
                    ],
                    segments: ['CampaignEvents.campaignEventsOnly'],
                    timezone: 'America/Los_Angeles',
                },
            ],
            {
                enabled: true,
                select: expect.any(Function),
            },
        ],
        [
            [
                {
                    metricName: METRIC_NAMES.CONVERT_CAMPAIGN_ORDER_PERFORMANCE,
                    dimensions: ['OrderConversion.campaignId'],
                    filters: [
                        {
                            member: 'OrderConversion.periodStart',
                            operator: 'afterDate',
                            values: ['2023-02-01T00:00:00.000'],
                        },
                        {
                            member: 'OrderConversion.periodEnd',
                            operator: 'beforeDate',
                            values: ['2023-04-01T00:00:00.000'],
                        },
                        {
                            member: 'OrderConversion.campaignId',
                            operator: 'equals',
                            values: ['campaign1', 'campaign2'],
                        },
                    ],
                    measures: [
                        'OrderConversion.campaignSales',
                        'OrderConversion.ticketSales',
                        'OrderConversion.ticketSalesCount',
                        'OrderConversion.discountSales',
                        'OrderConversion.discountSalesCount',
                        'OrderConversion.clickSales',
                        'OrderConversion.clickSalesCount',
                        'OrderConversion.campaignSalesCount',
                    ],
                    timezone: 'America/Los_Angeles',
                },
            ],
            {
                enabled: true,
                select: expect.any(Function),
            },
        ],
        [
            [
                {
                    metricName:
                        METRIC_NAMES.CONVERT_CAMPAIGN_EVENTS_ORDERS_PERFORMANCE,
                    dimensions: ['CampaignOrderEvents.campaignId'],
                    filters: [
                        {
                            member: 'CampaignOrderEvents.periodStart',
                            operator: 'afterDate',
                            values: ['2023-02-01T00:00:00.000'],
                        },
                        {
                            member: 'CampaignOrderEvents.periodEnd',
                            operator: 'beforeDate',
                            values: ['2023-04-01T00:00:00.000'],
                        },
                        {
                            member: 'CampaignOrderEvents.campaignId',
                            operator: 'equals',
                            values: ['campaign1', 'campaign2'],
                        },
                    ],
                    measures: [
                        'CampaignOrderEvents.engagement',
                        'CampaignOrderEvents.totalConversionRate',
                        'CampaignOrderEvents.campaignCTR',
                    ],
                    timezone: 'America/Los_Angeles',
                },
            ],
            {
                enabled: true,
                select: expect.any(Function),
            },
        ],
        [
            [
                {
                    metricName: METRIC_NAMES.CONVERT_STORE_REVENUE_TOTAL,
                    dimensions: [],
                    filters: [
                        {
                            member: 'OrderConversion.periodStart',
                            operator: 'afterDate',
                            values: ['2023-02-01T00:00:00.000'],
                        },
                        {
                            member: 'OrderConversion.periodEnd',
                            operator: 'beforeDate',
                            values: ['2023-04-01T00:00:00.000'],
                        },
                        {
                            member: 'OrderConversion.shopName',
                            operator: 'equals',
                            values: ['shopify:slow-formulas-for-sale'],
                        },
                    ],
                    measures: ['OrderConversion.gmv'],
                    timezone: 'America/Los_Angeles',
                },
            ],
            {
                enabled: true,
                select: expect.any(Function),
            },
        ],
    ]

    const preparedDataResponse = {
        data: {
            campaign1: {
                campaignSalesCount: 125,
                clickThroughRate: 12.78,
                clicks: 24,
                clicksConversionRate: 487.5,
                clicksConverted: 117,
                clicksRate: 10.2,
                clicksRevenue: 3596.25,
                discountCodesRevenue: 4567.65,
                discountCodesUsed: 125,
                engagement: 514,
                impressions: 234,
                ticketsConversionRate: 49.681528662420384,
                ticketsConverted: 78,
                ticketsCreated: 157,
                ticketsCreationRate: 67.09401709401709,
                ticketsRevenue: 1234.47,
                totalConversionRate: 7.49,
                totalRevenue: 12345.67,
                totalRevenueShare: 0,
            },
            campaign2: {
                campaignSalesCount: 358,
                clickThroughRate: 11.25,
                clicks: 57,
                clicksConversionRate: 435.08771929824564,
                clicksConverted: 248,
                clicksRate: 21.34,
                clicksRevenue: 3596.25,
                discountCodesRevenue: 4567.65,
                discountCodesUsed: 125,
                engagement: 1714,
                impressions: 567,
                ticketsConversionRate: 21.84873949579832,
                ticketsConverted: 78,
                ticketsCreated: 357,
                ticketsCreationRate: 62.96296296296296,
                ticketsRevenue: 1234.47,
                totalConversionRate: 9.87,
                totalRevenue: 12345.67,
                totalRevenueShare: 0,
            },
        },
        isError: false,
        isFetching: false,
    }

    const dataWithDefaultValuesResponse = {
        data: {
            campaign1: {
                campaignSalesCount: 0,
                clickThroughRate: 0,
                clicks: 24,
                clicksConversionRate: 0,
                clicksConverted: 0,
                clicksRate: 10.2,
                clicksRevenue: 0,
                discountCodesRevenue: 0,
                discountCodesUsed: 0,
                engagement: 0,
                impressions: 234,
                ticketsConversionRate: 0,
                ticketsConverted: 0,
                ticketsCreated: 157,
                ticketsCreationRate: 67.09401709401709,
                ticketsRevenue: 0,
                totalConversionRate: 0,
                totalRevenue: 0,
                totalRevenueShare: 0,
            },
            campaign2: {
                campaignSalesCount: 0,
                clickThroughRate: 0,
                clicks: 57,
                clicksConversionRate: 0,
                clicksConverted: 0,
                clicksRate: 21.34,
                clicksRevenue: 0,
                discountCodesRevenue: 0,
                discountCodesUsed: 0,
                engagement: 0,
                impressions: 567,
                ticketsConversionRate: 0,
                ticketsConverted: 0,
                ticketsCreated: 357,
                ticketsCreationRate: 62.96296296296296,
                ticketsRevenue: 0,
                totalConversionRate: 0,
                totalRevenue: 0,
                totalRevenueShare: 0,
            },
        },
        isError: false,
        isFetching: false,
    }

    describe('useGetTableStat', () => {
        beforeEach(() => {
            jest.resetAllMocks()
            usePostReportingMock.mockReturnValue(defaultReporting)
        })

        it('should return isFetching=true when one the queries is fetching', () => {
            // arrange
            usePostReportingMock.mockReturnValueOnce({
                ...defaultReporting,
                isFetching: true,
            })

            // act
            const { result } = renderHook(() => useGetTableStat(hookArgs))

            expect(result.current.isFetching).toBe(true)
        })

        it('should return isError=true when one the queries errored', () => {
            // arrange
            usePostReportingMock.mockReturnValueOnce({
                ...defaultReporting,
                isError: true,
            } as UseQueryResult)

            // act
            const { result } = renderHook(() => useGetTableStat(hookArgs))

            expect(result.current.isError).toBe(true)
        })

        it('should return prepared data for campaign performance table', () => {
            // arrange
            usePostReportingMock.mockReturnValueOnce({
                ...defaultReporting,
                data: campaignEventsPerformanceData,
            } as UseQueryResult)

            usePostReportingMock.mockReturnValueOnce({
                ...defaultReporting,
                data: campaignOrdersPerformanceData,
            } as UseQueryResult)

            usePostReportingMock.mockReturnValueOnce({
                ...defaultReporting,
                data: campaignEventsOrdersPerformanceData,
            } as UseQueryResult)

            usePostReportingMock.mockReturnValueOnce({
                ...defaultReporting,
                data: totalStoreData,
            } as UseQueryResult)

            // act
            const { result } = renderHook(() => useGetTableStat(hookArgs))

            // assert
            expect(usePostReportingMock.mock.calls).toEqual(requestPayload)
            expect(usePostReportingMock.mock.calls).toMatchSnapshot()
            // verify select function is passed
            expect(usePostReportingMock).toHaveBeenCalledWith(
                expect.anything(),
                expect.objectContaining({
                    select: getDataFromResult,
                }),
            )
            expect(result.current).toEqual(preparedDataResponse)
            expect(result.current).toMatchSnapshot()
        })

        it('should fill default values if data is missing', () => {
            // arrange
            // let's pretend only some metrics return data (tickets from mock and this one)
            usePostReportingMock.mockReturnValueOnce({
                ...defaultReporting,
                data: campaignEventsPerformanceData,
            } as UseQueryResult)

            // act
            const { result } = renderHook(() => useGetTableStat(hookArgs))

            // assert
            expect(usePostReportingMock.mock.calls).toEqual(requestPayload)
            expect(usePostReportingMock.mock.calls).toMatchSnapshot()
            expect(result.current).toEqual(dataWithDefaultValuesResponse)
            expect(result.current).toMatchSnapshot()
        })

        it('should not call query if campaignIds is null', () => {
            // arrange
            const args = {
                ...hookArgs,
                campaignIds: null,
            }

            // act
            const { result } = renderHook(() => useGetTableStat(args))

            // assert
            usePostReportingMock.mock.calls.map((call) => {
                expect(call[1]?.enabled).toBe(false)
            })
            expect(result.current.data).toMatchObject({})
        })
    })

    describe('fetchGetTableStat', () => {
        beforeEach(() => {
            fetchPostReportingMock.mockResolvedValue({
                data: defaultReporting,
            } as any)
        })

        it('should return isError=true when one the queries errored', async () => {
            fetchPostReportingMock.mockRejectedValue({
                ...defaultReporting,
                isError: true,
            } as any)

            const result = await fetchGetTableStat(hookArgs)

            expect(result.isError).toBe(true)
        })

        it('should return prepared data for campaign performance table', async () => {
            fetchPostReportingMock.mockResolvedValueOnce({
                data: {
                    ...defaultReporting,
                    data: campaignEventsPerformanceData,
                },
            } as any)
            fetchPostReportingMock.mockResolvedValueOnce({
                data: {
                    ...defaultReporting,
                    data: campaignOrdersPerformanceData,
                },
            } as any)
            fetchPostReportingMock.mockResolvedValueOnce({
                data: {
                    ...defaultReporting,
                    data: campaignEventsOrdersPerformanceData,
                },
            } as any)
            fetchPostReportingMock.mockResolvedValueOnce({
                data: {
                    ...defaultReporting,
                    data: totalStoreData,
                },
            } as any)

            const result = await fetchGetTableStat(hookArgs)

            expect(fetchPostReportingMock.mock.calls).toEqual(requestPayload)
            expect(result).toEqual(preparedDataResponse)
        })

        it('should fill default values if data is missing', async () => {
            // let's pretend only some metrics return data (tickets from mock and this one)
            fetchPostReportingMock.mockResolvedValueOnce({
                data: {
                    ...defaultReporting,
                    data: campaignEventsPerformanceData,
                },
            } as any)

            const result = await fetchGetTableStat(hookArgs)

            expect(fetchPostReportingMock.mock.calls).toEqual(requestPayload)
            expect(result).toEqual(dataWithDefaultValuesResponse)
        })

        it('should not call query if campaignIds is null', async () => {
            hookArgs.campaignIds = null

            const result = await fetchGetTableStat(hookArgs)

            fetchPostReportingMock.mock.calls.map((call) => {
                expect(call[1]?.enabled).toBe(false)
            })
            expect(result.data).toMatchObject({})
        })
    })
})
