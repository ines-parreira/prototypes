import { assumeMock, renderHook } from '@repo/testing'
import type { UseQueryResult } from '@tanstack/react-query'

import { usePostReportingV2 } from 'domains/reporting/models/queries'
import { LogicalOperatorEnum } from 'domains/reporting/pages/common/components/Filter/constants'
import {
    OrderConversionDimension,
    OrderConversionMeasure,
} from 'domains/reporting/pages/convert/clients/constants'
import useGetCampaignRevenueTimeSeries from 'domains/reporting/pages/convert/hooks/stats/useGetCampaignRevenueTimeSeries'
import { getDataFromResult } from 'domains/reporting/pages/convert/services/CampaignMetricsHelper'

jest.mock('domains/reporting/models/queries')
const usePostReportingMock = assumeMock(usePostReportingV2)

describe('useGetCampaignRevenueTimeSeries', () => {
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
        'shopify:awesome-shop',
        ['campaign1', 'campaign2'],
        LogicalOperatorEnum.ONE_OF,
        '2024-09-16T00:00:00',
        '2024-09-18T00:00:00',
        'UTC',
    ]

    const campaignRevenueData = [
        {
            [OrderConversionMeasure.campaignSales]: '1000',
            [OrderConversionDimension.createdDatatime]:
                '2024-09-18T00:00:00.000',
            [`${OrderConversionDimension.createdDatatime}.day`]:
                '2024-09-18T00:00:00.000',
        },
    ]

    beforeEach(() => {
        jest.resetAllMocks()
        usePostReportingMock.mockReturnValue(defaultReporting)
    })

    it('should return isError=true when one the queries errored', () => {
        usePostReportingMock.mockReturnValueOnce({
            ...defaultReporting,
            isError: true,
        } as UseQueryResult)

        const { result } = renderHook(() =>
            useGetCampaignRevenueTimeSeries(...hookArgs),
        )

        expect(result.current.isError).toBe(true)
    })

    it('should not call query if campaignIds is null', () => {
        const args: typeof hookArgs = [...hookArgs]
        args[1] = null

        const { result } = renderHook(() =>
            useGetCampaignRevenueTimeSeries(...args),
        )

        usePostReportingMock.mock.calls.map((call) => {
            expect(call[2]?.enabled).toBe(false)
        })
        expect(result.current.data).toMatchObject({})
    })

    it('should return prepared data for totals section', () => {
        usePostReportingMock.mockReturnValueOnce({
            ...defaultReporting,
            data: campaignRevenueData,
        } as UseQueryResult)

        usePostReportingMock.mockReturnValueOnce({
            ...defaultReporting,
            data: campaignRevenueData,
        } as UseQueryResult)

        const { result } = renderHook(() =>
            useGetCampaignRevenueTimeSeries(...hookArgs),
        )

        expect(usePostReportingMock).toBeCalledWith(
            expect.arrayContaining([
                expect.objectContaining({
                    dimensions: [],
                    filters: [
                        {
                            member: 'OrderConversion.periodStart',
                            operator: 'afterDate',
                            values: ['2024-09-16T00:00:00.000'],
                        },
                        {
                            member: 'OrderConversion.periodEnd',
                            operator: 'beforeDate',
                            values: ['2024-09-18T00:00:00.000'],
                        },
                        {
                            member: 'OrderConversion.campaignId',
                            operator: 'equals',
                            values: ['campaign1', 'campaign2'],
                        },
                        {
                            member: 'OrderConversion.shopName',
                            operator: 'equals',
                            values: ['shopify:awesome-shop'],
                        },
                    ],
                    measures: ['OrderConversion.campaignSales'],
                    order: [['OrderConversion.createdDatetime', 'asc']],
                    timeDimensions: [
                        {
                            dateRange: [
                                '2024-09-16T00:00:00.000',
                                '2024-09-18T00:00:00.000',
                            ],
                            dimension: 'OrderConversion.createdDatetime',
                            granularity: 'day',
                        },
                    ],
                    timezone: 'UTC',
                }),
            ]),
            {
                filters: [
                    {
                        member: 'periodStart',
                        operator: 'afterDate',
                        values: ['2024-09-16T00:00:00.000'],
                    },
                    {
                        member: 'periodEnd',
                        operator: 'beforeDate',
                        values: ['2024-09-18T00:00:00.000'],
                    },
                    {
                        member: 'campaignId',
                        operator: 'one-of',
                        values: ['campaign1', 'campaign2'],
                    },
                    {
                        member: 'shopName',
                        operator: 'one-of',
                        values: ['shopify:awesome-shop'],
                    },
                ],
                measures: ['campaignSales'],
                metricName: 'convert-revenue-share-graph',
                order: [['createdDatetime', 'asc']],
                scope: 'convert-order-conversion',
                time_dimensions: [
                    { dimension: 'createdDatetime', granularity: 'day' },
                ],
                timezone: 'UTC',
            },
            expect.objectContaining({ enabled: true }),
        )
        // verify select function is passed
        expect(usePostReportingMock).toHaveBeenCalledWith(
            expect.anything(),
            expect.anything(),
            expect.objectContaining({
                select: getDataFromResult,
            }),
        )
        expect(result.current).toEqual({
            data: [
                {
                    x: 'Sep 16th',
                    y: 0,
                },
                {
                    x: 'Sep 17th',
                    y: 0,
                },
                {
                    x: 'Sep 18th',
                    y: 1000,
                },
            ],
            isError: false,
            isFetching: false,
        })
    })
})
