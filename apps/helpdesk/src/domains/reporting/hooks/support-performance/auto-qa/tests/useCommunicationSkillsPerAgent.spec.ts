import { assumeMock, renderHook } from '@repo/testing'
import moment from 'moment'

import {
    fetchCommunicationSkillsPerAgent,
    useCommunicationSkillsPerAgent,
} from 'domains/reporting/hooks/support-performance/auto-qa/useCommunicationSkillsPerAgent'
import {
    fetchMetricPerDimensionV2,
    useMetricPerDimensionV2,
} from 'domains/reporting/hooks/useMetricPerDimension'
import { communicationSkillsPerAgentQueryFactory } from 'domains/reporting/models/queryFactories/auto-qa/communicationSkillsQueryFactory'
import { communicationSkillsPerAgentQueryV2Factory } from 'domains/reporting/models/scopes/autoQA'
import type { StatsFilters } from 'domains/reporting/models/stat/types'
import { formatReportingQueryDate } from 'domains/reporting/utils/reporting'

jest.mock('domains/reporting/hooks/useMetricPerDimension')
const useMetricPerDimensionV2Mock = assumeMock(useMetricPerDimensionV2)
const fetchMetricPerDimensionV2Mock = assumeMock(fetchMetricPerDimensionV2)

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
                    agentId,
                ),
            )

            expect(useMetricPerDimensionV2Mock).toHaveBeenCalledWith(
                communicationSkillsPerAgentQueryFactory(
                    statsFilters,
                    timezone,
                    undefined,
                ),
                communicationSkillsPerAgentQueryV2Factory({
                    filters: statsFilters,
                    timezone,
                    sortDirection: undefined,
                }),
                agentId,
            )
        })
    })

    describe('fetchCommunicationSkillsPerAgent', () => {
        it('should call perDimension hook with agent id', async () => {
            await fetchCommunicationSkillsPerAgent(
                statsFilters,
                timezone,
                undefined,
                agentId,
            )

            expect(fetchMetricPerDimensionV2Mock).toHaveBeenCalledWith(
                communicationSkillsPerAgentQueryFactory(
                    statsFilters,
                    timezone,
                    undefined,
                ),
                communicationSkillsPerAgentQueryV2Factory({
                    filters: statsFilters,
                    timezone,
                    sortDirection: undefined,
                }),
                agentId,
            )
        })
    })
})
