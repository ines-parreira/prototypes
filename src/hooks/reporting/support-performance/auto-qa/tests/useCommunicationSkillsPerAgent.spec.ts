import {renderHook} from '@testing-library/react-hooks'
import moment from 'moment'

import {
    fetchCommunicationSkillsPerAgent,
    useCommunicationSkillsPerAgent,
} from 'hooks/reporting/support-performance/auto-qa/useCommunicationSkillsPerAgent'
import {
    fetchMetricPerDimension,
    useMetricPerDimension,
} from 'hooks/reporting/useMetricPerDimension'
import {communicationSkillsPerAgentQueryFactory} from 'models/reporting/queryFactories/auto-qa/communicationSkillsQueryFactory'
import {StatsFilters} from 'models/stat/types'
import {formatReportingQueryDate} from 'utils/reporting'
import {assumeMock} from 'utils/testing'

jest.mock('hooks/reporting/useMetricPerDimension')
const useMetricPerDimensionMock = assumeMock(useMetricPerDimension)
const fetchMetricPerDimensionMock = assumeMock(fetchMetricPerDimension)

describe('CommunicationSkillsPerAgent', () => {
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

    describe('useCommunicationSkillsPerAgent', () => {
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

    describe('fetchCommunicationSkillsPerAgent', () => {
        it('should call perDimension hook with agent id', async () => {
            await fetchCommunicationSkillsPerAgent(
                statsFilters,
                timezone,
                undefined,
                agentId
            )

            expect(fetchMetricPerDimensionMock).toHaveBeenCalledWith(
                communicationSkillsPerAgentQueryFactory(
                    statsFilters,
                    timezone,
                    undefined
                ),
                agentId
            )
        })
    })
})
