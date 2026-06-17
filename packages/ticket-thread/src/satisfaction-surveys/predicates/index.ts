import {
    respondedSatisfactionSurveySchema,
    scheduledSatisfactionSurveySchema,
    sentSatisfactionSurveySchema,
    ticketSatisfactionSurveySchema,
    toBeSentSatisfactionSurveySchema,
} from '#satisfaction-surveys/schemas'
import type {
    RespondedSatisfactionSurveySchema,
    ScheduledSatisfactionSurveySchema,
    SentSatisfactionSurveySchema,
    TicketSatisfactionSurveySchema,
    ToBeSentSatisfactionSurveySchema,
} from '#satisfaction-surveys/types'

export function isTicketSatisfactionSurvey(
    input: unknown,
): input is TicketSatisfactionSurveySchema {
    return ticketSatisfactionSurveySchema.safeParse(input).success
}

export function isRespondedSatisfactionSurveyItem(
    input: unknown,
): input is RespondedSatisfactionSurveySchema {
    return respondedSatisfactionSurveySchema.safeParse(input).success
}

export function isSentSatisfactionSurveyItem(
    input: unknown,
): input is SentSatisfactionSurveySchema {
    return sentSatisfactionSurveySchema.safeParse(input).success
}

export function isScheduledSatisfactionSurveyItem(
    input: unknown,
): input is ScheduledSatisfactionSurveySchema {
    return scheduledSatisfactionSurveySchema.safeParse(input).success
}

export function isToBeSentSatisfactionSurveyItem(
    input: unknown,
): input is ToBeSentSatisfactionSurveySchema {
    return toBeSentSatisfactionSurveySchema.safeParse(input).success
}
