import {CursorMeta} from 'models/api/types'
import {ReportingGranularity} from 'models/reporting/types'
import {ReportIssueReasons} from 'models/selfServiceConfiguration/types'
import {LogicalOperatorEnum} from 'pages/stats/common/components/Filter/constants'

export enum FilterKey {
    Accuracy = 'accuracy',
    Agents = 'agents',
    AggregationWindow = 'aggregationWindow',
    BrandVoice = 'brandVoice',
    Campaigns = 'campaigns',
    CampaignStatuses = 'campaignStatuses',
    Channels = 'channels',
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
}

export type StateOnlyFilterKeys = Exclude<
    FilterKey,
    FilterKey.Period | FilterKey.CustomFields | FilterKey.AggregationWindow
>

export type CleanFilterComponentKeys = Exclude<
    FilterComponentKey,
    FilterComponentKey.BusiestTimesMetricSelectFilter
>

export enum FilterComponentKey {
    BusiestTimesMetricSelectFilter = 'busiestTimesMetricSelectFilter',
    Store = 'store',
    PhoneIntegrations = 'phoneIntegrations',
    CustomField = 'customField',
}

export type StaticFilter =
    | FilterKey.AggregationWindow
    | FilterKey.Agents
    | FilterKey.Campaigns
    | FilterKey.CampaignStatuses
    | FilterKey.Channels
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
    | FilterComponentKey.BusiestTimesMetricSelectFilter
    | FilterComponentKey.CustomField
    | FilterComponentKey.Store
    | FilterComponentKey.PhoneIntegrations

export interface Period {
    end_datetime: string
    start_datetime: string
}

export interface WithLogicalOperator<T extends number | string> {
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
    [FilterKey.Campaigns]?: string[]
    [FilterKey.CampaignStatuses]?: string[]
    [FilterKey.Channels]?: string[]
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
    [FilterKey.Campaigns]?: WithLogicalOperator<string>
    [FilterKey.CampaignStatuses]?: WithLogicalOperator<string>
    [FilterKey.Channels]?: WithLogicalOperator<string>
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
}

export type StatsFilters = LegacyStatsFilters | StatsFiltersWithLogicalOperator

export enum StatType {
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

export type StatMeta = Partial<CursorMeta> & {
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
    | TicketDetailStatCell
    | OnlineTimeDetailStatCell
    | {type: StatType.Date; value: string | null}
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
    | {type: StatType.SatisfactionScore; value: number | null}
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
    | {type: StatType.Boolean; value: boolean}
    | {
          type: StatType.User
          value: {
              name: string
              id: number
          }
      }
    | {type: StatType.Object; value: Record<string, unknown>}
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
          value: {[key in ReportIssueReasons]?: number}
      }
    | {
          type: StatType.TitleWithLink
          value: {
              title: string
              url: string
          }
      }
