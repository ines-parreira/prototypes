import { TopIntentsColumns } from 'domains/reporting/pages/voice-of-customer/charts/TopProductsPerAIIntentChart/TopProductsPerAIIntentConfig'
import { OrderDirection } from 'models/api/types'

type BaseRowProps = {
    level: number
    leadColumn: TopIntentsColumns
    intentCustomFieldId: number
}

type BaseMetrics = {
    value: number
    prevValue: number
}

export type TopProductsPerIntentOrder = {
    column: TopIntentsColumns
    direction: OrderDirection
}

export type TopIntentsRowProps = BaseRowProps &
    BaseMetrics & {
        entityId: string
        productId?: string
        productUrl?: string
        defaultExpanded?: boolean
    }

export type TopProductsRowProps = BaseRowProps & {
    entityId: string
}
