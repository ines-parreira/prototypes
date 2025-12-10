import { assumeMock, renderHook } from '@repo/testing'
import moment from 'moment'

import {
    fetchLanguageProficiencyPerAgent,
    useLanguageProficiencyPerAgent,
} from 'domains/reporting/hooks/support-performance/auto-qa/useLanguageProficiencyPerAgent'
import {
    fetchMetricPerDimensionV2,
    useMetricPerDimensionV2,
} from 'domains/reporting/hooks/useMetricPerDimension'
import { languageProficiencyPerAgentQueryFactory } from 'domains/reporting/models/queryFactories/auto-qa/languageProficiencyQueryFactory'
import { languageProficiencyPerAgentQueryV2Factory } from 'domains/reporting/models/scopes/autoQA'
import type { StatsFilters } from 'domains/reporting/models/stat/types'
import { formatReportingQueryDate } from 'domains/reporting/utils/reporting'

jest.mock('domains/reporting/hooks/useMetricPerDimension')
const useMetricPerDimensionV2Mock = assumeMock(useMetricPerDimensionV2)
const fetchMetricPerDimensionV2Mock = assumeMock(fetchMetricPerDimensionV2)

describe('useLanguageProficiencyPerAgent', () => {
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

    describe('useLanguageProficiencyPerAgent', () => {
        it('should call perDimension hook with agent id', () => {
            renderHook(() =>
                useLanguageProficiencyPerAgent(
                    statsFilters,
                    timezone,
                    undefined,
                    agentId,
                ),
            )

            expect(useMetricPerDimensionV2Mock).toHaveBeenCalledWith(
                languageProficiencyPerAgentQueryFactory(
                    statsFilters,
                    timezone,
                    undefined,
                ),
                languageProficiencyPerAgentQueryV2Factory({
                    filters: statsFilters,
                    timezone,
                    sortDirection: undefined,
                }),
                agentId,
            )
        })
    })

    describe('fetchLanguageProficiencyPerAgent', () => {
        it('should call perDimension hook with agent id', async () => {
            await fetchLanguageProficiencyPerAgent(
                statsFilters,
                timezone,
                undefined,
                agentId,
            )

            expect(fetchMetricPerDimensionV2Mock).toHaveBeenCalledWith(
                languageProficiencyPerAgentQueryFactory(
                    statsFilters,
                    timezone,
                    undefined,
                ),
                languageProficiencyPerAgentQueryV2Factory({
                    filters: statsFilters,
                    timezone,
                    sortDirection: undefined,
                }),
                agentId,
            )
        })
    })
})
