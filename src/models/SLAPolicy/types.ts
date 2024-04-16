import {TicketChannel} from '@gorgias/api-queries'

export type Metric = {
    name: string
    threshold: number
    unit: 'second' | 'minute' | 'hour' | 'day'
}

// Should be retrieved from @gorgias/api-queries when available
export type SLAPolicy = {
    id: number
    name: string
    description: string
    business_hours: boolean
    criteria: {
        channels: TicketChannel[]
    }
    metrics: Metric[]
}
