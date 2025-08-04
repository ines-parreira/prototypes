import { LegacyChannelSlug } from '@gorgias/helpdesk-queries'

export type Metric = {
    name: string
    threshold: number
    unit: 'second' | 'minute' | 'hour' | 'day'
}

// Should be retrieved from @gorgias/helpdesk-queries when available
export type SLAPolicy = {
    id: number
    name: string
    description: string
    business_hours: boolean
    criteria: {
        channels: (LegacyChannelSlug | string)[]
    }
    metrics: Metric[]
}
