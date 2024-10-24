import {renderHook} from '@testing-library/react-hooks'
import moment from 'moment'

import {useResolutionCompletenessPerAgent} from 'hooks/reporting/support-performance/auto-qa/useResolutionCompletenessPerAgent'
import {useMetricPerDimension} from 'hooks/reporting/useMetricPerDimension'
import {resolutionCompletenessPerAgentQueryFactory} from 'models/reporting/queryFactories/auto-qa/resolutionCompletenessQueryFactory'
import {ReportingQuery} from 'models/reporting/types'
import {StatsFilters} from 'models/stat/types'
import {formatReportingQueryDate} from 'utils/reporting'
import {assumeMock} from 'utils/testing'

jest.mock('hooks/reporting/useMetricPerDimension')
const useMetricPerDimensionMock = assumeMock(useMetricPerDimension)

describe('useResolutionCompletenessPerAgent', () => {
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
            useResolutionCompletenessPerAgent(
                statsFilters,
                timezone,
                undefined,
                agentId
            )
        )

        expect(useMetricPerDimensionMock).toHaveBeenCalledWith(
            resolutionCompletenessPerAgentQueryFactory(
                statsFilters,
                timezone,
                undefined
            ),
            agentId
        )
    })
})
