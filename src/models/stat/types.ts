export enum StatType {
    User = 'user',
    Number = 'number',
    String = 'string',
    Percent = 'percent',
    Delta = 'delta',
    Duration = 'duration',
    CustomerLink = 'customer-link',
    Date = 'date',
    SatisfactionScore = 'satisfaction-score',
    SatisfactionSurveyLink = 'satisfaction-survey-link',
    Currency = 'currency',
    TicketLink = 'ticket-link',
    OnlineTime = 'online-time',
    TicketDetails = 'ticket-details',
    Timezone = 'timezone',
    Boolean = 'bool',
    Object = 'object',
}

export type Stat<T = StatData> = {
    data: T
    meta: StatMeta
}

export type StatMeta = {
    end_datetime?: string
    previous_end_datetime?: string
    previous_start_datetime?: string
    start_datetime?: string
    next_cursor?: string | null
    prev_cursor?: string | null
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
        type: Exclude<StatType, StatType.String>
        value: number | Record<string, number>
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
    type: StatType.String | StatType.Timezone
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
    | {
          type: StatType.User
          value: {name: string; id: number}
      }
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
