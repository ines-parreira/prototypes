import {UseQueryResult} from '@tanstack/react-query'
import {renderHook} from '@testing-library/react-hooks'
import {
    CampaignOrderEventsDimension,
    CampaignOrderEventsMeasure,
    EventsDimension,
    EventsMeasure,
    OrderConversionDimension,
    OrderConversionMeasure,
    SharedDimension,
} from 'pages/stats/convert/clients/constants'
import {assumeMock} from 'utils/testing'
import {usePostReporting} from 'models/reporting/queries'
import {useGetTableStat} from 'pages/stats/convert/hooks/stats/useGetTableStat'
import {getDataFromResult} from 'pages/stats/convert/services/CampaignMetricsHelper'
import {GroupDimension} from 'pages/stats/convert/clients/types'
import {LogicalOperatorEnum} from 'pages/stats/common/components/Filter/constants'

jest.mock('models/reporting/queries')
const usePostReportingMock = assumeMock(usePostReporting)

describe('useGetTableStat', () => {
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
        const {result} = renderHook(() => useGetTableStat(hookArgs))

        expect(result.current.isFetching).toBe(true)
    })

    it('should return isError=true when one the queries errored', () => {
        // arrange
        usePostReportingMock.mockReturnValueOnce({
            ...defaultReporting,
            isError: true,
        } as UseQueryResult)

        // act
        const {result} = renderHook(() => useGetTableStat(hookArgs))

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
        const {result} = renderHook(() => useGetTableStat(hookArgs))

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

    it('should fill default values if data is missing', () => {
        // arrange
        // let's pretend only some metrics return data (tickets from mock and this one)
        usePostReportingMock.mockReturnValueOnce({
            ...defaultReporting,
            data: campaignEventsPerformanceData,
        } as UseQueryResult)

        // act
        const {result} = renderHook(() => useGetTableStat(hookArgs))

        // assert
        expect(usePostReportingMock.mock.calls).toMatchSnapshot()
        expect(result.current).toMatchSnapshot()
    })

    it('should not call query if campaignIds is null', () => {
        // arrange
        hookArgs.campaignIds = null

        // act
        const {result} = renderHook(() => useGetTableStat(hookArgs))

        // assert
        usePostReportingMock.mock.calls.map((call) => {
            expect(call[1]?.enabled).toBe(false)
        })
        expect(result.current.data).toMatchObject({})
    })
})
