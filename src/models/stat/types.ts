export enum StatType {
    User = 'user',
    Number = 'number',
    String = 'string',
    Percent = 'percent',
    Delta = 'delta',
    Duration = 'duration',
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
        delta: number
        name: string
        type: Exclude<StatType, StatType.String>
        value: number
        more_is_better?: boolean
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

export type StatCell =
    | {
          type: StatType.String
          value: string
      }
    | {type: StatType.Number; value: number}
