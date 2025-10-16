import { ReportingFilterOperator } from 'domains/reporting/models/types'
import { LogicalOperatorEnum } from 'domains/reporting/pages/common/components/Filter/constants'

export type DateFilter = {
    member: FilterName
    operator:
        | ReportingFilterOperator.AfterDate
        | ReportingFilterOperator.BeforeDate
    values: string[]
}

export type StandardFilter = {
    member: FilterName
    operator: LogicalOperatorEnum
    values: string[]
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

export type TimeDimensionName =
    | 'createdDatetime'
    | 'sentDatetime'
    | 'closedDatetime'
    | 'firstAgentMessageDatetime'

export type FilterName =
    | 'periodStart'
    | 'periodEnd'
    | 'agentId'
    | 'channel'
    | 'score'
    | 'integrationId'
    | 'communicationSkills'
    | 'languageProficiency'
    | 'resolutionCompleteness'
    | 'accuracy'
    | 'efficiency'
    | 'internalCompliance'
    | 'brandVoice'
    | 'storeId'
    | 'customFields'
    | 'tags'
