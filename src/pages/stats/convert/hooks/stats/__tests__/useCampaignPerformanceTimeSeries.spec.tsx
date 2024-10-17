import {UseQueryResult} from '@tanstack/react-query'
import {renderHook} from '@testing-library/react-hooks'
import {
    CampaignOrderEventsMeasure,
    OrderConversionMeasure,
} from 'pages/stats/convert/clients/constants'
import {assumeMock} from 'utils/testing'
import {usePostReporting} from 'models/reporting/queries'

import {LogicalOperatorEnum} from 'pages/stats/common/components/Filter/constants'

import useCampaignPerformanceTimeSeries from '../useCampaignPerformanceTimeSeries'

jest.mock('models/reporting/queries')
const usePostReportingMock = assumeMock(usePostReporting)

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

        const {result} = renderHook(() =>
            useCampaignPerformanceTimeSeries(...hookArgs)
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

        const {result} = renderHook(() =>
            useCampaignPerformanceTimeSeries(...hookArgs)
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
            expect.anything()
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
            expect.anything()
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
