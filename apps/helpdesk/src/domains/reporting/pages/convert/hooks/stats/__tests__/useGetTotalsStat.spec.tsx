import { assumeMock, renderHook } from '@repo/testing'
import type { UseQueryResult } from '@tanstack/react-query'

import {
    usePostReporting,
    usePostReportingV2,
} from 'domains/reporting/models/queries'
import { LogicalOperatorEnum } from 'domains/reporting/pages/common/components/Filter/constants'
import {
    CampaignOrderEventsMeasure,
    OrderConversionMeasure,
} from 'domains/reporting/pages/convert/clients/constants'
import { useGetTotalsStat } from 'domains/reporting/pages/convert/hooks/stats/useGetTotalsStat'
import { getMetricFromCubeData } from 'domains/reporting/pages/convert/services/CampaignMetricsHelper'

jest.mock('domains/reporting/models/queries')
const usePostReportingMock = assumeMock(usePostReporting)
const usePostReportingV2Mock = assumeMock(usePostReportingV2)

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
        string,
    ] = [
        'shopify:slow-formulas-for-sale',
        ['campaign231', 'campaign232'],
        LogicalOperatorEnum.ONE_OF,
        'EUR',
        '2023-01-01T00:00:00-08:00',
        '2023-02-01T00:00:00-08:00',
        'America/Los_Angeles',
    ]

    const campaignEventsTotalsData = {
        [CampaignOrderEventsMeasure.impressions]: '1000',
        [CampaignOrderEventsMeasure.engagement]: '500',
    }

    const campaignOrdersTotalsData = {
        [OrderConversionMeasure.campaignSales]: '2000',
        [OrderConversionMeasure.campaignSalesCount]: '10',
    }

    const storeTotalData = {
        [OrderConversionMeasure.gmv]: '3000',
    }

    beforeEach(() => {
        jest.resetAllMocks()
        usePostReportingMock.mockReturnValue(defaultReporting)
        usePostReportingV2Mock.mockReturnValue(defaultReporting)
    })

    it('should return isFetching=true when one the queries is fetching', () => {
        usePostReportingV2Mock.mockReturnValueOnce({
            ...defaultReporting,
            isFetching: true,
        })

        const { result } = renderHook(() => useGetTotalsStat(...hookArgs))

        expect(result.current.isFetching).toBe(true)
    })

    it('should return isError=true when one the queries errored', () => {
        usePostReportingV2Mock.mockReturnValueOnce({
            ...defaultReporting,
            isError: true,
        } as UseQueryResult)

        const { result } = renderHook(() => useGetTotalsStat(...hookArgs))

        expect(result.current.isError).toBe(true)
    })

    it('should not call query if campaignIds is null', () => {
        const args: typeof hookArgs = [...hookArgs]
        args[1] = null

        const { result } = renderHook(() => useGetTotalsStat(...args))

        usePostReportingMock.mock.calls.map((call) => {
            expect(call[1]?.enabled).toBe(false)
        })
        usePostReportingV2Mock.mock.calls.map((call) => {
            expect(call[2]?.enabled).toBe(false)
        })
        expect(result.current.data).toMatchObject({
            campaignSalesCount: '0',
            engagement: '0',
            gmv: '0',
            impressions: '0',
            influencedRevenueShare: '0',
            revenue: '0',
        })
    })

    it('should return prepared data for totals section', () => {
        usePostReportingV2Mock.mockReturnValueOnce({
            ...defaultReporting,
            data: campaignEventsTotalsData,
        } as UseQueryResult)

        usePostReportingMock.mockReturnValueOnce({
            ...defaultReporting,
            data: campaignOrdersTotalsData,
        } as UseQueryResult)

        usePostReportingMock.mockReturnValueOnce({
            ...defaultReporting,
            data: storeTotalData,
        } as UseQueryResult)

        // act
        const { result } = renderHook(() => useGetTotalsStat(...hookArgs))

        expect(usePostReportingV2Mock).toHaveBeenCalledWith(
            expect.arrayContaining([
                expect.objectContaining({
                    measures: [
                        'CampaignOrderEvents.impressions',
                        'CampaignOrderEvents.engagement',
                    ],
                    timezone: 'America/Los_Angeles',
                }),
            ]),
            expect.objectContaining({
                measures: ['impressions', 'engagement'],
                timezone: 'America/Los_Angeles',
            }),
            expect.objectContaining({
                enabled: true,
                select: getMetricFromCubeData,
            }),
        )
        expect(usePostReportingMock).toHaveBeenCalledWith(
            expect.arrayContaining([
                expect.objectContaining({
                    measures: [
                        'OrderConversion.campaignSales',
                        'OrderConversion.campaignSalesCount',
                    ],
                    timezone: 'America/Los_Angeles',
                }),
            ]),
            expect.objectContaining({
                enabled: true,
                select: getMetricFromCubeData,
            }),
        )
        expect(usePostReportingMock).toHaveBeenCalledWith(
            expect.arrayContaining([
                expect.objectContaining({
                    measures: ['OrderConversion.gmv'],
                    timezone: 'America/Los_Angeles',
                }),
            ]),
            expect.objectContaining({
                enabled: true,
                select: getMetricFromCubeData,
            }),
        )
        expect(result.current).toEqual({
            data: {
                campaignSalesCount: '10',
                engagement: '500',
                gmv: '€3,000',
                impressions: '1,000',
                influencedRevenueShare: '66.67%',
                revenue: '€2,000',
            },
            isError: false,
            isFetching: false,
        })
    })
})
