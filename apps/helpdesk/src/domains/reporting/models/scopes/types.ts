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
    | 'customFieldTop2LevelsValue'
    | 'callDirection'
    | 'callRecordingAvailable'
    | 'callRecordingUrl'
    | 'callSlaStatus'
    | 'callSlaStatusLabel'
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
    | 'transferType'
    | 'transferTargetAgentId'
    | 'transferTargetExternalNumber'
    | 'transferTargetQueueId'
    | 'assignedAgentId'
    | 'helpCenterId'
    | 'localeCodes'
    | 'articleId'
    | 'articleTitle'
    | 'articleSlug'
    | 'searchQuery'
    | 'searchResultRange'
    | 'currency'
    | 'influencedProductId'
    | 'productId'
    | 'storeIntegrationId'
    | 'statusName'
    | 'campaignId'
    | 'abVariant'
    | 'aiAgentSkill'
    | 'automationFeatureType'
    | 'customField'
    | 'engagementType'
    | 'orderManagementType'

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
    | 'slaAchievementRate'
    | 'voiceCallsCount'
    | 'abandonedVoiceCallsCount'
    | 'answeredVoiceCallsCount'
    | 'callbackRequestedVoiceCallsCount'
    | 'cancelledVoiceCallsCount'
    | 'inboundVoiceCallsCount'
    | 'missedVoiceCallsCount'
    | 'outboundVoiceCallsCount'
    | 'unansweredVoiceCallsCount'
    | 'slaAchievementRate'
    | 'breachedExposures'
    | 'achievedExposures'
    | 'totalExposures'
    | 'articleViewCount'
    | 'searchRequestedCount'
    | 'articleCount'
    | 'searchRequestedQueryCount'
    | 'searchArticlesClickedCount'
    | 'uniqueSearchArticlesClickedCount'
    | 'uniqueSearchQueryCount'
    | 'gmv'
    | 'gmvUsd'
    | 'count'
    | 'uniqCount'
    | 'averageDiscountUsd'
    | 'totalDurationSeconds'
    | 'onlineDurationSeconds'
    | 'offlineDurationSeconds'
    | 'medianPurchaseTime'
    | 'campaignCTR'
    | 'engagement'
    | 'impressions'
    | 'totalConversionRate'
    | 'orderCount'
    | 'firstCampaignDisplay'
    | 'clicks'
    | 'clicksRate'
    | 'lastCampaignDisplay'
    | 'ticketsCreated'
    | 'uniqClicks'
    | 'campaignSales'
    | 'campaignSalesCount'
    | 'clickSales'
    | 'clickSalesCount'
    | 'discountSales'
    | 'discountSalesCount'
    | 'ticketSales'
    | 'ticketSalesCount'
    | 'handoverInteractionsCount'
    | 'automatedInteractionsCount'
    | 'coverageRate'

export type TimeDimensionName =
    | 'createdDatetime'
    | 'sentDatetime'
    | 'closedDatetime'
    | 'firstAgentMessageDatetime'
    | 'updatedDatetime'
    | 'anchorDatetime'
    | 'queuedDate'
    | 'timestamp'
    | 'periodStart'
    | 'eventDatetime'

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
    | 'eventType'
    | 'status'
    | 'productId'
    | 'createdDatetime'
    | 'customFieldValue'
    | 'slaPolicyUuid'
    | 'resourceSourceId'
    | 'resourceSourceSetId'
    | 'transferredCalls'
    | 'declinedCalls'
    | 'callTerminationStatus'
    | 'callDirection'
    | 'displayStatus'
    | 'customFieldId'
    | 'callSlaStatus'
    | 'helpCenterId'
    | 'localeCodes'
    | 'isSearchRequestWithClick'
    | 'helpCenterEventType'
    | 'searchResultCount'
    | 'influencedBy'
    | 'source'
    | 'storeIntegrationId'
    | 'articleId'
    | 'outcome'
    | 'discountCode'
    | 'abVariant'
    | 'shopName'
    | 'campaignId'
    | 'aiAgentSkill'
    | 'automationFeatureType'
    | 'customField'
    | 'engagementType'

export type NumberFilterName =
    | 'agentId'
    | 'integrationId'
    | 'storeId'
    | 'teamId'
    | 'customFieldId'
    | 'queueId'
    | 'storeIntegrationId'
    | 'talkTime'
    | 'waitTime'

export type BooleanFilterName =
    | 'isAnsweredByAgent'
    | 'isDuringBusinessHours'
    | 'isInfluenced'
    | 'isSalesOpportunity'

export type FilterName = StringFilterName | NumberFilterName | BooleanFilterName
