import type { ReportingFilterOperator } from 'domains/reporting/models/types'
import type {
    ExtendedLogicalOperatorEnum,
    LogicalOperatorEnum,
} from 'domains/reporting/pages/common/components/Filter/constants'

export type DateFilter = {
    member: FilterName
    operator:
        | ReportingFilterOperator.AfterDate
        | ReportingFilterOperator.BeforeDate
    values: string[]
}

export type StringStandardFilter = {
    member: StringFilterName
    operator: LogicalOperatorEnum | ExtendedLogicalOperatorEnum
    values: string[]
}

export type NumberStandardFilter = {
    member: NumberFilterName
    operator: LogicalOperatorEnum | ExtendedLogicalOperatorEnum
    values: number[]
}

export type BooleanStandardFilter = {
    member: BooleanFilterName
    operator: LogicalOperatorEnum | ExtendedLogicalOperatorEnum
    values: boolean[]
}

export type CustomFieldsFilter = {
    member: FilterName
    values: Array<{
        custom_field_id: string
        operator: LogicalOperatorEnum.ONE_OF | LogicalOperatorEnum.NOT_ONE_OF
        values: string[]
    }>
}

export type TagsFilter = {
    member: FilterName
    values: Array<{
        operator: LogicalOperatorEnum
        values: string[]
    }>
}

export type StandardFilter =
    | StringStandardFilter
    | NumberStandardFilter
    | BooleanStandardFilter

export type FilterGroup =
    | StandardFilter
    | CustomFieldsFilter
    | TagsFilter
    | DateFilter

export type DimensionName =
    | 'agentId'
    | 'integrationId'
    | 'channel'
    | 'ticketId'
    | 'surveyScore'
    | 'firstResponseTime'
    | 'messagesCount'
    | 'resolutionTime'
    | 'handleTime'
    | 'eventType'
    | 'storeId'
    | 'customFieldValue'
    | 'status'
    | 'tagId'
    | 'resourceType'
    | 'resourceSourceId'
    | 'resourceSourceSetId'
    | 'top2LevelsValue'
    | 'callDirection'
    | 'callRecordingAvailable'
    | 'callRecordingUrl'
    | 'createdDatetime'
    | 'customerId'
    | 'destination'
    | 'displayStatus'
    | 'duration'
    | 'queueId'
    | 'queueName'
    | 'source'
    | 'status'
    | 'talkTime'
    | 'voicemailAvailable'
    | 'voicemailUrl'
    | 'waitTime'
    | 'filteringAgentId'
    | 'isPossibleSpam'

export type MeasureName =
    | 'ticketCount'
    | 'averageHandleTime'
    | 'handleTime'
    | 'averageSurveyScore'
    | 'scoredSurveysCount'
    | 'medianResolutionTime'
    | 'onlineTime'
    | 'messagesCount'
    | 'averageMessagesCount'
    | 'medianResponseTime'
    | 'medianFirstResponseTime'
    | 'medianFirstResponseTimeInSeconds'
    | 'automationRate'
    | 'aiAgentAutomationRate'
    | 'automatedInteractions'
    | 'automatedInteractionsByAutoResponders'
    | 'averageResolutionCompletenessScore'
    | 'averageCommunicationSkillsScore'
    | 'averageLanguageProficiencyScore'
    | 'averageAccuracyScore'
    | 'averageEfficiencyScore'
    | 'averageInternalComplianceScore'
    | 'averageBrandVoiceScore'
    | 'averageTalkTimeInSeconds'
    | 'averageWaitTimeInSeconds'
    | 'voiceCallsCount'
    | 'abandonedVoiceCallsCount'
    | 'answeredVoiceCallsCount'
    | 'callbackRequestedVoiceCallsCount'
    | 'cancelledVoiceCallsCount'
    | 'inboundVoiceCallsCount'
    | 'missedVoiceCallsCount'
    | 'outboundVoiceCallsCount'
    | 'unansweredVoiceCallsCount'

export type TimeDimensionName =
    | 'createdDatetime'
    | 'sentDatetime'
    | 'closedDatetime'
    | 'firstAgentMessageDatetime'
    | 'updatedDatetime'
    | 'anchorDatetime'
    | 'timestamp'

export type StringFilterName =
    | 'periodStart'
    | 'periodEnd'
    | 'channel'
    | 'score'
    | 'communicationSkills'
    | 'languageProficiency'
    | 'resolutionCompleteness'
    | 'accuracy'
    | 'efficiency'
    | 'internalCompliance'
    | 'brandVoice'
    | 'customFields'
    | 'tags'
    | 'agentId'
    | 'teamId'
    | 'channel'
    | 'integrationId'
    | 'storeId'
    | 'accuracyScore'
    | 'efficiencyScore'
    | 'internalComplianceScore'
    | 'brandVoiceScore'
    | 'eventType'
    | 'status'
    | 'productId'
    | 'createdDatetime'
    | 'customFieldValue'
    | 'slaPolicyUuid'
    | 'resourceSourceId'
    | 'resourceSourceSetId'
    | 'shopIntegrationId'
    | 'transferredCalls'
    | 'declinedCalls'
    | 'callTerminationStatus'
    | 'callDirection'
    | 'displayStatus'

export type NumberFilterName =
    | 'agentId'
    | 'integrationId'
    | 'storeId'
    | 'teamId'
    | 'customFieldId'
    | 'queueId'

export type BooleanFilterName = 'isAnsweredByAgent' | 'isDuringBusinessHours'

export type FilterName = StringFilterName | NumberFilterName | BooleanFilterName
