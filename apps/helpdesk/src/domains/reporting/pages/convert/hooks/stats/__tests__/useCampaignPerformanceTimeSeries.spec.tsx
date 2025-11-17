import { assumeMock, renderHook } from '@repo/testing'
import type { UseQueryResult } from '@tanstack/react-query'

import { usePostReportingV2 } from 'domains/reporting/models/queries'
import { LogicalOperatorEnum } from 'domains/reporting/pages/common/components/Filter/constants'
import {
    CampaignOrderEventsMeasure,
    OrderConversionMeasure,
} from 'domains/reporting/pages/convert/clients/constants'
import useCampaignPerformanceTimeSeries from 'domains/reporting/pages/convert/hooks/stats/useCampaignPerformanceTimeSeries'

jest.mock('domains/reporting/models/queries')
const usePostReportingMock = assumeMock(usePostReportingV2)

describe('useCampaignPerformanceTimeSeries', () => {
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

    beforeEach(() => {
        jest.resetAllMocks()
        usePostReportingMock.mockReturnValue(defaultReporting)
    })

    it('returns data', () => {
        usePostReportingMock.mockReturnValueOnce({
            ...defaultReporting,
            isError: true,
        } as UseQueryResult)

        const { result } = renderHook(() =>
            useCampaignPerformanceTimeSeries(...hookArgs),
        )

        expect(result.current.isError).toBe(true)
    })

    it('should return data', () => {
        usePostReportingMock.mockReturnValueOnce({
            ...defaultReporting,
            data: [
                {
                    dateTime: '2024-09-18T00:00:00.000',
                    value: 1000,
                    label: CampaignOrderEventsMeasure.impressions,
                },
            ],
        } as UseQueryResult)

        usePostReportingMock.mockReturnValueOnce({
            ...defaultReporting,
            data: [
                {
                    dateTime: '2024-09-18T00:00:00.000',
                    value: 1000,
                    label: OrderConversionMeasure.campaignSalesCount,
                },
            ],
        } as UseQueryResult)

        const { result } = renderHook(() =>
            useCampaignPerformanceTimeSeries(...hookArgs),
        )

        expect(usePostReportingMock).toHaveBeenCalledTimes(2)
        expect(usePostReportingMock).toHaveBeenCalledWith(
            [
                expect.objectContaining({
                    measures: ['CampaignOrderEvents.impressions'],
                    order: [['CampaignOrderEvents.createdDatetime', 'asc']],
                    timeDimensions: [
                        {
                            dateRange: [
                                '2024-09-16T00:00:00.000',
                                '2024-09-18T00:00:00.000',
                            ],
                            dimension: 'CampaignOrderEvents.createdDatetime',
                            granularity: 'day',
                        },
                    ],
                    timezone: 'UTC',
                }),
            ],
            undefined,
            expect.anything(),
        )
        expect(usePostReportingMock).toHaveBeenCalledWith(
            [
                expect.objectContaining({
                    measures: ['OrderConversion.campaignSalesCount'],
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
            ],
            undefined,
            expect.anything(),
        )

        expect(result.current).toEqual({
            data: {
                impressionsSeries: [
                    {
                        dateTime: '2024-09-18T00:00:00.000',
                        label: CampaignOrderEventsMeasure.impressions,
                        value: 1000,
                    },
                ],
                ordersCountSeries: [
                    {
                        dateTime: '2024-09-18T00:00:00.000',
                        label: OrderConversionMeasure.campaignSalesCount,
                        value: 1000,
                    },
                ],
            },
            isError: false,
            isFetching: false,
        })
    })
})
