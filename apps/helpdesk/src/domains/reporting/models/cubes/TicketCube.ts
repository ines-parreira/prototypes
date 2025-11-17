import type { TicketProductsEnrichedCube } from 'domains/reporting/models/cubes/core/TicketProductsEnrichedCube'
import type { TagsOnTicketCube } from 'domains/reporting/models/cubes/TagsOnTicketCube'
import type { TicketCustomFieldsCube } from 'domains/reporting/models/cubes/TicketCustomFieldsCube'
import type { TicketFirstHumanAgentResponseTimeCube } from 'domains/reporting/models/cubes/TicketFirstHumanAgentResponseTime'
import type { TicketMessagesCube } from 'domains/reporting/models/cubes/TicketMessagesCube'
import type { TicketMessagesEnrichedResponseTimes } from 'domains/reporting/models/cubes/TicketMessagesEnrichedResponseTimesCube'
import type { TicketSatisfactionSurveyCube } from 'domains/reporting/models/cubes/TicketSatisfactionSurveyCube'
import type { TicketsFirstAgentResponseTimeCube } from 'domains/reporting/models/cubes/TicketsFirstAgentResponseTimeCube'
import type { TicketTagsCube } from 'domains/reporting/models/cubes/TicketTagsCube'
import type { TicketTagsEnrichedCube } from 'domains/reporting/models/cubes/TicketTagsEnrichedCube'
import type {
    Cube,
    JoinedCubesWithMapping,
} from 'domains/reporting/models/types'

export enum TicketMeasure {
    TicketCount = 'TicketEnriched.ticketCount',
}

export enum TicketDimension {
    TicketId = 'TicketEnriched.ticketId',
    PeriodStart = 'TicketEnriched.periodStart',
    PeriodEnd = 'TicketEnriched.periodEnd',
    AccountId = 'TicketEnriched.accountId',
    Status = 'TicketEnriched.status',
    Channel = 'TicketEnriched.channel',
    CustomField = 'TicketEnriched.customField',
    CustomFieldToExclude = 'TicketEnriched.customFieldToExclude',
    CreatedDatetime = 'TicketEnriched.createdDatetime',
    ClosedDatetime = 'TicketEnriched.closedDatetime',
    AssigneeUserId = 'TicketEnriched.assigneeUserId',
    AssigneeTeamId = 'TicketEnriched.assigneeTeamId',
    MessageSenderId = 'TicketEnriched.messageSenderId',
    MessageSenderIdToExclude = 'TicketEnriched.messageSenderIdToExclude',
    IsTrashed = 'TicketEnriched.isTrashed',
    IsSpam = 'TicketEnriched.isSpam',
    SurveyScore = 'TicketEnriched.surveyScore',
    ResolutionCompletenessScore = 'TicketEnriched.resolutionCompletenessScore',
    CommunicationSkillsScore = 'TicketEnriched.communicationSkillsScore',
    LanguageProficiencyScore = 'TicketEnriched.languageProficiencyScore',
}

export enum TicketSegment {
    ClosedTickets = 'TicketEnriched.closedTickets',
    WorkloadTickets = 'TicketEnriched.workloadTickets',
}

export enum TicketMember {
    PeriodStart = 'TicketEnriched.periodStart',
    PeriodEnd = 'TicketEnriched.periodEnd',
    CreatedDatetime = 'TicketEnriched.createdDatetime',
    AssigneeUserId = 'TicketEnriched.assigneeUserId',
    MessageSenderId = 'TicketEnriched.messageSenderId',
    MessageSenderIdToExclude = 'TicketEnriched.messageSenderIdToExclude',
    IsTrashed = 'TicketEnriched.isTrashed',
    IsSpam = 'TicketEnriched.isSpam',
    Status = 'TicketEnriched.status',
    Tags = 'TicketEnriched.tags',
    AllTags = 'TicketEnriched.allTags',
    TagsToExclude = 'TicketEnriched.tagsToExclude',
    TotalTagsToMatch = 'TicketEnriched.totalTagsToMatch',
    Channel = 'TicketEnriched.channel',
    CustomField = 'TicketEnriched.customField',
    TotalCustomFieldIdsToMatch = 'TicketEnriched.totalCustomFieldIdsToMatch',
    CustomFieldToExclude = 'TicketEnriched.customFieldToExclude',
    SurveyScore = 'TicketEnriched.surveyScore',
    ResolutionCompletenessScore = 'TicketEnriched.resolutionCompletenessScore',
    CommunicationSkillsScore = 'TicketEnriched.communicationSkillsScore',
    LanguageProficiencyScore = 'TicketEnriched.languageProficiencyScore',
    AccuracyScore = 'TicketEnriched.accuracyScore',
    EfficiencyScore = 'TicketEnriched.efficiencyScore',
    InternalComplianceScore = 'TicketEnriched.internalComplianceScore',
    BrandVoiceScore = 'TicketEnriched.brandVoiceScore',
    TicketId = 'TicketEnriched.ticketId',
}

export type TicketTimeDimensions =
    | ValueOf<TicketDimension.CreatedDatetime>
    | ValueOf<TicketDimension.ClosedDatetime>

export type TicketCube = Cube<
    TicketMeasure,
    TicketDimension,
    TicketSegment,
    TicketMember,
    TicketTimeDimensions
>

export type TicketCubeWithJoins = JoinedCubesWithMapping<
    JoinedCubesWithMapping<
        JoinedCubesWithMapping<
            JoinedCubesWithMapping<
                JoinedCubesWithMapping<
                    JoinedCubesWithMapping<
                        JoinedCubesWithMapping<
                            JoinedCubesWithMapping<
                                JoinedCubesWithMapping<
                                    JoinedCubesWithMapping<
                                        TicketCube,
                                        TicketsFirstAgentResponseTimeCube
                                    >,
                                    TicketFirstHumanAgentResponseTimeCube
                                >,
                                TicketProductsEnrichedCube
                            >,
                            TicketMessagesEnrichedResponseTimes
                        >,
                        TicketTagsEnrichedCube
                    >,
                    TicketMessagesCube
                >,
                TicketSatisfactionSurveyCube
            >,
            TicketTagsCube
        >,
        TagsOnTicketCube
    >,
    TicketCustomFieldsCube
>
