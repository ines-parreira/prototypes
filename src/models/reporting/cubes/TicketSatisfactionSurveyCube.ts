import { Cube } from 'models/reporting/types'

export enum TicketSatisfactionSurveyMeasure {
    AvgSurveyScore = 'TicketSatisfactionSurveyEnriched.avgSurveyScore',
    ResponseRate = 'TicketSatisfactionSurveyEnriched.responseRate',
    SatisfactionScore = 'TicketSatisfactionSurveyEnriched.satisfactionScore',
    SentSurveysCount = 'TicketSatisfactionSurveyEnriched.sentSurveysCount',
    ScoredSurveysCount = 'TicketSatisfactionSurveyEnriched.scoredSurveysCount',
}

export enum TicketSatisfactionSurveyDimension {
    TicketId = 'TicketSatisfactionSurveyEnriched.ticketId',
    AccountId = 'TicketSatisfactionSurveyEnriched.accountId',
    SurveyScore = 'TicketSatisfactionSurveyEnriched.surveyScore',
    SurveyComment = 'TicketSatisfactionSurveyEnriched.surveyComment',
    SurveyCommentLength = 'TicketSatisfactionSurveyEnriched.surveyCommentLength',
    SurveyCustomerId = 'TicketSatisfactionSurveyEnriched.surveyCustomerId',
    SurveySentDatetime = 'TicketSatisfactionSurveyEnriched.surveySentDatetime',
    SurveyScoredDatetime = 'TicketSatisfactionSurveyEnriched.surveyScoredDatetime',
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
