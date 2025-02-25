import { useMemo } from 'react'

import { UserRole } from 'config/types/user'
import { useMetricPerDimensionWithEnrichment } from 'hooks/reporting/useMetricPerDimension'
import useAppSelector from 'hooks/useAppSelector'
import { TicketDimension } from 'models/reporting/cubes/TicketCube'
import { TicketSatisfactionSurveyDimension } from 'models/reporting/cubes/TicketSatisfactionSurveyCube'
import { commentHighlightsQueryFactory } from 'models/reporting/queryFactories/satisfaction/commentHighlightsQueryFactory'
import { EnrichmentFields } from 'models/reporting/types'
import { StatsFilters } from 'models/stat/types'
import { getHumanAndAutomationBotAgentsJS } from 'state/agents/selectors'
import { getTeamsMinimalWithEmojiJS } from 'state/teams/selectors'

type CommentHighlightsUserData = {
    name: string
    url?: string | null
    isBot?: boolean
}

type CommentHighlightsTeamData = {
    name: string
    emoji?: string
}

export type CommentHighlightsData = {
    assignedAgent: CommentHighlightsUserData | null
    assignedTeam: CommentHighlightsTeamData | null
    customerName: string | null
    ticketId: string | null
    surveyScore: string | null
    comment: string | null
}

export type FormattedCommentHighlightQueryData = {
    isFetching: boolean
    isError: boolean
    data?: CommentHighlightsData[]
}

export const useCommentHighlights = (
    filters: StatsFilters,
    timezone: string,
    queryScores: string[],
): FormattedCommentHighlightQueryData => {
    const agents = useAppSelector(getHumanAndAutomationBotAgentsJS)
    const teams = useAppSelector(getTeamsMinimalWithEmojiJS)
    const { data, isFetching, isError } = useMetricPerDimensionWithEnrichment(
        commentHighlightsQueryFactory(filters, timezone, queryScores),
        [EnrichmentFields.CustomerName, EnrichmentFields.AssigneeName],
        EnrichmentFields.TicketId,
    )

    const formattedData = useMemo(
        () =>
            data?.allData?.map((result) => {
                const ticketId = result[TicketDimension.TicketId] || null
                const assignedUserId =
                    result[TicketDimension.AssigneeUserId] || null
                const surveyScore = result[TicketDimension.SurveyScore] || null
                const comment =
                    result[TicketSatisfactionSurveyDimension.SurveyComment] ||
                    null

                const assignedTeamId =
                    result[TicketDimension.AssigneeTeamId] || null

                const team = teams.find(
                    (team) => String(team.id) === assignedTeamId,
                )

                const assignedTeam = team
                    ? {
                          name: team.name,
                          emoji: team.nativeEmoji,
                      }
                    : null

                const agent = agents.find(
                    (agent) => String(agent.id) === assignedUserId,
                )

                const assignedAgent = agent
                    ? {
                          name: agent.name,
                          url: agent.meta?.profile_picture_url,
                          isBot: agent.role.name === UserRole.Bot,
                      }
                    : null

                const customerName =
                    result[EnrichmentFields.CustomerName] || null

                return {
                    ticketId,
                    surveyScore,
                    comment,
                    assignedAgent,
                    assignedTeam,
                    customerName,
                }
            }),
        [agents, data?.allData, teams],
    )

    return {
        data: formattedData,
        isFetching: isFetching,
        isError: isError,
    }
}
