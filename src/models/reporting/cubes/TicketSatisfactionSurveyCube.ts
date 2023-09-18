import {Cube} from 'models/reporting/types'

export enum TicketSatisfactionSurveyMeasure {
    SurveyScore = 'TicketSatisfactionSurvey.surveyScore',
}

export enum TicketSatisfactionSurveyDimension {
    TicketId = 'TicketSatisfactionSurvey.ticketId',
    AccountId = 'TicketSatisfactionSurvey.accountId',
}

export enum TicketSatisfactionSurveySegment {
    SurveyScored = 'TicketSatisfactionSurvey.surveyScored',
}

export type TicketSatisfactionSurveyCube = Cube<
    TicketSatisfactionSurveyMeasure,
    TicketSatisfactionSurveyDimension,
    TicketSatisfactionSurveySegment,
    never,
    never
>
