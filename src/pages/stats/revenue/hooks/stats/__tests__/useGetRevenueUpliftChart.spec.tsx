import {UseQueryResult} from '@tanstack/react-query'
import {renderHook} from '@testing-library/react-hooks'
import {
    OrderConversionDimension,
    OrderConversionMeasure,
} from 'pages/stats/revenue/clients/constants'
import {assumeMock} from 'utils/testing'
import {usePostReporting} from 'models/reporting/queries'
import {getDataFromResult} from 'pages/stats/revenue/services/CampaignMetricsHelper'
import {useGetRevenueUpliftChart} from 'pages/stats/revenue/hooks/stats/useGetRevenueUpliftChart'

jest.mock('models/reporting/queries')
const usePostReportingMock = assumeMock(usePostReporting)

describe('useGetTotalsStat', () => {
    const defaultReporting = {
        isFetching: false,
        isError: false,
    } as UseQueryResult

    const hookArgs: [string, string[], string, string] = [
        'shopify:square-wheels-company',
        ['campaign1', 'campaign2'],
        '2023-01-01T00:00:00-08:00',
        '2023-03-01T00:00:00-08:00',
    ]

    const revenueUpliftData = [
        {
            [OrderConversionMeasure.campaignSales]: '1000',
            [OrderConversionDimension.createdDatatime]:
                '2023-02-28T00:00:00.000',
            [`${OrderConversionDimension.createdDatatime}.day`]:
                '2023-02-28T00:00:00.000',
        },
    ]

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

        const {result} = renderHook(() => useGetRevenueUpliftChart(...hookArgs))

        expect(result.current.isFetching).toBe(true)
    })

    it('should return isError=true when one the queries errored', () => {
        usePostReportingMock.mockReturnValueOnce({
            ...defaultReporting,
            isError: true,
        } as UseQueryResult)

        const {result} = renderHook(() => useGetRevenueUpliftChart(...hookArgs))

        expect(result.current.isError).toBe(true)
    })

    it('should return prepared data for totals section', () => {
        // arrange
        usePostReportingMock.mockReturnValueOnce({
            ...defaultReporting,
            data: revenueUpliftData,
        } as UseQueryResult)

        usePostReportingMock.mockReturnValueOnce({
            ...defaultReporting,
            data: storeTotalData,
        } as UseQueryResult)

        // act
        const {result} = renderHook(() => useGetRevenueUpliftChart(...hookArgs))

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
