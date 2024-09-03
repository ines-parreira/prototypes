import moment from 'moment'
import {renderHook} from '@testing-library/react-hooks'
import {assumeMock} from 'utils/testing'
import {StatsFilters} from 'models/stat/types'
import {voiceCallCountQueryFactory} from 'models/reporting/queryFactories/voice/voiceCall'
import {formatReportingQueryDate} from 'utils/reporting'
import {useMetric} from 'hooks/reporting/useMetric'
import {useVoiceCallCountMetric} from '../useVoiceCallCountMetric'

jest.mock('hooks/reporting/useMetric')
const useMetricMock = assumeMock(useMetric)

describe('useVoiceCallCountMetric', () => {
    const statsFilters: StatsFilters = {
        period: {
            end_datetime: formatReportingQueryDate(moment()),
            start_datetime: formatReportingQueryDate(moment()),
        },
    }

    it('should useMetric with query and select', () => {
        useMetricMock.mockReturnValueOnce({
            data: 0,
        } as any)

        const results = renderHook(() =>
            useVoiceCallCountMetric(statsFilters, 'UTC')
        )

        expect(useMetricMock.mock.calls[0]).toEqual([
            voiceCallCountQueryFactory(statsFilters, 'UTC', undefined),
        ])
        expect(results.result.current).toEqual({
            data: 0,
        })
    })
})
