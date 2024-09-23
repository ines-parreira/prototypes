import {Cube} from 'models/reporting/types'
import {
    OrderConversionDimension,
    OrderConversionMeasure,
} from 'pages/stats/convert/clients/constants'

export type ConvertOrderConversionCube = Cube<
    OrderConversionMeasure,
    OrderConversionDimension,
    never,
    never
>
