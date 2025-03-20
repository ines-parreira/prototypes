import { Product } from 'constants/integrations/types/shopify'
import { ProductTableKeys } from 'pages/stats/aiSalesAgent/constants'
import { MetricValueFormat } from 'pages/stats/common/utils'

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
