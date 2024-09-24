import type {TicketQAScoreDimension} from '@gorgias/api-queries'
import type {ReactNode} from 'react'

export type DimensionConfig = {
    label: string
    options: DimensionOption[]
    prefix?: ReactNode
    tooltip?: string
}

export type DimensionOption = {
    label: string
    value: number
}

export type DimensionSummary = Pick<
    TicketQAScoreDimension,
    'explanation' | 'prediction'
>
