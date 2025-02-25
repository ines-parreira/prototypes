import { renderHook } from '@testing-library/react-hooks'
import moment from 'moment'

import { UserRole } from 'config/types/user'
import { useCommentHighlights } from 'hooks/reporting/quality-management/satisfaction/useCommentHighlights'
import { useMetricPerDimensionWithEnrichment } from 'hooks/reporting/useMetricPerDimension'
import useAppSelector from 'hooks/useAppSelector'
import { TicketDimension } from 'models/reporting/cubes/TicketCube'
import { TicketSatisfactionSurveyDimension } from 'models/reporting/cubes/TicketSatisfactionSurveyCube'
import { commentHighlightsQueryFactory } from 'models/reporting/queryFactories/satisfaction/commentHighlightsQueryFactory'
import { EnrichmentFields } from 'models/reporting/types'
import { StatsFilters } from 'models/stat/types'
import { getHumanAndAutomationBotAgentsJS } from 'state/agents/selectors'
import { getTeamsMinimalWithEmojiJS } from 'state/teams/selectors'
import { formatReportingQueryDate } from 'utils/reporting'
import { assumeMock } from 'utils/testing'

jest.mock('hooks/reporting/useMetricPerDimension')
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
