import { assumeMock, renderHook } from '@repo/testing'

import type {
    TimeSeriesDataItem,
    TimeSeriesResult,
} from 'domains/reporting/hooks/useTimeSeries'
import { useTimeSeries } from 'domains/reporting/hooks/useTimeSeries'
import { LogicalOperatorEnum } from 'domains/reporting/pages/common/components/Filter/constants'
import {
    CampaignOrderEventsMeasure,
    OrderConversionMeasure,
} from 'domains/reporting/pages/convert/clients/constants'
import useCampaignPerformanceTimeSeries from 'domains/reporting/pages/convert/hooks/stats/useCampaignPerformanceTimeSeries'

jest.mock('domains/reporting/hooks/useTimeSeries')
const useTimeSeriesMock = assumeMock(useTimeSeries)

describe('useCampaignPerformanceTimeSeries', () => {
    const defaultTimeSeries = {
        data: [[]] as TimeSeriesDataItem[][],
        isFetching: false,
        isError: false,
    } as TimeSeriesResult

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
        useTimeSeriesMock.mockReturnValue(defaultTimeSeries)
    })

    it('returns data', () => {
        useTimeSeriesMock.mockReturnValueOnce({
            ...defaultTimeSeries,
            isError: true,
        })

        const { result } = renderHook(() =>
            useCampaignPerformanceTimeSeries(...hookArgs),
        )

        expect(result.current.isError).toBe(true)
    })

    it('should return data', () => {
        useTimeSeriesMock.mockReturnValueOnce({
            ...defaultTimeSeries,
            data: [
                [
                    {
                        dateTime: '2024-09-18T00:00:00.000',
                        value: 1000,
                        label: CampaignOrderEventsMeasure.impressions,
                    },
                ],
            ],
        })

        useTimeSeriesMock.mockReturnValueOnce({
            ...defaultTimeSeries,
            data: [
                [
                    {
                        dateTime: '2024-09-18T00:00:00.000',
                        value: 1000,
                        label: OrderConversionMeasure.campaignSalesCount,
                    },
                ],
            ],
        })

        const { result } = renderHook(() =>
            useCampaignPerformanceTimeSeries(...hookArgs),
        )

        expect(useTimeSeriesMock).toHaveBeenCalledTimes(2)
        expect(useTimeSeriesMock).toHaveBeenCalledWith(
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
            expect.objectContaining({
                measures: ['impressions'],
                order: [['createdDatetime', 'asc']],
                timezone: 'UTC',
            }),
        )
        expect(useTimeSeriesMock).toHaveBeenCalledWith(
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
        )

        expect(result.current).toEqual({
            data: {
                impressionsSeries: [
                    [
                        {
                            dateTime: '2024-09-18T00:00:00.000',
                            label: CampaignOrderEventsMeasure.impressions,
                            value: 1000,
                        },
                    ],
                ],
                ordersCountSeries: [
                    [
                        {
                            dateTime: '2024-09-18T00:00:00.000',
                            label: OrderConversionMeasure.campaignSalesCount,
                            value: 1000,
                        },
                    ],
                ],
            },
            isError: false,
            isFetching: false,
        })
    })
})
