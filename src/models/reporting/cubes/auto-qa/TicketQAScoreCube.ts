import {TicketCube} from 'models/reporting/cubes/TicketCube'
import {Cube, JoinedCubesWithMapping} from 'models/reporting/types'

export enum TicketQAScoreMeasure {
    TicketCount = 'ticketCount',
    AverageScore = 'averageScore',
}

export enum TicketQAScoreDimension {
    TicketId = 'ticketId',
    AccountId = 'accountId',
    PeriodStart = 'periodStart',
    PeriodEnd = 'periodEnd',
    DimensionName = 'dimensionName',
    Prediction = 'prediction',
    TicketQAScoredDatetime = 'ticketQAScoredDatetime',
    TicketQAIsAutoScored = 'ticketQAIsAutoScored',
    TicketQAScorerUserId = 'ticketQAScorerUserId',
}

export enum TicketQAScoreMember {
    TicketId = 'ticketId',
    AccountId = 'accountId',
    PeriodStart = 'periodStart',
    PeriodEnd = 'periodEnd',
    DimensionName = 'dimensionName',
    Prediction = 'prediction',
    TicketQAScoredDatetime = 'ticketQAScoredDatetime',
    TicketQAIsAutoScored = 'ticketQAIsAutoScored',
    TicketQAScorerUserId = 'ticketQAScorerUserId',
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
