import type { TicketCube } from 'domains/reporting/models/cubes/TicketCube'
import type {
    Cube,
    JoinedCubesWithMapping,
} from 'domains/reporting/models/types'

export enum TicketQAScoreMeasure {
    TicketCount = 'TicketQAScore.ticketCount',
    AverageScore = 'TicketQAScore.averageScore',
    QAScoreData = 'TicketQAScore.qaScoreData',
    AverageAccuracyScore = 'TicketQAScore.averageAccuracyScore',
    AverageBrandVoiceScore = 'TicketQAScore.averageBrandVoiceScore',
    AverageCommunicationSkillsScore = 'TicketQAScore.averageCommunicationSkillsScore',
    AverageEfficiencyScore = 'TicketQAScore.averageEfficiencyScore',
    AverageInternalComplianceScore = 'TicketQAScore.averageInternalComplianceScore',
    AverageLanguageProficiencyScore = 'TicketQAScore.averageLanguageProficiencyScore',
    AverageResolutionCompletenessScore = 'TicketQAScore.averageResolutionCompletenessScore',
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

export enum TicketQAScoreDimensionName {
    CommunicationSkills = 'communication_skills',
    ResolutionCompleteness = 'resolution_completeness',
    LanguageProficiency = 'language_proficiency',
    Accuracy = 'accuracy',
    Efficiency = 'efficiency',
    InternalCompliance = 'internal_compliance',
    BrandVoice = 'brand_voice',
}

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
