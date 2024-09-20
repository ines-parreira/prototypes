import moment from 'moment'
import {renderHook} from '@testing-library/react-hooks'
import {useCommunicationSkillsPerAgent} from 'hooks/reporting/support-performance/auto-qa/useCommunicationSkillsPerAgent'
import {useMetricPerDimension} from 'hooks/reporting/useMetricPerDimension'
import {ReportingQuery} from 'models/reporting/types'
import {StatsFilters} from 'models/stat/types'
import {formatReportingQueryDate} from 'utils/reporting'
import {communicationSkillsPerAgentQueryFactory} from 'models/reporting/queryFactories/auto-qa/communicationSkillsQueryFactory'
import {assumeMock} from 'utils/testing'

jest.mock('hooks/reporting/useMetricPerDimension')
const useMetricPerDimensionMock = assumeMock(useMetricPerDimension)

describe('useCommunicationSkillsPerAgent', () => {
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
            useCommunicationSkillsPerAgent(
                statsFilters,
                timezone,
                undefined,
                agentId
            )
        )

        expect(useMetricPerDimensionMock).toHaveBeenCalledWith(
            communicationSkillsPerAgentQueryFactory(
                statsFilters,
                timezone,
                undefined
            ),
            agentId
        )
    })
})
