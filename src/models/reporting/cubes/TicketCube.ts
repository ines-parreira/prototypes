import {TagsOnTicketCube} from 'models/reporting/cubes/TagsOnTicketCube'
import {TicketCustomFieldsCube} from 'models/reporting/cubes/TicketCustomFieldsCube'
import {TicketMessagesCube} from 'models/reporting/cubes/TicketMessagesCube'
import {TicketSatisfactionSurveyCube} from 'models/reporting/cubes/TicketSatisfactionSurveyCube'
import {TicketTagsCube} from 'models/reporting/cubes/TicketTagsCube'
import {TicketTagsEnrichedCube} from 'models/reporting/cubes/TicketTagsEnrichedCube'
import {Cube, JoinedCubesWithMapping} from 'models/reporting/types'

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
                    JoinedCubesWithMapping<TicketCube, TicketTagsEnrichedCube>,
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
