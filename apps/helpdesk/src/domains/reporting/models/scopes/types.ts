import type { ReportingFilterOperator } from 'domains/reporting/models/types'
import type { LogicalOperatorEnum } from 'domains/reporting/pages/common/components/Filter/constants'

export type DateFilter = {
    member: FilterName
    operator:
        | ReportingFilterOperator.AfterDate
        | ReportingFilterOperator.BeforeDate
    values: string[]
}

export type StringStandardFilter = {
    member: StringFilterName
    operator: LogicalOperatorEnum
    values: string[]
}

export type NumberStandardFilter = {
    member: NumberFilterName
    operator: LogicalOperatorEnum
    values: number[]
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

export type StandardFilter = StringStandardFilter | NumberStandardFilter

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

export type MeasureName =
    | 'ticketCount'
    | 'averageHandleTime'
    | 'handleTime'
    | 'averageSurveyScore'
    | 'scoredSurveysCount'
    | 'medianResolutionTime'
    | 'onlineTime'
    | 'messagesCount'
    | 'messagesAverage'
    | 'medianFirstResponseTime'
    | 'medianFirstResponseTimeInSeconds'

export type TimeDimensionName =
    | 'createdDatetime'
    | 'sentDatetime'
    | 'closedDatetime'
    | 'firstAgentMessageDatetime'

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
    | 'agents'
    | 'channels'
    | 'integrations'
    | 'stores'
    | 'csatScores'
    | 'accuracyScore'
    | 'efficiencyScore'
    | 'internalComplianceScore'
    | 'brandVoiceScore'

export type NumberFilterName = 'agentId' | 'integrationId' | 'storeId'

export type FilterName = StringFilterName | NumberFilterName
