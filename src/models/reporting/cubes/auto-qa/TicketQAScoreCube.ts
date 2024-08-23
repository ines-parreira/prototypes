import {TicketCube} from 'models/reporting/cubes/TicketCube'
import {Cube, JoinedCubesWithMapping} from 'models/reporting/types'

export enum TicketQAScoreMeasure {
    TicketCount = 'TicketQAScore.ticketCount',
    AverageScore = 'TicketQAScore.averageScore',
}

export enum TicketQAScoreDimension {
    TicketId = 'TicketQAScore.ticketId',
    AccountId = 'TicketQAScore.accountId',
    PeriodStart = 'TicketQAScore.periodStart',
    PeriodEnd = 'TicketQAScore.periodEnd',
    DimensionName = 'TicketQAScore.dimensionName',
    Prediction = 'TicketQAScore.prediction',
    TicketQAScoredDatetime = 'TicketQAScore.ticketQAScoredDatetime',
    TicketQAIsAutoScored = 'TicketQAScore.ticketQAIsAutoScored',
    TicketQAScorerUserId = 'TicketQAScore.ticketQAScorerUserId',
}

export enum TicketQAScoreMember {
    TicketId = 'TicketQAScore.ticketId',
    AccountId = 'TicketQAScore.accountId',
    PeriodStart = 'TicketQAScore.periodStart',
    PeriodEnd = 'TicketQAScore.periodEnd',
    DimensionName = 'TicketQAScore.dimensionName',
    Prediction = 'TicketQAScore.prediction',
    TicketQAScoredDatetime = 'TicketQAScore.ticketQAScoredDatetime',
    TicketQAIsAutoScored = 'TicketQAScore.ticketQAIsAutoScored',
    TicketQAScorerUserId = 'TicketQAScore.ticketQAScorerUserId',
}

export type TicketQAScoreTimeDimension =
    | ValueOf<TicketQAScoreDimension.PeriodStart>
    | ValueOf<TicketQAScoreDimension.PeriodEnd>
    | ValueOf<TicketQAScoreDimension.TicketQAScoredDatetime>

type TicketQAScoreCube = Cube<
    TicketQAScoreMeasure,
    TicketQAScoreDimension,
    never,
    TicketQAScoreMember,
    TicketQAScoreTimeDimension
>

export type TicketQAScoreCubeWithJoins = JoinedCubesWithMapping<
    TicketQAScoreCube,
    TicketCube
>
