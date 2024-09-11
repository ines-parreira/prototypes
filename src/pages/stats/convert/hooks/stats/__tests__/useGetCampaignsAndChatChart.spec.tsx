import {UseQueryResult} from '@tanstack/react-query'
import {renderHook} from '@testing-library/react-hooks'
import moment from 'moment/moment'
import {
    CampaignOrderEventsDimension,
    CampaignOrderEventsMeasure,
} from 'pages/stats/convert/clients/constants'
import {assumeMock} from 'utils/testing'
import {usePostReporting} from 'models/reporting/queries'
import {getDataFromResult} from 'pages/stats/convert/services/CampaignMetricsHelper'
import {useGetCampaignsAndChatChart} from 'pages/stats/convert/hooks/stats/useGetCampaignsAndChatChart'
import {useTicketsPerformanceChart} from 'pages/stats/convert/hooks/stats/useGetTicketsPerformanceChart'
import {ReportingGranularity} from 'models/reporting/types'
import {CampaignGraphData} from 'pages/stats/convert/services/types'
import {LogicalOperatorEnum} from 'pages/stats/common/components/Filter/constants'

jest.mock('models/reporting/queries')
const usePostReportingMock = assumeMock(usePostReporting)

jest.mock('pages/stats/convert/hooks/stats/useGetTicketsPerformanceChart')
const useTicketsPerformanceChartMock = assumeMock(useTicketsPerformanceChart)

describe('useGetTotalsStat', () => {
    const defaultReporting = {
        isFetching: false,
        isError: false,
    } as UseQueryResult

    const startDate = '2023-02-28T00:00:00.000'
    const endDate = '2023-03-02T00:00:00.000'

    const hookArgs: [
        string,
        string[],
        LogicalOperatorEnum,
        string,
        string,
        number,
        string,
        ReportingGranularity
    ] = [
        'shopify:square-wheels-company',
        ['campaign1', 'campaign2'],
        LogicalOperatorEnum.ONE_OF,
        startDate,
        endDate,
        42,
        'America/Los_Angeles',
        ReportingGranularity.Day,
    ]

    const campaignsPerformanceGraphData = [
        {
            [CampaignOrderEventsMeasure.campaignCTR]: '12.32',
            [CampaignOrderEventsMeasure.totalConversionRate]: '13.25',
            [CampaignOrderEventsDimension.createdDatatime]: startDate,
            [`${CampaignOrderEventsDimension.createdDatatime}.day`]: startDate,
        },
    ]

    const ticketsPerformance = {
        isFetching: false,
        isError: false,
        data: {
            axes: {
                x: [
                    moment(startDate).unix(),
                    moment(endDate).subtract(1, 'day').unix(),
                ],
                y: [1, 2],
            },
            lines: [
                {
                    data: [125, 68], // tickets created
                },
                {
                    data: [12, 2], // tickets converted
                },
            ],
        } as CampaignGraphData,
    }

    beforeEach(() => {
        jest.resetAllMocks()
        useTicketsPerformanceChartMock.mockReturnValue(ticketsPerformance)
        usePostReportingMock.mockReturnValue(defaultReporting)
    })

    it('should return isFetching=true when one the queries is fetching', () => {
        usePostReportingMock.mockReturnValueOnce({
            ...defaultReporting,
            isFetching: true,
        })

        const {result} = renderHook(() =>
            useGetCampaignsAndChatChart(...hookArgs)
        )

        expect(result.current.isFetching).toBe(true)
    })

    it('should return isError=true when one the queries errored', () => {
        usePostReportingMock.mockReturnValueOnce({
            ...defaultReporting,
            isError: true,
        } as UseQueryResult)

        const {result} = renderHook(() =>
            useGetCampaignsAndChatChart(...hookArgs)
        )

        expect(result.current.isError).toBe(true)
    })

    it('should return prepared data for totals section', () => {
        // arrange
        usePostReportingMock.mockReturnValueOnce({
            ...defaultReporting,
            data: campaignsPerformanceGraphData,
        } as UseQueryResult)

        // act
        const {result} = renderHook(() =>
            useGetCampaignsAndChatChart(...hookArgs)
        )

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
