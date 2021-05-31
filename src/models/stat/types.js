// @flow
import {StatType} from './constants.ts'

export type Stat = {
    data: StatData,
    meta: StatMeta,
}

export type StatMeta = {
    end_datetime: string,
    previous_end_datetime: string,
    previous_start_datetime: string,
    start_datetime: string,
}

export type StatData =
    | OneDimensionalChart
    | OneDimensionalUnionChart
    | TwoDimensionalChart

export type OneDimensionalChart = {
    data: {
        delta: number,
        name: string,
        type: $Values<StatType>,
        value: number,
        more_is_better?: boolean,
    },
}

export type OneDimensionalUnionChart = {
    data: $PropertyType<OneDimensionalChart, 'data'>[],
}

export type TwoDimensionalChart = {
    data: {
        axes: {
            x: StatAxisValue[],
            y?: StatAxisValue[],
        },
        lines: StatLine[],
    },
    label: string,
    legend?: {
        axes: {
            x: string,
            y: string,
        },
    },
}

export type StatAxisValue =
    | number
    | {
          name: string,
          type: $Diff<$Values<StatType>, typeof StatType.Number>,
      }
    | {
          name: string,
          type: typeof StatType.Number,
          value?: number,
      }

export type StatLine =
    | {
          data: number[],
          name: string,
      }
    | StatCell[]

export type StatCell =
    | {
          type: typeof StatType.String,
          value: string,
      }
    | {type: typeof StatType.Number, value: number}
