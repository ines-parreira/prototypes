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
}

export type Stat<T = StatData> = {
    data: T
    meta: StatMeta
}

export type StatMeta = {
    end_datetime: string
    previous_end_datetime: string
    previous_start_datetime: string
    start_datetime: string
}

export type StatData =
    | OneDimensionalChart
    | OneDimensionalUnionChart
    | TwoDimensionalChart

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

export type TwoDimensionalChart = {
    data: {
        axes: {
            x: StatAxisValue[]
            y?: StatAxisValue[]
        }
        lines: StatLine[]
    }
    label: string
    legend?: {
        axes: {
            x: string
            y: string
        }
    }
}

export type StatAxisValue =
    | number
    | {
          name: string
          type: Exclude<StatType, StatType.Number>
      }
    | {
          name: string
          type: StatType.Number
          value?: number
      }

export type StatLine =
    | {
          data: number[]
          name: string
      }
    | StatCell[]

export type NumericStateCell = {
    type:
        | StatType.Number
        | StatType.Percent
        | StatType.Duration
        | StatType.Delta
        | StatType.User
    value: number
}

export type StatCell =
    | NumericStateCell
    | {
          type: StatType.String
          value: string
      }
    | {type: StatType.Date; value: string}
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
