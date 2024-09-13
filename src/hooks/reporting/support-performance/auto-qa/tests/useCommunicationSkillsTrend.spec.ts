import moment from 'moment'
import {renderHook} from '@testing-library/react-hooks'
import {OrderDirection} from 'models/api/types'
import {
    TicketQAScoreDimension,
    TicketQAScoreMeasure,
} from 'models/reporting/cubes/auto-qa/TicketQAScoreCube'
import {TicketDimension} from 'models/reporting/cubes/TicketCube'
import {ReportingFilterOperator, ReportingQuery} from 'models/reporting/types'
import {StatsFilters} from 'models/stat/types'
import {
    formatReportingQueryDate,
    getPreviousPeriod,
    statsFiltersToReportingFilters,
    TicketStatsFiltersMembers,
} from 'utils/reporting'
import {
    communicationSkillsDrillDownQueryFactory,
    communicationSkillsQueryFactory,
} from 'models/reporting/queryFactories/auto-qa/communicationSkillsQueryFactory'
import {assumeMock} from 'utils/testing'
import useMetricTrend from 'hooks/reporting/useMetricTrend'
import {useCommunicationSkillsTrend} from '../useCommunicationSkillsTrend'

jest.mock('hooks/reporting/useMetricTrend')
const useMetricTrendMock = assumeMock(useMetricTrend)

describe('communicationSkillsQueryFactory', () => {
    const periodStart = moment()
    const periodEnd = periodStart.add(7, 'days')
    const statsFilters: StatsFilters = {
        period: {
            end_datetime: periodEnd.toISOString(),
            start_datetime: periodStart.toISOString(),
        },
    }
    const timezone = 'someTimeZone'
    const sorting = OrderDirection.Desc

    it('should produce the query', () => {
        const query = communicationSkillsQueryFactory(statsFilters, timezone)

        expect(query).toEqual({
            measures: [TicketQAScoreMeasure.AverageScore],
            dimensions: [],
            segments: [],
            filters: [
                ...statsFiltersToReportingFilters(
                    TicketStatsFiltersMembers,
                    statsFilters
                ),
                {
                    member: TicketDimension.Status,
                    operator: ReportingFilterOperator.Equals,
                    values: ['closed'],
                },
                {
                    member: TicketQAScoreDimension.DimensionName,
                    operator: ReportingFilterOperator.Equals,
                    values: ['communication_skills'],
                },
            ],
            timezone,
        })
    })

    it('should produce the query with sorting', () => {
        const query = communicationSkillsQueryFactory(
            statsFilters,
            timezone,
            sorting
        )

        expect(query).toEqual({
            measures: [TicketQAScoreMeasure.AverageScore],
            dimensions: [],
            segments: [],
            filters: [
                ...statsFiltersToReportingFilters(
                    TicketStatsFiltersMembers,
                    statsFilters
                ),
                {
                    member: TicketDimension.Status,
                    operator: ReportingFilterOperator.Equals,
                    values: ['closed'],
                },
                {
                    member: TicketQAScoreDimension.DimensionName,
                    operator: ReportingFilterOperator.Equals,
                    values: ['communication_skills'],
                },
            ],
            timezone,
            order: [[TicketQAScoreMeasure.AverageScore, sorting]],
        })
    })
})

describe('communicationSkillsDrillDownQueryFactory', () => {
    const periodStart = moment()
    const periodEnd = periodStart.add(7, 'days')
    const statsFilters: StatsFilters = {
        period: {
            end_datetime: periodEnd.toISOString(),
            start_datetime: periodStart.toISOString(),
        },
    }
    const timezone = 'someTimeZone'
    const sorting = OrderDirection.Desc

    it('should produce the query', () => {
        const query = communicationSkillsDrillDownQueryFactory(
            statsFilters,
            timezone
        )

        expect(query).toEqual({
            measures: [TicketQAScoreMeasure.AverageScore],
            dimensions: [TicketDimension.TicketId],
            segments: [],
            filters: [
                ...statsFiltersToReportingFilters(
                    TicketStatsFiltersMembers,
                    statsFilters
                ),
                {
                    member: TicketDimension.Status,
                    operator: ReportingFilterOperator.Equals,
                    values: ['closed'],
                },
                {
                    member: TicketQAScoreDimension.DimensionName,
                    operator: ReportingFilterOperator.Equals,
                    values: ['communication_skills'],
                },
            ],
            timezone,
        })
    })

    it('should produce the query with sorting', () => {
        const query = communicationSkillsDrillDownQueryFactory(
            statsFilters,
            timezone,
            sorting
        )

        expect(query).toEqual({
            measures: [TicketQAScoreMeasure.AverageScore],
            dimensions: [TicketDimension.TicketId],
            segments: [],
            filters: [
                ...statsFiltersToReportingFilters(
                    TicketStatsFiltersMembers,
                    statsFilters
                ),
                {
                    member: TicketDimension.Status,
                    operator: ReportingFilterOperator.Equals,
                    values: ['closed'],
                },
                {
                    member: TicketQAScoreDimension.DimensionName,
                    operator: ReportingFilterOperator.Equals,
                    values: ['communication_skills'],
                },
            ],
            timezone,
            order: [[TicketQAScoreMeasure.AverageScore, sorting]],
        })
    })
})

describe('useCommunicationSkillsTrend', () => {
    const periodStart = formatReportingQueryDate(moment())
    const periodEnd = formatReportingQueryDate(moment())
    const statsFilters: StatsFilters = {
        period: {
            end_datetime: periodEnd,
            start_datetime: periodStart,
        },
    }
    const timezone = 'someTimeZone'

    useMetricTrendMock.mockImplementation(
        ((queryCreator: ReportingQuery) => queryCreator) as any
    )

    it('should pass query factories with two periods', () => {
        renderHook(() => useCommunicationSkillsTrend(statsFilters, timezone))

        expect(useMetricTrendMock).toHaveBeenCalledWith(
            communicationSkillsQueryFactory(statsFilters, timezone),
            communicationSkillsQueryFactory(
                {
                    ...statsFilters,
                    period: getPreviousPeriod(statsFilters.period),
                },
                timezone
            )
        )
    })
})
