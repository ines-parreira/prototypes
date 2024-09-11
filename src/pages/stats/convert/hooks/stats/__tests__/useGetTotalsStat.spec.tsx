import {UseQueryResult} from '@tanstack/react-query'
import {renderHook} from '@testing-library/react-hooks'
import {
    CampaignOrderEventsMeasure,
    OrderConversionMeasure,
} from 'pages/stats/convert/clients/constants'
import {assumeMock} from 'utils/testing'
import {usePostReporting} from 'models/reporting/queries'
import {useGetTotalsStat} from 'pages/stats/convert/hooks/stats/useGetTotalsStat'
import {getMetricFromCubeData} from 'pages/stats/convert/services/CampaignMetricsHelper'
import {LogicalOperatorEnum} from 'pages/stats/common/components/Filter/constants'

jest.mock('models/reporting/queries')
const usePostReportingMock = assumeMock(usePostReporting)

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
        string
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
    })

    it('should return isFetching=true when one the queries is fetching', () => {
        usePostReportingMock.mockReturnValueOnce({
            ...defaultReporting,
            isFetching: true,
        })

        const {result} = renderHook(() => useGetTotalsStat(...hookArgs))

        expect(result.current.isFetching).toBe(true)
    })

    it('should return isError=true when one the queries errored', () => {
        usePostReportingMock.mockReturnValueOnce({
            ...defaultReporting,
            isError: true,
        } as UseQueryResult)

        const {result} = renderHook(() => useGetTotalsStat(...hookArgs))

        expect(result.current.isError).toBe(true)
    })

    it('should not call query if campaignIds is null', () => {
        const args: typeof hookArgs = [...hookArgs]
        args[1] = null

        const {result} = renderHook(() => useGetTotalsStat(...args))

        usePostReportingMock.mock.calls.map((call) => {
            expect(call[1]?.enabled).toBe(false)
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
        // arrange
        usePostReportingMock.mockReturnValueOnce({
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
        const {result} = renderHook(() => useGetTotalsStat(...hookArgs))

        // assert
        expect(usePostReportingMock.mock.calls).toMatchSnapshot()
        // verify select function is passed
        expect(usePostReportingMock).toHaveBeenCalledWith(
            expect.anything(),
            expect.objectContaining({
                select: getMetricFromCubeData,
            })
        )
        expect(result.current).toMatchSnapshot()
    })
})
