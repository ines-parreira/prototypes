import {Cube} from 'models/reporting/types'

export enum TicketSatisfactionSurveyMeasure {
    AvgSurveyScore = 'TicketSatisfactionSurveyEnriched.avgSurveyScore',
    ResponseRate = 'TicketSatisfactionSurveyEnriched.responseRate',
    ScoredSurveysCount = 'TicketSatisfactionSurveyEnriched.scoredSurveysCount',
    SentSurveysCount = 'TicketSatisfactionSurveyEnriched.sentSurveysCount',
}

export enum TicketSatisfactionSurveyDimension {
    TicketId = 'TicketSatisfactionSurveyEnriched.ticketId',
    AccountId = 'TicketSatisfactionSurveyEnriched.accountId',
    SurveyScore = 'TicketSatisfactionSurveyEnriched.surveyScore',
}

export enum TicketSatisfactionSurveySegment {
    SurveyScored = 'TicketSatisfactionSurveyEnriched.surveyScored',
}

export type TicketSatisfactionSurveyCube = Cube<
    TicketSatisfactionSurveyMeasure,
    TicketSatisfactionSurveyDimension,
    TicketSatisfactionSurveySegment,
    never,
    never
>
