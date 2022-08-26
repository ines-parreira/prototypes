import {TicketChannel} from 'business/types/ticket'
import {ReportIssueReasons} from 'models/selfServiceConfiguration/types'
import {CursorMeta} from '../api/types'

export type StatsFilters = {
    period: {
        end_datetime: string
        start_datetime: string
    }
    integrations?: number[]
    tags?: number[]
    agents?: number[]
    channels?: TicketChannel[]
    score?: string[]
}

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
    Percent = 'percent',
    Product = 'product',
    QuickResponseAutomationRate = 'quick-response-automation-rate',
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
    | SankeyDiagram

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
    Y = AnyStatAxisValue
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

export type SankeyDiagram = {
    data: {
        from: string
        to: string
        flow: number
    }[]
    label: string
    legend: {
        labels: Record<string, string>
        states: string[]
    }
}

export type StatAxisValue =
    | number
    | string
    | {
          name: string
          type: Exclude<StatType, StatType.Number>
      }
    | {
          name: string
          type: StatType.Number
          value?: number
      }

export type NumericStatAxisValue = {
    name: string
    type: StatType.Number | StatType.OnlineTime | StatType.TicketDetails
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
