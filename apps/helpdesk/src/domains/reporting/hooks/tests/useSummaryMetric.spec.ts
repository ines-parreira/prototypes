import { assumeMock, getLastMockCall, renderHook } from '@repo/testing'

import { useSummaryMetric } from 'domains/reporting/hooks/useSummaryMetric'
import { VoiceCallSummaryMeasure } from 'domains/reporting/models/cubes/VoiceCallSummaryCube'
import { usePostReporting } from 'domains/reporting/models/queries'

jest.mock('domains/reporting/models/queries')
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
