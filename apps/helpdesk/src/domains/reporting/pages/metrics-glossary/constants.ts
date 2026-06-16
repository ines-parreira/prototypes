import type { TagColor } from '@gorgias/axiom'

export const METRIC_CATEGORY_COLUMN_ID = 'category'

export type MetricCategoryOption = {
    id: string
    label: string
    color: TagColor
}

// Locked category enum exposed to customers. Mirrors the values the analytics
// backend filters on; kept here because the SDK types it as a free string.
export const METRIC_CATEGORY_OPTIONS: MetricCategoryOption[] = [
    {
        id: 'real-time-monitoring',
        label: 'Real-time monitoring',
        color: 'teal',
    },
    { id: 'ai-and-automation', label: 'AI & automation', color: 'purple' },
    { id: 'quality', label: 'Quality', color: 'red' },
    { id: 'support-performance', label: 'Support performance', color: 'green' },
    { id: 'voice', label: 'Voice', color: 'fuchsia' },
    { id: 'ticket-insights', label: 'Ticket insights', color: 'blue' },
]

export const METRIC_CATEGORY_BY_ID = new Map(
    METRIC_CATEGORY_OPTIONS.map((option) => [option.id, option]),
)
