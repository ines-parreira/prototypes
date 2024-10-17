import {UseQueryResult} from '@tanstack/react-query'
import {renderHook} from '@testing-library/react-hooks'
import {
    OrderConversionDimension,
    OrderConversionMeasure,
} from 'pages/stats/convert/clients/constants'
import {assumeMock} from 'utils/testing'
import {usePostReporting} from 'models/reporting/queries'
import {getDataFromResult} from 'pages/stats/convert/services/CampaignMetricsHelper'
import {useGetRevenueShareChart} from 'pages/stats/convert/hooks/stats/useGetRevenueShareChart'
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

        const {result} = renderHook(() => useGetRevenueShareChart(...hookArgs))

        expect(result.current.isFetching).toBe(true)
    })

    it('should return isError=true when one the queries errored', () => {
        usePostReportingMock.mockReturnValueOnce({
            ...defaultReporting,
            isError: true,
        } as UseQueryResult)

        const {result} = renderHook(() => useGetRevenueShareChart(...hookArgs))

        expect(result.current.isError).toBe(true)
    })

    it('should not call query if campaignIds is null', () => {
        const args: typeof hookArgs = [...hookArgs]
        args[1] = null

        const {result} = renderHook(() => useGetRevenueShareChart(...args))

        usePostReportingMock.mock.calls.map((call) => {
            expect(call[1]?.enabled).toBe(false)
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
        const {result} = renderHook(() => useGetRevenueShareChart(...hookArgs))

        // assert
        expect(usePostReportingMock.mock.calls).toMatchSnapshot()
        // verify select function is passed
        expect(usePostReportingMock).toHaveBeenCalledWith(
            expect.anything(),
            expect.objectContaining({
                select: getDataFromResult,
            })
        )
        expect(result.current).toMatchSnapshot()
    })
})
