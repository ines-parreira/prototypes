import type { Event } from '@gorgias/helpdesk-types'

import { assertNever } from '../../utils/assertNever'
import { TicketThreadItemTag } from '../types'
import {
    isRespondedSatisfactionSurveyItem,
    isScheduledSatisfactionSurveyItem,
    isSentSatisfactionSurveyItem,
    isToBeSentSatisfactionSurveyItem,
} from './predicates'
import type { TicketSatisfactionSurveySchema } from './schemas'
import type {
    TicketThreadRespondedSatisfactionSurveyItem,
    TicketThreadSatisfactionSurveyItem,
} from './types'

export function toSurveyItemFromEvent(
    event: Event & {
        created_datetime: string
        data: { score: number; body_text?: string | null }
        id?: number | string
    },
    authorLabel: string,
): TicketThreadRespondedSatisfactionSurveyItem {
    const item: TicketThreadRespondedSatisfactionSurveyItem = {
        _tag: TicketThreadItemTag.SatisfactionSurvey,
        status: 'responded',
        data: {
            authorLabel,
            body_text: event.data.body_text ?? null,
            score: event.data.score,
            source: 'event',
        },
        datetime: event.created_datetime,
    }
    return item
}

export function toSurveyItemFromSurvey(
    survey: TicketSatisfactionSurveySchema,
    authorLabel: string,
): TicketThreadSatisfactionSurveyItem {
    if (isRespondedSatisfactionSurveyItem(survey)) {
        return {
            _tag: TicketThreadItemTag.SatisfactionSurvey,
            status: 'responded',
            data: {
                ...survey,
                authorLabel,
                source: 'survey',
            },
            datetime: survey.scored_datetime,
        }
    }

    if (isSentSatisfactionSurveyItem(survey)) {
        return {
            _tag: TicketThreadItemTag.SatisfactionSurvey,
            status: 'sent',
            data: {
                ...survey,
                authorLabel,
            },
            datetime: survey.created_datetime,
        }
    }

    if (isScheduledSatisfactionSurveyItem(survey)) {
        return {
            _tag: TicketThreadItemTag.SatisfactionSurvey,
            status: 'scheduled',
            data: {
                ...survey,
                authorLabel,
            },
            datetime: survey.created_datetime,
        }
    }

    if (isToBeSentSatisfactionSurveyItem(survey)) {
        return {
            _tag: TicketThreadItemTag.SatisfactionSurvey,
            status: 'to-be-sent',
            data: {
                ...survey,
                authorLabel,
            },
            datetime: survey.created_datetime,
        }
    }

    return assertNever(survey)
}
