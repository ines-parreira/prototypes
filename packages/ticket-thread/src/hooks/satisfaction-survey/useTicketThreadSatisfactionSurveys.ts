import { useMemo } from 'react'

import type { Ticket } from '@gorgias/helpdesk-queries'

import { TicketThreadItemTag } from '../types'
import { isTicketSatisfactionSurvey } from './predicates'
import type { TicketThreadSatisfactionSurveyItem } from './types'

type UseTicketThreadSatisfactionSurveysParams = {
    ticket: Ticket | undefined
    hasSatisfactionSurveyRespondedEvent: boolean
}

export function useTicketThreadSatisfactionSurveys({
    ticket,
    hasSatisfactionSurveyRespondedEvent,
}: UseTicketThreadSatisfactionSurveysParams): TicketThreadSatisfactionSurveyItem[] {
    return useMemo(() => {
        if (hasSatisfactionSurveyRespondedEvent) return []

        const survey = ticket?.satisfaction_survey
        if (!isTicketSatisfactionSurvey(survey)) return []

        return [
            {
                _tag: TicketThreadItemTag.SatisfactionSurvey,
                data: survey,
                datetime: survey.scored_datetime ?? survey.created_datetime,
            },
        ]
    }, [ticket?.satisfaction_survey, hasSatisfactionSurveyRespondedEvent])
}
