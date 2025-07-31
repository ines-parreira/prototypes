import { renderHook } from '@repo/testing'
import moment from 'moment'

import {
    fetchScoredSurveys,
    useScoredSurveys,
} from 'domains/reporting/hooks/quality-management/satisfaction/useScoredSurveys'
import {
    fetchMetricPerDimensionWithEnrichment,
    useMetricPerDimensionWithEnrichment,
} from 'domains/reporting/hooks/useMetricPerDimension'
import { TicketDimension } from 'domains/reporting/models/cubes/TicketCube'
import { TicketSatisfactionSurveyDimension } from 'domains/reporting/models/cubes/TicketSatisfactionSurveyCube'
import { scoredSurveysQueryFactory } from 'domains/reporting/models/queryFactories/satisfaction/scoredSurveysQueryFactory'
import { StatsFilters } from 'domains/reporting/models/stat/types'
import { EnrichmentFields } from 'domains/reporting/models/types'
import { formatReportingQueryDate } from 'domains/reporting/utils/reporting'
import { assumeMock } from 'utils/testing'

jest.mock('domains/reporting/hooks/useMetricPerDimension')
const useMetricPerDimensionWithEnrichmentMock = assumeMock(
    useMetricPerDimensionWithEnrichment,
)
const fetchMetricPerDimensionWithEnrichmentMock = assumeMock(
    fetchMetricPerDimensionWithEnrichment,
)

const mockData = {
    isFetching: false,
    isError: false,
    data: {
        allData: [
            {
                [TicketDimension.TicketId]: '123',
                [TicketDimension.SurveyScore]: '2',
                [TicketSatisfactionSurveyDimension.SurveyCustomerId]:
                    '602166910',
                [TicketSatisfactionSurveyDimension.SurveyComment]:
                    "didn't understand the issue at all?",
                [TicketSatisfactionSurveyDimension.SurveyScoredDatetime]:
                    '2025-02-16T09:27:09.000',
                [EnrichmentFields.CustomerName]: 'Alice',
                [EnrichmentFields.AssigneeName]: 'John Doe',
            },
            {
                [TicketDimension.TicketId]: '223',
                [TicketDimension.SurveyScore]: '5',
                [TicketSatisfactionSurveyDimension.SurveyCustomerId]:
                    '702564323',
                [TicketSatisfactionSurveyDimension.SurveyComment]:
                    'Thanks a lot?',
                [TicketSatisfactionSurveyDimension.SurveyScoredDatetime]:
                    '2025-02-16T09:27:09.000',
                [EnrichmentFields.CustomerName]: 'Bob',
                [EnrichmentFields.AssigneeName]: 'John Doe',
            },
        ],
    },
} as any

describe('ScoredSurveys', () => {
    const periodStart = formatReportingQueryDate(moment())
    const periodEnd = formatReportingQueryDate(moment())
    const statsFilters: StatsFilters = {
        period: {
            end_datetime: periodEnd,
            start_datetime: periodStart,
        },
    }
    const timezone = 'someTimeZone'
    const limit = 5

    describe('useScoredSurveys', () => {
        beforeEach(() => {
            useMetricPerDimensionWithEnrichmentMock.mockReturnValue(mockData)

            fetchMetricPerDimensionWithEnrichmentMock.mockResolvedValue(
                Promise.resolve(mockData),
            )
        })
        it('should pass query factories with 3 arguments', () => {
            renderHook(() => useScoredSurveys(statsFilters, timezone, limit))

            expect(
                useMetricPerDimensionWithEnrichmentMock,
            ).toHaveBeenCalledWith(
                scoredSurveysQueryFactory(statsFilters, timezone, limit),
                [EnrichmentFields.CustomerName, EnrichmentFields.AssigneeName],
                EnrichmentFields.TicketId,
            )
        })

        it('should format data', () => {
            const { result } = renderHook(() =>
                useScoredSurveys(statsFilters, timezone, limit),
            )

            expect(result.current).toEqual({
                data: [
                    {
                        ticketId: '123',
                        surveyScore: '2',
                        comment: "didn't understand the issue at all?",
                        assignee: 'John Doe',
                        customerName: 'Alice',
                        surveyCustomerId: '602166910',
                        surveyScoredDate: '2025-02-16T09:27:09.000',
                    },
                    {
                        ticketId: '223',
                        surveyScore: '5',
                        comment: 'Thanks a lot?',
                        assignee: 'John Doe',
                        customerName: 'Bob',
                        surveyCustomerId: '702564323',
                        surveyScoredDate: '2025-02-16T09:27:09.000',
                    },
                ],
                isFetching: false,
                isError: false,
            })
        })

        it('should fallback to null when there is no data for specific field', () => {
            useMetricPerDimensionWithEnrichmentMock.mockReturnValue({
                isFetching: false,
                isError: false,
                data: {
                    allData: [
                        {
                            [TicketDimension.TicketId]: '',
                            [TicketDimension.SurveyScore]: '',
                            [TicketSatisfactionSurveyDimension.SurveyCustomerId]:
                                '',
                            [TicketSatisfactionSurveyDimension.SurveyComment]:
                                '',
                            [TicketSatisfactionSurveyDimension.SurveyScoredDatetime]:
                                '',
                            [EnrichmentFields.CustomerName]: '',
                            [EnrichmentFields.AssigneeName]: '',
                        },
                    ],
                },
            } as any)

            const { result } = renderHook(() =>
                useScoredSurveys(statsFilters, timezone, limit),
            )

            expect(result.current).toEqual({
                data: [
                    {
                        ticketId: null,
                        surveyScore: null,
                        comment: null,
                        assignee: null,
                        customerName: null,
                        surveyCustomerId: null,
                        surveyScoredDate: null,
                    },
                ],
                isFetching: false,
                isError: false,
            })
        })
    })

    describe('fetchScoredSurveys', () => {
        it('should pass query factories with 3 arguments', async () => {
            await fetchScoredSurveys(statsFilters, timezone, limit)

            expect(
                fetchMetricPerDimensionWithEnrichmentMock,
            ).toHaveBeenCalledWith(
                scoredSurveysQueryFactory(statsFilters, timezone, limit),
                [EnrichmentFields.CustomerName, EnrichmentFields.AssigneeName],
                EnrichmentFields.TicketId,
            )
        })

        it('should handle error when rejected', async () => {
            fetchMetricPerDimensionWithEnrichmentMock.mockRejectedValueOnce({})
            const res = await fetchScoredSurveys(statsFilters, timezone)

            expect(res).toEqual({
                data: null,
                isError: true,
                isFetching: false,
            })
        })

        it('should format data', async () => {
            const res = await fetchScoredSurveys(statsFilters, timezone, limit)

            expect(res).toEqual({
                data: [
                    {
                        ticketId: '123',
                        surveyScore: '2',
                        comment: "didn't understand the issue at all?",
                        assignee: 'John Doe',
                        customerName: 'Alice',
                        surveyCustomerId: '602166910',
                        surveyScoredDate: '2025-02-16T09:27:09.000',
                    },
                    {
                        ticketId: '223',
                        surveyScore: '5',
                        comment: 'Thanks a lot?',
                        assignee: 'John Doe',
                        customerName: 'Bob',
                        surveyCustomerId: '702564323',
                        surveyScoredDate: '2025-02-16T09:27:09.000',
                    },
                ],
                isFetching: false,
                isError: false,
            })
        })

        it('should fallback to null when there is no data for specific field', async () => {
            fetchMetricPerDimensionWithEnrichmentMock.mockResolvedValue({
                isFetching: false,
                isError: false,
                data: {
                    allData: [
                        {
                            [TicketDimension.TicketId]: '',
                            [TicketDimension.SurveyScore]: '',
                            [TicketSatisfactionSurveyDimension.SurveyCustomerId]:
                                '',
                            [TicketSatisfactionSurveyDimension.SurveyComment]:
                                '',
                            [TicketSatisfactionSurveyDimension.SurveyScoredDatetime]:
                                '',
                            [EnrichmentFields.CustomerName]: '',
                            [EnrichmentFields.AssigneeName]: '',
                        },
                    ],
                },
            } as any)

            const res = await fetchScoredSurveys(statsFilters, timezone, limit)

            expect(res).toEqual({
                data: [
                    {
                        ticketId: null,
                        surveyScore: null,
                        comment: null,
                        assignee: null,
                        customerName: null,
                        surveyCustomerId: null,
                        surveyScoredDate: null,
                    },
                ],
                isFetching: false,
                isError: false,
            })
        })
    })
})
