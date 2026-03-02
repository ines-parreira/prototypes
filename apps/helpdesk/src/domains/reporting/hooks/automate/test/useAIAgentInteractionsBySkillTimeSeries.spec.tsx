import { assumeMock, renderHook } from '@repo/testing'

import {
    fetchAIAgentInteractionsDatasetBySkillTimeSeries,
    useAIAgentInteractionsBySkillTimeSeries,
} from 'domains/reporting/hooks/automate/useAIAgentInteractionsBySkillTimeSeries'
import { METRIC_NAMES } from 'domains/reporting/hooks/metricNames'
import {
    fetchTimeSeriesPerDimension,
    useTimeSeriesPerDimension,
} from 'domains/reporting/hooks/useTimeSeries'
import {
    AIAgentInteractionsBySkillDatasetDimension,
    AIAgentInteractionsBySkillFilterMember,
    AIAgentInteractionsBySkillMeasure,
} from 'domains/reporting/models/cubes/automate_v2/AIAgentIntercationsBySkillDatasetCube'
import { AIAgentInteractionsBySkillTimeSeriesQueryFactory } from 'domains/reporting/models/queryFactories/automate_v2/timeseries'
import type { StatsFilters } from 'domains/reporting/models/stat/types'
import {
    ReportingFilterOperator,
    ReportingGranularity,
} from 'domains/reporting/models/types'
import { formatReportingQueryDate } from 'domains/reporting/utils/reporting'

jest.mock('domains/reporting/hooks/useTimeSeries')
const useTimeSeriesPerDimensionMock = assumeMock(useTimeSeriesPerDimension)
const fetchTimeSeriesPerDimensionMock = assumeMock(fetchTimeSeriesPerDimension)

describe('useAIAgentInteractionsBySkillTimeSeries', () => {
    const periodStart = '2025-05-29T00:00:00.000'
    const periodEnd = '2025-06-04T23:59:59.000'
    const statsFilters: StatsFilters = {
        period: {
            start_datetime: periodStart,
            end_datetime: periodEnd,
        },
    }
    const timezone = 'UTC'
    const granularity = ReportingGranularity.Day

    describe('useAIAgentInteractionsBySkillTimeSeries', () => {
        it('should call the right query factory', () => {
            renderHook(
                ({ statsFilters, timezone }) =>
                    useAIAgentInteractionsBySkillTimeSeries(
                        statsFilters,
                        timezone,
                        granularity,
                    ),
                { initialProps: { statsFilters, timezone, granularity } },
            )

            expect(useTimeSeriesPerDimensionMock.mock.calls[0]).toEqual([
                AIAgentInteractionsBySkillTimeSeriesQueryFactory(
                    statsFilters,
                    timezone,
                    granularity,
                ),
            ])
        })
    })

    describe('fetchAIAgentInteractionsDatasetBySkillTimeSeries', () => {
        it('should call the right query factory', async () => {
            await fetchAIAgentInteractionsDatasetBySkillTimeSeries(
                statsFilters,
                timezone,
                granularity,
            )

            expect(fetchTimeSeriesPerDimensionMock.mock.calls[0]).toEqual([
                AIAgentInteractionsBySkillTimeSeriesQueryFactory(
                    statsFilters,
                    timezone,
                    granularity,
                ),
            ])
        })
    })

    describe('AIAgentInteractionsBySkillTimeSeriesQueryFactory', () => {
        const result = AIAgentInteractionsBySkillTimeSeriesQueryFactory(
            statsFilters,
            timezone,
            granularity,
        )

        expect(result).toEqual({
            metricName:
                METRIC_NAMES.AUTOMATE_AI_AGENT_INTERACTIONS_BY_SKILL_TIMESERIES,
            dimensions: [
                AIAgentInteractionsBySkillDatasetDimension.BillableType,
            ],
            filters: [
                {
                    member: AIAgentInteractionsBySkillFilterMember.PeriodStart,
                    operator: ReportingFilterOperator.AfterDate,
                    values: [
                        formatReportingQueryDate(
                            statsFilters.period.start_datetime,
                        ),
                    ],
                },
                {
                    member: AIAgentInteractionsBySkillFilterMember.PeriodEnd,
                    operator: ReportingFilterOperator.BeforeDate,
                    values: [
                        formatReportingQueryDate(
                            statsFilters.period.end_datetime,
                        ),
                    ],
                },
            ],
            measures: [AIAgentInteractionsBySkillMeasure.Count],
            timeDimensions: [
                {
                    dateRange: [
                        '2025-05-29T00:00:00.000',
                        '2025-06-04T23:59:59.000',
                    ],
                    dimension:
                        AIAgentInteractionsBySkillDatasetDimension.AutomationEventCreatedDatetime,
                    granularity,
                },
            ],
            timezone: timezone,
        })
    })
})
