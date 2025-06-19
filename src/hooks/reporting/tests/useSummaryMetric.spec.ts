import { useSummaryMetric } from 'hooks/reporting/useSummaryMetric'
import { VoiceCallSummaryMeasure } from 'models/reporting/cubes/VoiceCallSummaryCube'
import { usePostReporting } from 'models/reporting/queries'
import { assumeMock, getLastMockCall } from 'utils/testing'
import { renderHook } from 'utils/testing/renderHook'

jest.mock('models/reporting/queries')
const usePostReportingMock = assumeMock(usePostReporting)

describe('useSummaryMetric', () => {
    const mockQuery = {
        measures: [
            VoiceCallSummaryMeasure.VoiceCallSummaryTotal,
            VoiceCallSummaryMeasure.VoiceCallSummaryAnsweredTotal,
        ],
        filters: [],
    }

    const mockResponse = {
        data: {
            data: [
                {
                    [VoiceCallSummaryMeasure.VoiceCallSummaryTotal]: '100',
                    [VoiceCallSummaryMeasure.VoiceCallSummaryAnsweredTotal]:
                        '80',
                    [VoiceCallSummaryMeasure.VoiceCallSummaryMissedTotal]: null,
                    [VoiceCallSummaryMeasure.VoiceCallSummaryAverageTalkTime]:
                        '0',
                },
            ],
        },
    }

    beforeEach(() => {
        usePostReportingMock.mockReturnValue({
            data: mockResponse,
            isLoading: false,
            isError: false,
            error: null,
        } as any)
    })

    it('should transform string values to numbers', async () => {
        renderHook(() => useSummaryMetric(mockQuery as any))

        const selectFn = getLastMockCall(usePostReportingMock)?.[1]?.select

        expect(selectFn?.(mockResponse as any)).toEqual({
            [VoiceCallSummaryMeasure.VoiceCallSummaryTotal]: 100,
            [VoiceCallSummaryMeasure.VoiceCallSummaryAnsweredTotal]: 80,
            [VoiceCallSummaryMeasure.VoiceCallSummaryMissedTotal]: null,
            [VoiceCallSummaryMeasure.VoiceCallSummaryAverageTalkTime]: 0,
        })
    })
})
