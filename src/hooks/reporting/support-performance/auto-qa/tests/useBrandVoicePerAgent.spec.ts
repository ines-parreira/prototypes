import {renderHook} from '@testing-library/react-hooks'

import moment from 'moment'

import {useBrandVoicePerAgent} from 'hooks/reporting/support-performance/auto-qa/useBrandVoicePerAgent'
import {useMetricPerDimension} from 'hooks/reporting/useMetricPerDimension'
import {brandVoicePerAgentQueryFactory} from 'models/reporting/queryFactories/auto-qa/brandVoiceQueryFactory'

import {ReportingQuery} from 'models/reporting/types'
import {StatsFilters} from 'models/stat/types'
import {formatReportingQueryDate} from 'utils/reporting'
import {assumeMock} from 'utils/testing'

jest.mock('hooks/reporting/useMetricPerDimension')
const useMetricPerDimensionMock = assumeMock(useMetricPerDimension)

describe('useBrandVoicePerAgent', () => {
    const periodStart = formatReportingQueryDate(moment())
    const periodEnd = formatReportingQueryDate(moment())
    const agentId = '123'
    const statsFilters: StatsFilters = {
        period: {
            end_datetime: periodEnd,
            start_datetime: periodStart,
        },
    }
    const timezone = 'someTimeZone'

    useMetricPerDimensionMock.mockImplementation(
        ((queryCreator: ReportingQuery) => queryCreator) as any
    )

    it('should call perDimension hook with agent id', () => {
        renderHook(() =>
            useBrandVoicePerAgent(statsFilters, timezone, undefined, agentId)
        )

        expect(useMetricPerDimensionMock).toHaveBeenCalledWith(
            brandVoicePerAgentQueryFactory(statsFilters, timezone, undefined),
            agentId
        )
    })
})
