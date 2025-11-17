import { assumeMock, renderHook } from '@repo/testing'
import moment from 'moment'

import { UserRole } from 'config/types/user'
import { useCommentHighlights } from 'domains/reporting/hooks/quality-management/satisfaction/useCommentHighlights'
import { useMetricPerDimensionWithEnrichment } from 'domains/reporting/hooks/useMetricPerDimension'
import { TicketDimension } from 'domains/reporting/models/cubes/TicketCube'
import { TicketSatisfactionSurveyDimension } from 'domains/reporting/models/cubes/TicketSatisfactionSurveyCube'
import { commentHighlightsQueryFactory } from 'domains/reporting/models/queryFactories/satisfaction/commentHighlightsQueryFactory'
import type { StatsFilters } from 'domains/reporting/models/stat/types'
import { EnrichmentFields } from 'domains/reporting/models/types'
import { formatReportingQueryDate } from 'domains/reporting/utils/reporting'
import useAppSelector from 'hooks/useAppSelector'
import { getHumanAndAutomationBotAgentsJS } from 'state/agents/selectors'
import { getTeamsMinimalWithEmojiJS } from 'state/teams/selectors'

jest.mock('domains/reporting/hooks/useMetricPerDimension')
const useMetricPerDimensionWithEnrichmentMock = assumeMock(
    useMetricPerDimensionWithEnrichment,
)

jest.mock('hooks/useAppSelector')
const useAppSelectorMock = assumeMock(useAppSelector)

describe('useCommentHighlights', () => {
    const agentsMockReturnedValues = [
        {
            id: 1,
            name: 'John Doe',
            meta: { profile_picture_url: 'http://image.url' },
            role: { name: UserRole.Bot },
        },
    ]

    const teamsMockReturnedValues = [
        {
            id: 1,
            name: 'Team A',
            nativeEmoji: '🚀',
        },
    ]

    const allDataDummy = [
        {
            [TicketDimension.TicketId]: '1',
            [TicketDimension.AssigneeUserId]: '1',
            [TicketSatisfactionSurveyDimension.SurveyCustomerId]: '10',
            [TicketDimension.SurveyScore]: '5',
            [TicketSatisfactionSurveyDimension.SurveyComment]: 'Great service',
            [TicketDimension.AssigneeTeamId]: '1',
            [EnrichmentFields.CustomerName]: 'Customer A',
        },
    ]

    const periodStart = formatReportingQueryDate(moment())
    const periodEnd = formatReportingQueryDate(moment())
    const statsFilters: StatsFilters = {
        period: {
            end_datetime: periodEnd,
            start_datetime: periodStart,
        },
    }
    const timezone = 'someTimeZone'
    const queryScores = ['1', '2', '3', '4', '5']

    const emptyMetricPerDimensionWithEnrichmentReturnValue = {
        isError: false,
        isFetching: false,
    }

    beforeEach(() => {
        useMetricPerDimensionWithEnrichmentMock.mockReturnValue(
            emptyMetricPerDimensionWithEnrichmentReturnValue as any,
        )

        useAppSelectorMock.mockImplementation((selector) => {
            if (selector === getHumanAndAutomationBotAgentsJS) {
                return agentsMockReturnedValues
            }
            if (selector === getTeamsMinimalWithEmojiJS) {
                return teamsMockReturnedValues
            }
            return null
        })
    })

    it('should pass query factories with three arguments and return empty data', () => {
        const { result } = renderHook(() =>
            useCommentHighlights(statsFilters, timezone, queryScores),
        )

        expect(useMetricPerDimensionWithEnrichmentMock).toHaveBeenCalledWith(
            commentHighlightsQueryFactory(statsFilters, timezone, queryScores),
            [EnrichmentFields.CustomerName, EnrichmentFields.AssigneeName],
            EnrichmentFields.TicketId,
        )
        expect(result.current).toEqual({
            isError: false,
            isFetching: false,
        })
    })

    it('should return fallback values when query does not return values', () => {
        const emptyAllDataDummy = [
            {
                [TicketDimension.TicketId]: '',
                [TicketDimension.AssigneeUserId]: '',
                [TicketDimension.SurveyScore]: '',
                [TicketSatisfactionSurveyDimension.SurveyComment]: '',
                [TicketDimension.AssigneeTeamId]: '',
                [EnrichmentFields.CustomerName]: '',
            },
        ]
        useMetricPerDimensionWithEnrichmentMock.mockReturnValue({
            ...emptyMetricPerDimensionWithEnrichmentReturnValue,
            data: { allData: emptyAllDataDummy } as any,
        })

        const { result } = renderHook(() =>
            useCommentHighlights(statsFilters, timezone, queryScores),
        )

        expect(result.current).toEqual({
            isFetching: false,
            isError: false,
            data: [
                {
                    assignedAgent: null,
                    assignedTeam: null,
                    comment: null,
                    customerName: null,
                    surveyScore: null,
                    ticketId: null,
                },
            ],
        })
    })

    it('should return data formatted when not loading and no error', () => {
        useMetricPerDimensionWithEnrichmentMock.mockReturnValue({
            ...emptyMetricPerDimensionWithEnrichmentReturnValue,
            data: { allData: allDataDummy } as any,
        })

        const { result } = renderHook(() =>
            useCommentHighlights(statsFilters, timezone, queryScores),
        )

        expect(result.current).toEqual({
            isFetching: false,
            isError: false,
            data: [
                {
                    ticketId: '1',
                    surveyScore: '5',
                    comment: 'Great service',
                    assignedAgent: {
                        name: 'John Doe',
                        url: 'http://image.url',
                        isBot: true,
                    },
                    customerName: 'Customer A',
                    assignedTeam: { name: 'Team A', emoji: '🚀' },
                },
            ],
        })
    })

    it('should return data formatted and assignedAgent.isBot should be false when UserRole is different than bot', () => {
        const adminAgentsMockReturnedValues = [
            {
                id: 1,
                name: 'John Doe',
                meta: { profile_picture_url: 'http://image.url' },
                role: { name: UserRole.Admin },
            },
        ]

        useAppSelectorMock.mockImplementation((selector) => {
            if (selector === getHumanAndAutomationBotAgentsJS) {
                return adminAgentsMockReturnedValues
            }
            if (selector === getTeamsMinimalWithEmojiJS) {
                return teamsMockReturnedValues
            }
            return null
        })

        useMetricPerDimensionWithEnrichmentMock.mockReturnValue({
            ...emptyMetricPerDimensionWithEnrichmentReturnValue,
            data: { allData: allDataDummy } as any,
        })

        const { result } = renderHook(() =>
            useCommentHighlights(statsFilters, timezone, queryScores),
        )

        expect(result.current).toEqual({
            isFetching: false,
            isError: false,
            data: [
                {
                    ticketId: '1',
                    surveyScore: '5',
                    comment: 'Great service',
                    assignedAgent: {
                        name: 'John Doe',
                        url: 'http://image.url',
                        isBot: false,
                    },
                    customerName: 'Customer A',
                    assignedTeam: { name: 'Team A', emoji: '🚀' },
                },
            ],
        })
    })
})
