import { assumeMock, renderHook } from '@repo/testing'
import type { UseQueryResult } from '@tanstack/react-query'

import { usePostReportingV2 } from 'domains/reporting/models/queries'
import { LogicalOperatorEnum } from 'domains/reporting/pages/common/components/Filter/constants'
import {
    OrderConversionDimension,
    OrderConversionMeasure,
} from 'domains/reporting/pages/convert/clients/constants'
import { useGetRevenueShareChart } from 'domains/reporting/pages/convert/hooks/stats/useGetRevenueShareChart'
import { getDataFromResult } from 'domains/reporting/pages/convert/services/CampaignMetricsHelper'

jest.mock('domains/reporting/models/queries')
const usePostReportingMock = assumeMock(usePostReportingV2)

describe('useGetTotalsStat', () => {
    const defaultReporting = {
        isFetching: false,
        isError: false,
    } as UseQueryResult

    const hookArgs: [
        string,
        string[] | null,
        LogicalOperatorEnum,
        string,
        string,
        string,
    ] = [
        'shopify:square-wheels-company',
        ['campaign1', 'campaign2'],
        LogicalOperatorEnum.ONE_OF,
        '2023-01-01T00:00:00-08:00',
        '2023-03-01T00:00:00-08:00',
        'America/Los_Angeles',
    ]

    const revenueShareData = [
        {
            [OrderConversionMeasure.campaignSales]: '1000',
            [OrderConversionDimension.createdDatatime]:
                '2023-02-28T00:00:00.000',
            [`${OrderConversionDimension.createdDatatime}.day`]:
                '2023-02-28T00:00:00.000',
        },
    ]

    const revenueData = [
        {
            [OrderConversionMeasure.gmv]: '3000',
            [OrderConversionDimension.createdDatatime]:
                '2023-02-28T00:00:00.000',
            [`${OrderConversionDimension.createdDatatime}.day`]:
                '2023-02-28T00:00:00.000',
        },
    ]

    beforeEach(() => {
        jest.resetAllMocks()
        usePostReportingMock.mockReturnValue(defaultReporting)
    })

    it('should return isFetching=true when one the queries is fetching', () => {
        usePostReportingMock.mockReturnValueOnce({
            ...defaultReporting,
            isFetching: true,
        })

        const { result } = renderHook(() =>
            useGetRevenueShareChart(...hookArgs),
        )

        expect(result.current.isFetching).toBe(true)
    })

    it('should return isError=true when one the queries errored', () => {
        usePostReportingMock.mockReturnValueOnce({
            ...defaultReporting,
            isError: true,
        } as UseQueryResult)

        const { result } = renderHook(() =>
            useGetRevenueShareChart(...hookArgs),
        )

        expect(result.current.isError).toBe(true)
    })

    it('should not call query if campaignIds is null', () => {
        const args: typeof hookArgs = [...hookArgs]
        args[1] = null

        const { result } = renderHook(() => useGetRevenueShareChart(...args))

        usePostReportingMock.mock.calls.map((call) => {
            expect(call[2]?.enabled).toBe(false)
        })
        expect(result.current.data).toMatchObject({})
    })

    it('should return prepared data for totals section', () => {
        // arrange
        usePostReportingMock.mockReturnValueOnce({
            ...defaultReporting,
            data: revenueShareData,
        } as UseQueryResult)

        usePostReportingMock.mockReturnValueOnce({
            ...defaultReporting,
            data: revenueData,
        } as UseQueryResult)

        // act
        const { result } = renderHook(() =>
            useGetRevenueShareChart(...hookArgs),
        )

        // assert
        expect(usePostReportingMock).toHaveBeenCalledWith(
            expect.arrayContaining([
                expect.objectContaining({
                    dimensions: [],
                    filters: [
                        {
                            member: 'OrderConversion.periodStart',
                            operator: 'afterDate',
                            values: ['2023-01-01T00:00:00.000'],
                        },
                        {
                            member: 'OrderConversion.periodEnd',
                            operator: 'beforeDate',
                            values: ['2023-03-01T00:00:00.000'],
                        },
                        {
                            member: 'OrderConversion.campaignId',
                            operator: 'equals',
                            values: ['campaign1', 'campaign2'],
                        },
                        {
                            member: 'OrderConversion.shopName',
                            operator: 'equals',
                            values: ['shopify:square-wheels-company'],
                        },
                    ],
                    measures: ['OrderConversion.campaignSales'],
                    order: [['OrderConversion.createdDatetime', 'asc']],
                    timeDimensions: [
                        {
                            dateRange: [
                                '2023-01-01T00:00:00.000',
                                '2023-03-01T00:00:00.000',
                            ],
                            dimension: 'OrderConversion.createdDatetime',
                            granularity: 'day',
                        },
                    ],
                    timezone: 'America/Los_Angeles',
                }),
            ]),
            {
                filters: [
                    {
                        member: 'periodStart',
                        operator: 'afterDate',
                        values: ['2023-01-01T00:00:00.000'],
                    },
                    {
                        member: 'periodEnd',
                        operator: 'beforeDate',
                        values: ['2023-03-01T00:00:00.000'],
                    },
                    {
                        member: 'campaignId',
                        operator: 'one-of',
                        values: ['campaign1', 'campaign2'],
                    },
                    {
                        member: 'shopName',
                        operator: 'one-of',
                        values: ['shopify:square-wheels-company'],
                    },
                ],
                measures: ['campaignSales'],
                metricName: 'convert-revenue-share-graph',
                order: [['createdDatetime', 'asc']],
                scope: 'convert-order-conversion',
                time_dimensions: [
                    { dimension: 'createdDatetime', granularity: 'day' },
                ],
                timezone: 'America/Los_Angeles',
            },
            expect.objectContaining({ enabled: true }),
        )
        expect(usePostReportingMock).toHaveBeenCalledWith(
            expect.anything(),
            expect.anything(),
            expect.objectContaining({
                select: getDataFromResult,
            }),
        )
        expect(result.current).toEqual({
            data: [{ x: 'Feb 28th', y: 33.33 }],
            isError: false,
            isFetching: false,
        })
    })
})
