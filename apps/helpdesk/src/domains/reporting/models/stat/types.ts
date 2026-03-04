import type { CursorPaginationMeta } from '@gorgias/helpdesk-queries'

import type { ReportingGranularity } from 'domains/reporting/models/types'
import type {
    ExtendedLogicalOperatorEnum,
    LogicalOperatorEnum,
} from 'domains/reporting/pages/common/components/Filter/constants'
import type { ReportIssueReasons } from 'models/selfServiceConfiguration/types'

export enum FilterKey {
    Accuracy = 'accuracy',
    Agents = 'agents',
    AggregationWindow = 'aggregationWindow',
    BrandVoice = 'brandVoice',
    IsDuringBusinessHours = 'isDuringBusinessHours',
    Campaigns = 'campaigns',
    CampaignStatuses = 'campaignStatuses',
    Channels = 'channels',
    JourneyType = 'journeyType',
    JourneyFlows = 'journeyFlows',
    JourneyCampaigns = 'journeyCampaigns',
    CommunicationSkills = 'communicationSkills',
    CustomFields = 'customFields',
    Efficiency = 'efficiency',
    HelpCenters = 'helpCenters',
    Integrations = 'integrations',
    InternalCompliance = 'internalCompliance',
    LanguageProficiency = 'languageProficiency',
    LocaleCodes = 'localeCodes',
    Period = 'period',
    ResolutionCompleteness = 'resolutionCompleteness',
    Score = 'score',
    SlaPolicies = 'slaPolicies',
    Tags = 'tags',
    StoreIntegrations = 'storeIntegrations',
    VoiceQueues = 'voiceQueues',
    Stores = 'stores',
    AssignedTeam = 'teams',
}

export enum APIOnlyFilterKey {
    ProductId = 'productId',
    CustomFieldId = 'customFieldId',
    CustomFieldValue = 'customFieldValue',
    CreatedDatetime = 'createdDatetime',
    ResourceSourceId = 'resourceSourceId',
    ResourceSourceSetId = 'resourceSourceSetId',
    StoreId = 'storeId',
    CallDirection = 'callDirection',
    CallTerminationStatus = 'callTerminationStatus',
    IsAnsweredByAgent = 'isAnsweredByAgent',
    AgentId = 'agentId',
    DisplayStatus = 'displayStatus',
    CallSlaStatus = 'callSlaStatus',
    HelpCenterId = 'helpCenterId',
    HelpCenterEventType = 'helpCenterEventType',
    IsSearchRequestedWithClick = 'isSearchRequestWithClick',
    SearchResultCount = 'searchResultCount',
    IsInfluenced = 'isInfluenced',
    ArticleId = 'articleId',
    ShopName = 'shopName',
    AbVariant = 'abVariant',
    Source = 'source',
    EventType = 'eventType',
}

export type StateOnlyFilterKeys = Exclude<
    FilterKey,
    | FilterKey.Period
    | FilterKey.CustomFields
    | FilterKey.AggregationWindow
    | FilterKey.JourneyType
    | FilterKey.JourneyFlows
    | FilterKey.JourneyCampaigns
>

export type CleanFilterComponentKeys = Exclude<
    FilterComponentKey,
    FilterComponentKey.BusiestTimesMetricSelectFilter
>

export enum FilterComponentKey {
    BusiestTimesMetricSelectFilter = 'busiestTimesMetricSelectFilter',
    PhoneIntegrations = 'phoneIntegrations',
    CustomField = 'customField',
}

export type StaticFilter =
    | FilterKey.AggregationWindow
    | FilterKey.Agents
    | FilterKey.IsDuringBusinessHours
    | FilterKey.Campaigns
    | FilterKey.CampaignStatuses
    | FilterKey.Channels
    | FilterKey.JourneyType
    | FilterKey.JourneyFlows
    | FilterKey.JourneyCampaigns
    | FilterKey.HelpCenters
    | FilterKey.Integrations
    | FilterKey.LocaleCodes
    | FilterKey.Period
    | FilterKey.Score
    | FilterKey.SlaPolicies
    | FilterKey.CommunicationSkills
    | FilterKey.LanguageProficiency
    | FilterKey.Accuracy
    | FilterKey.Efficiency
    | FilterKey.InternalCompliance
    | FilterKey.BrandVoice
    | FilterKey.ResolutionCompleteness
    | FilterKey.StoreIntegrations
    | FilterKey.Stores
    | FilterKey.AssignedTeam
    | FilterKey.VoiceQueues
    | FilterComponentKey.BusiestTimesMetricSelectFilter
    | FilterComponentKey.CustomField
    | FilterComponentKey.PhoneIntegrations

export interface Period {
    end_datetime: string
    start_datetime: string
}

export interface WithExtendedLogicalOperator<
    T extends number | string | boolean,
> {
    operator: ExtendedLogicalOperatorEnum
    values: T[]
}

export interface WithLogicalOperator<T extends number | string | boolean> {
    operator: LogicalOperatorEnum
    values: T[]
}

export interface CustomFieldFilter extends WithLogicalOperator<string> {
    customFieldId: number
}

export interface SavedFilterCustomFieldFilter
    extends WithLogicalOperator<string> {
    custom_field_id: string
}

export enum TagFilterInstanceId {
    First = 'first',
    Second = 'second',
}

export interface TagFilter extends WithLogicalOperator<number> {
    filterInstanceId: TagFilterInstanceId
}

export type LegacyStatsFilters = {
    [FilterKey.Accuracy]?: string[]
    [FilterKey.Agents]?: number[]
    [FilterKey.AggregationWindow]?: AggregationWindow
    [FilterKey.BrandVoice]?: string[]
    [FilterKey.IsDuringBusinessHours]?: string[]
    [FilterKey.Campaigns]?: string[]
    [FilterKey.CampaignStatuses]?: string[]
    [FilterKey.Channels]?: string[]
    [FilterKey.JourneyType]?: string[]
    [FilterKey.JourneyFlows]?: string[]
    [FilterKey.JourneyCampaigns]?: string[]
    [FilterKey.CommunicationSkills]?: string[]
    [FilterKey.CustomFields]?: string[]
    [FilterKey.Efficiency]?: string[]
    [FilterKey.HelpCenters]?: number[]
    [FilterKey.Integrations]?: number[]
    [FilterKey.InternalCompliance]?: string[]
    [FilterKey.LanguageProficiency]?: string[]
    [FilterKey.LocaleCodes]?: string[]
    [FilterKey.Period]: Period
    [FilterKey.ResolutionCompleteness]?: string[]
    [FilterKey.Score]?: string[]
    [FilterKey.SlaPolicies]?: string[]
    [FilterKey.Tags]?: number[]
    [FilterKey.StoreIntegrations]?: number[]
    [FilterKey.Stores]?: number[]
    [FilterKey.AssignedTeam]?: number[]
    [FilterKey.VoiceQueues]?: number[]
}

export type AgentOnlyFilters<T> = T extends any
    ? {
          period: Period
          agents?: T
      }
    : never

export type WorkflowStatsFilters = {
    period: Period
    workflowId: string
}

export type AggregationWindow =
    | ReportingGranularity.Hour
    | ReportingGranularity.Day
    | ReportingGranularity.Week
    | ReportingGranularity.Month

export type SavedFilterWithLogicalOperator = {
    member:
        | FilterKey.Accuracy
        | FilterKey.Agents
        | FilterKey.BrandVoice
        | FilterKey.IsDuringBusinessHours
        | FilterKey.Campaigns
        | FilterKey.CampaignStatuses
        | FilterKey.Channels
        | FilterKey.CommunicationSkills
        | FilterKey.Efficiency
        | FilterKey.HelpCenters
        | FilterKey.Integrations
        | FilterKey.InternalCompliance
        | FilterKey.LanguageProficiency
        | FilterKey.LocaleCodes
        | FilterKey.ResolutionCompleteness
        | FilterKey.Score
        | FilterKey.SlaPolicies
        | FilterKey.AssignedTeam
        | FilterKey.VoiceQueues
        | FilterKey.Stores
    operator: LogicalOperatorEnum
    values: string[]
}

export type CustomFieldSavedFilter = {
    member: FilterKey.CustomFields
    values: SavedFilterCustomFieldFilter[]
}

export type TagsSavedFilter = {
    member: FilterKey.Tags
    values: (WithLogicalOperator<string> & {
        filterInstanceId: TagFilterInstanceId
    })[]
}

export type SavedFilter = {
    id: number
} & SavedFilterDraft

export type SavedFilterAPI = {
    id: number
} & SavedFilterAPIDraft

export type SavedFilterSupportedFilters =
    | SavedFilterWithLogicalOperator
    | CustomFieldSavedFilter
    | TagsSavedFilter

export type SavedFilterAPISupportedFilters =
    | SavedFilterWithLogicalOperator
    | CustomFieldSavedFilter
    | (Omit<TagsSavedFilter, 'values'> & {
          values: WithLogicalOperator<string>[]
      })

export type SavedFilterDraft = {
    name: string
    filter_group: SavedFilterSupportedFilters[]
}

export type SavedFilterAPIDraft = {
    name: string
    filter_group: SavedFilterAPISupportedFilters[]
}

export type StatsFiltersWithLogicalOperator = {
    [FilterKey.Accuracy]?: WithLogicalOperator<string>
    [FilterKey.Agents]?: WithLogicalOperator<number>
    [FilterKey.AggregationWindow]?: AggregationWindow
    [FilterKey.BrandVoice]?: WithLogicalOperator<string>
    [FilterKey.IsDuringBusinessHours]?: WithLogicalOperator<string>
    [FilterKey.Campaigns]?: WithLogicalOperator<string>
    [FilterKey.CampaignStatuses]?: WithLogicalOperator<string>
    [FilterKey.Channels]?: WithLogicalOperator<string>
    [FilterKey.JourneyType]?: WithLogicalOperator<string>
    [FilterKey.JourneyFlows]?: WithLogicalOperator<string>
    [FilterKey.JourneyCampaigns]?: WithLogicalOperator<string>
    [FilterKey.CommunicationSkills]?: WithLogicalOperator<string>
    [FilterKey.CustomFields]?: CustomFieldFilter[]
    [FilterKey.Efficiency]?: WithLogicalOperator<string>
    [FilterKey.HelpCenters]?: WithLogicalOperator<number>
    [FilterKey.Integrations]?: WithLogicalOperator<number>
    [FilterKey.InternalCompliance]?: WithLogicalOperator<string>
    [FilterKey.LanguageProficiency]?: WithLogicalOperator<string>
    [FilterKey.LocaleCodes]?: WithLogicalOperator<string>
    [FilterKey.Period]: Period
    [FilterKey.ResolutionCompleteness]?: WithLogicalOperator<string>
    [FilterKey.Score]?: WithLogicalOperator<string>
    [FilterKey.SlaPolicies]?: WithLogicalOperator<string>
    [FilterKey.Tags]?: TagFilter[]
    [FilterKey.StoreIntegrations]?: WithLogicalOperator<number>
    [FilterKey.Stores]?: WithLogicalOperator<number>
    [FilterKey.AssignedTeam]?: WithLogicalOperator<number>
    [FilterKey.VoiceQueues]?: WithLogicalOperator<number>
}

/** Adding this new mapping to separate filters exposed in the UI from the one only used in the reporting API */
export type ApiOnlyStatsFiltersWithLogicalOperator = {
    [APIOnlyFilterKey.CreatedDatetime]?: Period
    [APIOnlyFilterKey.CustomFieldId]?: WithLogicalOperator<number>
    [APIOnlyFilterKey.CustomFieldValue]?: WithLogicalOperator<string>
    [APIOnlyFilterKey.ResourceSourceId]?: WithLogicalOperator<string>
    [APIOnlyFilterKey.ResourceSourceSetId]?: WithLogicalOperator<string>
    [APIOnlyFilterKey.StoreId]?: WithLogicalOperator<string>
    [APIOnlyFilterKey.CallDirection]?: WithLogicalOperator<string>
    [APIOnlyFilterKey.CallTerminationStatus]?: WithExtendedLogicalOperator<string>
    [APIOnlyFilterKey.IsAnsweredByAgent]?: WithLogicalOperator<boolean>
    [APIOnlyFilterKey.ProductId]?: WithExtendedLogicalOperator<string>
    [APIOnlyFilterKey.AgentId]?: WithExtendedLogicalOperator<number>
    [APIOnlyFilterKey.DisplayStatus]?: WithLogicalOperator<string>
    [APIOnlyFilterKey.CallSlaStatus]?: WithExtendedLogicalOperator<string>
    [APIOnlyFilterKey.HelpCenterId]?: WithLogicalOperator<string>
    [APIOnlyFilterKey.HelpCenterEventType]?: WithLogicalOperator<string>
    [APIOnlyFilterKey.IsSearchRequestedWithClick]?: WithLogicalOperator<boolean>
    [APIOnlyFilterKey.SearchResultCount]?: WithLogicalOperator<number>
    [APIOnlyFilterKey.IsInfluenced]?: WithLogicalOperator<boolean>
    [APIOnlyFilterKey.ArticleId]?: WithLogicalOperator<string>
    [APIOnlyFilterKey.ShopName]?: WithLogicalOperator<string>
    [APIOnlyFilterKey.AbVariant]?: WithLogicalOperator<string>
    [APIOnlyFilterKey.Source]?: WithLogicalOperator<string>
    [APIOnlyFilterKey.EventType]?: WithLogicalOperator<string>
}

export type StatsFilters = StatsFiltersWithLogicalOperator

export type ApiStatsFilters = StatsFiltersWithLogicalOperator &
    ApiOnlyStatsFiltersWithLogicalOperator

export enum StatType {
    AgentAvailability = 'agent-availability',
    ArticleRecommendationAutomationRate = 'article-recommendation-automation-rate',
    Boolean = 'bool',
    Currency = 'currency',
    CustomerLink = 'customer-link',
    Date = 'date',
    Delta = 'delta',
    Duration = 'duration',
    IssueReason = 'issue-reason',
    Issues = 'issues',
    Number = 'number',
    Object = 'object',
    OnlineTime = 'online-time',
    OnlineState = 'online-state',
    Percent = 'percent',
    Product = 'product',
    QuickResponseAutomationRate = 'quick-response-automation-rate',
    QuickResponseTitle = 'quick-response-title',
    SatisfactionScore = 'satisfaction-score',
    SatisfactionSurveyLink = 'satisfaction-survey-link',
    String = 'string',
    TicketDetails = 'ticket-details',
    TicketLink = 'ticket-link',
    Timezone = 'timezone',
    Title = 'title',
    TitleWithLink = 'title-with-link',
    User = 'user',
}

export type Stat<T = StatData> = {
    data: T
    meta: StatMeta
}

export type StatMeta = Partial<CursorPaginationMeta> & {
    end_datetime?: string
    previous_end_datetime?: string
    previous_start_datetime?: string
    start_datetime?: string
}

export type StatData =
    | OneDimensionalChart
    | OneDimensionalUnionChart
    | TwoDimensionalChart

export type OneDimensionalChart = {
    data: {
        delta?: number
        name: string
        type: StatType
        value: number | Record<string, number> | string
        more_is_better?: boolean
        currency?: string
    }
}

export type OneDimensionalUnionChart = {
    data: OneDimensionalChart['data'][]
}

export type TwoDimensionalChart<
    X = AnyStatAxisValue,
    L = AnyStatLine,
    Y = AnyStatAxisValue,
> = {
    data: {
        axes: {
            x: X[]
            y?: Y[]
        }
        lines: L[]
    }
    label: string
    legend?: {
        axes: {
            x: string
            y: string
        }
    }
}

export type TextStatAxisValue = {
    name: string
    type: Exclude<StatType, StatType.Number>
}

export type NumericStatAxisValue = {
    name: string
    type:
        | StatType.Number
        | StatType.OnlineTime
        | StatType.TicketDetails
        | StatType.OnlineState
        | StatType.AgentAvailability
    value?: number
}

export type AnyStatAxisValue =
    | number
    | string
    | TextStatAxisValue
    | NumericStatAxisValue

export type DataStatLine = {
    data: number[]
    name: string
}

export type AnyStatLine = DataStatLine | StatCell[]

export type TextStatCell = {
    type: StatType.String | StatType.Timezone | StatType.Title
    value: string
}

export type NumericStatCell = {
    type:
        | StatType.Number
        | StatType.Percent
        | StatType.Duration
        | StatType.Delta
    value: number
}

export type AgentAvailabilityStatCell = {
    type: StatType.AgentAvailability
    value: number
}

export type TicketDetailStatCell = {
    type: StatType.TicketDetails
    value: number
    details: number
}

export type OnlineTimeDetailStatCell = {
    type: StatType.OnlineTime
    value: number
    extra: Record<string, unknown>
}

export type StatCell =
    | TextStatCell
    | NumericStatCell
    | AgentAvailabilityStatCell
    | TicketDetailStatCell
    | OnlineTimeDetailStatCell
    | { type: StatType.Date; value: string | null }
    | {
          type: StatType.SatisfactionSurveyLink
          ticket_id: number
          comment: string
      }
    | {
          type: StatType.CustomerLink
          customer_id: number
          customer_name: string | null
      }
    | { type: StatType.SatisfactionScore; value: number | null }
    | {
          type: StatType.Currency
          value: number
          currency: string
      }
    | {
          type: StatType.TicketLink
          ticket_id: number
          subject: string
      }
    | { type: StatType.Boolean; value: boolean }
    | {
          type: StatType.User
          value: {
              name: string
              id: number
          }
      }
    | { type: StatType.Object; value: Record<string, unknown> }
    | {
          type: StatType.Product
          value: {
              image_url: string
              name: string
          }
      }
    | {
          type: StatType.IssueReason
          value: ReportIssueReasons
      }
    | {
          type: StatType.Issues
          value: { [key in ReportIssueReasons]?: number }
      }
    | {
          type: StatType.TitleWithLink
          value: {
              title: string
              url: string
          }
      }

export enum TicketTimeReference {
    TaggedAt = 'tagged_at',
    CreatedAt = 'created_at',
}

export enum Sentiment {
    Positive = 'Positive',
    Negative = 'Negative',
}
