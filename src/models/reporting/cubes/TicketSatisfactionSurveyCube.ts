import {Cube} from 'models/reporting/types'

export enum TicketSatisfactionSurveyMeasure {
    AvgSurveyScore = 'TicketSatisfactionSurvey.avgSurveyScore',
}

export enum TicketSatisfactionSurveyDimension {
    TicketId = 'TicketSatisfactionSurvey.ticketId',
    AccountId = 'TicketSatisfactionSurvey.accountId',
    SurveyScore = 'TicketSatisfactionSurvey.surveyScore',
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
