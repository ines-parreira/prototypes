import type { ReactNode } from 'react'

export type SidePanelMode = 'library' | 'performance'

export type StatusKind =
    | 'configured'
    | 'connect'
    | 'enabled'
    | 'disabled'
    | 'failing'

export type ProviderRef =
    | { iconUrl: string; alt: string; providerId?: string }
    | { providerId: string; alt?: string; iconUrl?: string }

export interface AppOption {
    id: string
    name: string
    icon: ProviderRef
    actions?: ActionOption[]
}

export interface ActionOption {
    id: string
    name: string
}

export interface Store {
    id: string
    name: string
    iconUrl?: string
}

export type LogicOperator = 'all' | 'any' | 'none'

export type ConditionFieldType =
    | 'string'
    | 'number'
    | 'date'
    | 'boolean'
    | 'enum'

export interface ConditionField {
    id: string
    label: string
    type: ConditionFieldType
    options?: ConditionValueOption[]
    /** Optional grouping key used by the variable picker (e.g. "customer", "order"). */
    category?: string
}

export interface ConditionFieldCategory {
    id: string
    label: string
    iconName?: string
}

export interface ConditionOperator {
    id: string
    label: string
}

export interface ConditionValueOption {
    value: string
    label: string
}

export interface Condition {
    id: string
    field: string
    operator: string
    value: string | number | boolean
}

export interface BannerLink {
    label: string
    href?: string
    onClick?: () => void
}

export type BannerVariant = 'info' | 'warning' | 'error'

export interface MetricTrend {
    value: string
    direction: 'up' | 'down' | 'flat'
}

export type TicketStatus = 'automated' | 'handover'

export interface TicketEntry {
    id: string
    icon: { name: string; alt?: string }
    title: string
    date: string
    status: TicketStatus
    messageCount: number
}

export interface SidePanelChildren {
    children: ReactNode
}
