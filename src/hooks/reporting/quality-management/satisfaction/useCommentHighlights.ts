import {useQueries} from '@tanstack/react-query'
import {useMemo} from 'react'

import {useMetricPerDimension} from 'hooks/reporting/useMetricPerDimension'
import useAppSelector from 'hooks/useAppSelector'
import {customersKeys} from 'models/customer/queries'
import {getCustomer} from 'models/customer/resources'
import {TicketDimension} from 'models/reporting/cubes/TicketCube'
import {TicketSatisfactionSurveyDimension} from 'models/reporting/cubes/TicketSatisfactionSurveyCube'
import {commentHighlightsQueryFactory} from 'models/reporting/queryFactories/satisfaction/commentHighlightsQueryFactory'
import {StatsFilters} from 'models/stat/types'
import {getHumanAndAutomationBotAgentsJS} from 'state/agents/selectors'

type CommentHighlightsUserData = {
    name: string
    url?: string | null
}

export type CommentHighlightsData = {
    assignee: CommentHighlightsUserData | null
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
    queryScores: string[]
): FormattedCommentHighlightQueryData => {
    const agents = useAppSelector(getHumanAndAutomationBotAgentsJS)

    const {data, isFetching, isError} = useMetricPerDimension(
        commentHighlightsQueryFactory(filters, timezone, queryScores)
    )

    const processedData = useMemo(
        () =>
            data?.allData?.map((result) => {
                const ticketId = result[TicketDimension.TicketId] || null
                const assignedUserId =
                    result[TicketDimension.AssigneeUserId] || null
                const surveyCustomerId =
                    result[
                        TicketSatisfactionSurveyDimension.SurveyCustomerId
                    ] || null
                const surveyScore = result[TicketDimension.SurveyScore] || null
                const comment =
                    result[TicketSatisfactionSurveyDimension.SurveyComment] ||
                    null

                const agent = agents.find(
                    (agent) => String(agent.id) === assignedUserId
                )

                const assignee = agent
                    ? {
                          name: agent.name,
                          url: agent.meta?.profile_picture_url,
                      }
                    : null

                return {
                    ticketId,
                    surveyScore,
                    comment,
                    assignee,
                    surveyCustomerId,
                }
            }) || [],
        [agents, data?.allData]
    )

    const customerQueries = useQueries({
        queries: processedData.map(({surveyCustomerId}) => {
            const customerId = Number(surveyCustomerId)
            return {
                queryKey: customersKeys.detail(customerId),
                queryFn: () => getCustomer(customerId),
                enabled: !!customerId,
            }
        }),
    })

    const areCustomerQueriesLoading = useMemo(
        () => customerQueries.some((query) => query.isLoading),
        [customerQueries]
    )

    const areCustomerQueriesInError = useMemo(
        () => customerQueries.some((query) => query.isError),
        [customerQueries]
    )
    const finalData = useMemo(
        () =>
            processedData.map((item, index) => ({
                ...item,
                customerName: customerQueries[index]?.data?.data?.name || null,
            })),
        [customerQueries, processedData]
    )

    return {
        ...(!areCustomerQueriesLoading && {data: finalData}),
        isFetching: isFetching || areCustomerQueriesLoading,
        isError: isError || areCustomerQueriesInError,
    }
}
