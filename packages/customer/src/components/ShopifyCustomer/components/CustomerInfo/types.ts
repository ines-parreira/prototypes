import type { ReactNode } from 'react'

import type { DateFormatType, TimeFormatType } from '@repo/utils'

import type { PurchaseSummaryData, ShopperEcommerceData } from '../../types'

export type {
    PurchaseSummaryData,
    ShopperData,
    ShopperEcommerceData,
} from '../../types'

export type FieldRenderContext = {
    purchaseSummary: PurchaseSummaryData | undefined
    shopper: ShopperEcommerceData | undefined
    dateFormat: DateFormatType
    timeFormat: TimeFormatType
    integrationId: number | undefined
    externalId: string | undefined
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

export type FieldConfig = ReadOnlyFieldConfig
