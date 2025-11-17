import type { Cube } from 'domains/reporting/models/types'
import type {
    OrderConversionDimension,
    OrderConversionMeasure,
} from 'domains/reporting/pages/convert/clients/constants'

export type ConvertOrderConversionCube = Cube<
    OrderConversionMeasure,
    OrderConversionDimension,
    never,
    never
>
