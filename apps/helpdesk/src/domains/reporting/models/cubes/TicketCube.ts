import { TicketProductsEnrichedCube } from 'domains/reporting/models/cubes/core/TicketProductsEnrichedCube'
import { TagsOnTicketCube } from 'domains/reporting/models/cubes/TagsOnTicketCube'
import { TicketCustomFieldsCube } from 'domains/reporting/models/cubes/TicketCustomFieldsCube'
import { TicketFirstHumanAgentResponseTimeCube } from 'domains/reporting/models/cubes/TicketFirstHumanAgentResponseTime'
import { TicketMessagesCube } from 'domains/reporting/models/cubes/TicketMessagesCube'
import { TicketMessagesEnrichedResponseTimes } from 'domains/reporting/models/cubes/TicketMessagesEnrichedResponseTimesCube'
import { TicketSatisfactionSurveyCube } from 'domains/reporting/models/cubes/TicketSatisfactionSurveyCube'
import { TicketTagsCube } from 'domains/reporting/models/cubes/TicketTagsCube'
import { TicketTagsEnrichedCube } from 'domains/reporting/models/cubes/TicketTagsEnrichedCube'
import { Cube, JoinedCubesWithMapping } from 'domains/reporting/models/types'

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
                                    TicketCube,
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
