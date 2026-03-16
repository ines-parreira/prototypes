import { useMemo } from 'react'

import type { Ticket } from '@gorgias/helpdesk-queries'
import { useListSatisfactionSurveys } from '@gorgias/helpdesk-queries'

import { isTicketSatisfactionSurvey } from './predicates'
import { toSurveyItemFromEvent, toSurveyItemFromSurvey } from './transforms'
import type { TicketThreadSatisfactionSurveyItem } from './types'
import { useGetSatisfactionSurveyRespondedEvent } from './useGetSatisfactionSurveyRespondedEvent'

type UseTicketThreadSatisfactionSurveysParams = {
    ticketId: number
    ticket: Ticket | undefined
}

export function useTicketThreadSatisfactionSurveys({
    ticketId,
    ticket,
}: UseTicketThreadSatisfactionSurveysParams): TicketThreadSatisfactionSurveyItem[] {
    const shouldFetchFallbackSurvey =
        !!ticketId && !ticket?.satisfaction_survey?.id
    const { data: surveysResponse } = useListSatisfactionSurveys(
        {
            ticket_id: ticketId,
            limit: 1,
        },
        {
            query: {
                enabled: shouldFetchFallbackSurvey,
                refetchOnWindowFocus: false,
            },
        },
    )

    const fallbackSurvey = surveysResponse?.data?.data?.[0]
    const survey = ticket?.satisfaction_survey ?? fallbackSurvey
    const satisfactionSurveyId =
        ticket?.satisfaction_survey?.id ?? fallbackSurvey?.id ?? null
    const respondedEvent =
        useGetSatisfactionSurveyRespondedEvent(satisfactionSurveyId)

    return useMemo(() => {
        const authorLabel =
            ticket?.customer?.name || ticket?.customer?.email || ''

        if (respondedEvent) {
            return [toSurveyItemFromEvent(respondedEvent, authorLabel)]
        }

        if (isTicketSatisfactionSurvey(survey)) {
            return [toSurveyItemFromSurvey(survey, authorLabel)]
        }

        return []
    }, [
        respondedEvent,
        survey,
        ticket?.customer?.email,
        ticket?.customer?.name,
    ])
}
