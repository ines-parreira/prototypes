import { renderHook } from '@testing-library/react-hooks'

import {
    fetchTimeSeriesPerDimension,
    useTimeSeriesPerDimension,
} from 'hooks/reporting/useTimeSeries'
import {
    AIAgentInteractionsBySkillDatasetDimension,
    AIAgentInteractionsBySkillFilterMember,
    AIAgentInteractionsBySkillMeasure,
} from 'models/reporting/cubes/automate_v2/AIAgentIntercationsBySkillDatasetCube'
import { AIAgentInteractionsBySkillTimeSeriesQueryFactory } from 'models/reporting/queryFactories/automate_v2/timeseries'
import {
    ReportingFilterOperator,
    ReportingGranularity,
} from 'models/reporting/types'
import { StatsFilters } from 'models/stat/types'
import { formatReportingQueryDate } from 'utils/reporting'
import { assumeMock } from 'utils/testing'

import {
    fetchAIAgentInteractionsDatasetBySkillTimeSeries,
    useAIAgentInteractionsBySkillTimeSeries,
} from '../useAIAgentInteractionsBySkillTimeSeries'

jest.mock('hooks/reporting/useTimeSeries')
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
