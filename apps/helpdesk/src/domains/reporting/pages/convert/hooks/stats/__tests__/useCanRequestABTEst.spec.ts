import { assumeMock, renderHook } from '@repo/testing'
import type { UseQueryResult } from '@tanstack/react-query'

import { usePostReportingV2 } from 'domains/reporting/models/queries'
import { CampaignOrderEventsMeasure } from 'domains/reporting/pages/convert/clients/constants'
import { useCanRequestABTest } from 'domains/reporting/pages/convert/hooks/stats/useCanRequestABTest'
import { getMetricFromCubeData } from 'domains/reporting/pages/convert/services/CampaignMetricsHelper'

jest.useFakeTimers().setSystemTime(new Date('2024-04-08'))
jest.mock('domains/reporting/models/queries')
const usePostReportingMock = assumeMock(usePostReportingV2)

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

        const { result } = renderHook(() => useCanRequestABTest(...hookArgs))

        expect(result.current.isFetching).toBe(true)
    })

    it('should return isError=true when one the queries errored', () => {
        usePostReportingMock.mockReturnValueOnce({
            ...defaultReporting,
            isError: true,
        } as UseQueryResult)

        const { result } = renderHook(() => useCanRequestABTest(...hookArgs))

        expect(result.current.isError).toBe(true)
    })

    it('should return data', () => {
        usePostReportingMock.mockReturnValueOnce({
            ...defaultReporting,
            data: abTestCampaignEventData,
            isFetching: true,
        } as UseQueryResult)

        const { result } = renderHook(() => useCanRequestABTest(...hookArgs))

        expect(usePostReportingMock.mock.calls).toMatchSnapshot()
        expect(usePostReportingMock).toHaveBeenCalledWith(
            expect.anything(),
            expect.anything(),
            expect.objectContaining({
                select: getMetricFromCubeData,
            }),
        )
        expect(result.current).toMatchSnapshot()
    })
})
