import type {ReactNode} from 'react'

export type Dimension = {
    id: number
    ticket_id: number
    user_id?: number | null
    created_datetime: string
    updated_datetime: string
    name: 'communication_skills' | 'resolution'
    prediction: number
    explanation: string
}

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

export type DimensionSummary = Pick<Dimension, 'explanation' | 'prediction'>
