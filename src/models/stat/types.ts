import {CursorMeta} from 'models/api/types'
import {ReportingGranularity} from 'models/reporting/types'
import {ReportIssueReasons} from 'models/selfServiceConfiguration/types'
import {LogicalOperatorEnum} from 'pages/stats/common/components/Filter/constants'

export enum FilterKey {
    Agents = 'agents',
    AggregationWindow = 'aggregationWindow',
    Campaigns = 'campaigns',
    CampaignStatuses = 'campaignStatuses',
    Channels = 'channels',
    CustomFields = 'customFields',
    HelpCenters = 'helpCenters',
    Integrations = 'integrations',
    LocaleCodes = 'localeCodes',
    Period = 'period',
    Score = 'score',
    SlaPolicies = 'slaPolicies',
    Tags = 'tags',
    CommunicationSkills = 'communicationSkills',
    ResolutionCompleteness = 'resolutionCompleteness',
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
    custom_field_id: number
}

export enum TagFilterInstanceId {
    First = 'first',
    Second = 'second',
}

export interface TagFilter extends WithLogicalOperator<number> {
    filterInstanceId: TagFilterInstanceId
}

export type LegacyStatsFilters = {
    [FilterKey.Agents]?: number[]
    [FilterKey.Campaigns]?: string[]
    [FilterKey.CampaignStatuses]?: string[]
    [FilterKey.Channels]?: string[]
    [FilterKey.CustomFields]?: string[]
    [FilterKey.HelpCenters]?: number[]
    [FilterKey.Integrations]?: number[]
    [FilterKey.LocaleCodes]?: string[]
    [FilterKey.AggregationWindow]?: AggregationWindow
    [FilterKey.Period]: Period
    [FilterKey.Score]?: string[]
    [FilterKey.SlaPolicies]?: string[]
    [FilterKey.Tags]?: number[]
    [FilterKey.CommunicationSkills]?: string[]
    [FilterKey.ResolutionCompleteness]?: string[]
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
        | FilterKey.Agents
        | FilterKey.Campaigns
        | FilterKey.CampaignStatuses
        | FilterKey.Channels
        | FilterKey.HelpCenters
        | FilterKey.Integrations
        | FilterKey.LocaleCodes
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
    values: WithLogicalOperator<string>[]
}

export type SavedFilter = {
    id: number
} & SavedFilterDraft

export type SavedFilterSupportedFilters =
    | SavedFilterWithLogicalOperator
    | CustomFieldSavedFilter
    | TagsSavedFilter

export type SavedFilterDraft = {
    name: string
    filter_group: SavedFilterSupportedFilters[]
}

export type StatsFiltersWithLogicalOperator = {
    [FilterKey.Agents]?: WithLogicalOperator<number>
    [FilterKey.Campaigns]?: WithLogicalOperator<string>
    [FilterKey.CampaignStatuses]?: WithLogicalOperator<string>
    [FilterKey.Channels]?: WithLogicalOperator<string>
    [FilterKey.CustomFields]?: CustomFieldFilter[]
    [FilterKey.HelpCenters]?: WithLogicalOperator<number>
    [FilterKey.Integrations]?: WithLogicalOperator<number>
    [FilterKey.LocaleCodes]?: WithLogicalOperator<string>
    [FilterKey.Period]: Period
    [FilterKey.Score]?: WithLogicalOperator<string>
    [FilterKey.SlaPolicies]?: WithLogicalOperator<string>
    [FilterKey.Tags]?: TagFilter[]
    [FilterKey.AggregationWindow]?: AggregationWindow
    [FilterKey.CommunicationSkills]?: WithLogicalOperator<string>
    [FilterKey.ResolutionCompleteness]?: WithLogicalOperator<string>
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
