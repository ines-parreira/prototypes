import moment from 'moment'
import {UseQueryResult} from '@tanstack/react-query'
import {renderHook} from '@testing-library/react-hooks'
import {assumeMock} from 'utils/testing'
import {usePostReporting} from 'models/reporting/queries'
import {VoiceCallMeasure} from 'models/reporting/cubes/VoiceCallCube'
import {StatsFilters} from 'models/stat/types'
import {voiceCallCountQueryFactory} from 'models/reporting/queryFactories/voice/voiceCall'
import {formatReportingQueryDate} from 'utils/reporting'
import {useVoiceCallCount} from '../useVoiceCallCount'

jest.mock('models/reporting/queries')
const usePostReportingMock = assumeMock(usePostReporting)

describe('useVoiceCallCount', () => {
    const statsFilters: StatsFilters = {
        period: {
            end_datetime: formatReportingQueryDate(moment()),
            start_datetime: formatReportingQueryDate(moment()),
        },
    }

    it('should usePostReporting with query and select', () => {
        usePostReportingMock.mockReturnValueOnce({
            data: [{[VoiceCallMeasure.VoiceCallCount]: '10'}],
        } as UseQueryResult)

        const results = renderHook(() => useVoiceCallCount(statsFilters, 'UTC'))

        expect(usePostReportingMock.mock.calls[0]).toEqual([
            [voiceCallCountQueryFactory(statsFilters, 'UTC', undefined)],
            {select: expect.any(Function)},
        ])
        expect(results.result.current).toEqual({
            total: 10,
            totalPages: 1,
        })
    })

    it('should usePostReporting with different page size', () => {
        usePostReportingMock.mockReturnValueOnce({
            data: [{[VoiceCallMeasure.VoiceCallCount]: '10'}],
            isFetching: true,
        } as UseQueryResult)

        const results = renderHook(() =>
            useVoiceCallCount(statsFilters, 'UTC', undefined, 5)
        )

        expect(results.result.current).toEqual({
            total: 10,
            totalPages: 2,
        })
    })

    it('should usePostReporting with error', () => {
        usePostReportingMock.mockReturnValueOnce({
            error: new Error('test'),
        } as UseQueryResult)

        const results = renderHook(() =>
            useVoiceCallCount(statsFilters, 'UTC', undefined, 5)
        )

        expect(results.result.current).toEqual({total: 0, totalPages: 0})
    })
})
