import type { ReactNode } from 'react'

import type { DateFormatType, TimeFormatType } from '@repo/utils'

import type { PurchaseSummaryData, ShopperEcommerceData } from '../../types'

export type {
    PurchaseSummaryData,
    ShopperData,
    ShopperEcommerceData,
} from '../../types'

export type OrderDetailsData = {
    id: number | string
    tags?: string
    note?: string
    created_at?: string
    invoice_url?: string
}

export type FieldRenderContext = {
    purchaseSummary: PurchaseSummaryData | undefined
    shopper: ShopperEcommerceData | undefined
    dateFormat: DateFormatType
    timeFormat: TimeFormatType
    integrationId: number | undefined
    externalId: string | undefined
    customerId: number | undefined
    ticketId: string | undefined
}

type BaseFieldConfig = {
    id: string
    label: string
}

export type ReadOnlyFieldConfig = BaseFieldConfig & {
    type: 'readonly'
    getValue: (context: FieldRenderContext) => string | number | undefined
    formatValue?: (
        value: string | number | undefined,
        context: FieldRenderContext,
    ) => ReactNode
}

export type ComponentFieldConfig = BaseFieldConfig & {
    type: 'component'
    render: (context: FieldRenderContext) => ReactNode
    getValue: (context: FieldRenderContext) => string | number | undefined
    formatValue?: (
        value: string | number | undefined,
        context: FieldRenderContext,
    ) => ReactNode
}

export type FieldConfig = ReadOnlyFieldConfig | ComponentFieldConfig

export type FieldPreference = {
    id: string
    visible: boolean
}

export type ShopifyFieldPreferences = {
    fields: FieldPreference[]
}

export type OrderFieldRenderContext = {
    order: OrderDetailsData
    isDraftOrder: boolean | undefined
    integrationId: number | undefined
    ticketId: string | undefined
    storeName: string | undefined
    dateFormat: DateFormatType
    timeFormat: TimeFormatType
}

type BaseOrderFieldConfig = {
    id: string
    label: string
}

export type ReadOnlyOrderFieldConfig = BaseOrderFieldConfig & {
    type: 'readonly'
    getValue: (context: OrderFieldRenderContext) => string | number | undefined
    formatValue?: (
        value: string | number | undefined,
        context: OrderFieldRenderContext,
    ) => ReactNode
}

export type ComponentOrderFieldConfig = BaseOrderFieldConfig & {
    type: 'component'
    render: (context: OrderFieldRenderContext) => ReactNode
    getValue: (context: OrderFieldRenderContext) => string | number | undefined
}

export type OrderFieldConfig =
    | ReadOnlyOrderFieldConfig
    | ComponentOrderFieldConfig

export type OrderDetailsFieldPreferences = {
    fields: FieldPreference[]
}

export type LeafTemplate = {
    path: string
    type: string
    title: string
    [key: string]: unknown
}
