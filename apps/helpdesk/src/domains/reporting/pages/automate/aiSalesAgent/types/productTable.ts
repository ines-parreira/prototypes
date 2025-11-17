import type { Product } from 'constants/integrations/types/shopify'
import type { ProductTableKeys } from 'domains/reporting/pages/automate/aiSalesAgent/constants'
import type { MetricValueFormat } from 'domains/reporting/pages/common/utils'

export interface ProductTable extends Product {
    url?: string
}

export interface ProductTableContentCell {
    product: ProductTable
    metrics: Partial<Record<ProductTableKeys, string | number>>
}

export interface ProductTableColumn {
    key: ProductTableKeys
    title: string
    metricFormat?: MetricValueFormat
}
