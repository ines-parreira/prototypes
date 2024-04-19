import {UseQueryResult} from '@tanstack/react-query'
import {renderHook} from '@testing-library/react-hooks'
import {CampaignOrderEventsMeasure} from 'pages/stats/convert/clients/constants'
import {assumeMock} from 'utils/testing'
import {usePostReporting} from 'models/reporting/queries'
import {useCanRequestABTest} from 'pages/stats/convert/hooks/stats/useCanRequestABTest'
import {getMetricFromCubeData} from 'pages/stats/convert/services/CampaignMetricsHelper'

jest.useFakeTimers().setSystemTime(new Date('2024-04-08'))
jest.mock('models/reporting/queries')
const usePostReportingMock = assumeMock(usePostReporting)

describe('useCanRequestABTEst', () => {
    const defaultReporting = {
        isFetching: false,
        isError: false,
    } as UseQueryResult

    const hookArgs: [string] = ['shopify:test']

    const abTestCampaignEventData = {
        [CampaignOrderEventsMeasure.orderCount]: '2001',
        [CampaignOrderEventsMeasure.firstCampaignDisplay]:
            '2024-03-6T00:00:00.000',
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

        const {result} = renderHook(() => useCanRequestABTest(...hookArgs))

        expect(result.current.isFetching).toBe(true)
    })

    it('should return isError=true when one the queries errored', () => {
        usePostReportingMock.mockReturnValueOnce({
            ...defaultReporting,
            isError: true,
        } as UseQueryResult)

        const {result} = renderHook(() => useCanRequestABTest(...hookArgs))

        expect(result.current.isError).toBe(true)
    })

    it('should return data', () => {
        usePostReportingMock.mockReturnValueOnce({
            ...defaultReporting,
            data: abTestCampaignEventData,
            isFetching: true,
        } as UseQueryResult)

        const {result} = renderHook(() => useCanRequestABTest(...hookArgs))

        expect(usePostReportingMock.mock.calls).toMatchSnapshot()
        expect(usePostReportingMock).toHaveBeenCalledWith(
            expect.anything(),
            expect.objectContaining({
                select: getMetricFromCubeData,
            })
        )
        expect(result.current).toMatchSnapshot()
    })
})
