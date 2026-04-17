import type { MetricColumnConfig } from '@repo/reporting'

import { ProductTableKeys } from 'domains/reporting/pages/automate/aiSalesAgent/constants'

export const SHOPPING_ASSISTANT_TOP_PRODUCTS_COLUMNS: MetricColumnConfig[] = [
    {
        accessorKey: ProductTableKeys.NumberOfRecommendations,
        label: 'Times recommended',
        tooltipTitle: 'Times recommended',
        tooltipCaption:
            'The number of times a product was recommended by the AI agent.',
        metricFormat: 'integer',
        loadingStateKeys: [ProductTableKeys.NumberOfRecommendations],
    },
    {
        accessorKey: ProductTableKeys.CTR,
        label: 'Click-through rate',
        tooltipTitle: 'Click-through rate',
        tooltipCaption:
            'The percentage of a product recommendation that customers click.',
        metricFormat: 'decimal-to-percent',
        loadingStateKeys: [ProductTableKeys.CTR],
    },
    {
        accessorKey: ProductTableKeys.BTR,
        label: 'Buy through rate',
        tooltipTitle: 'Buy through rate',
        tooltipCaption:
            'The percentage of a product recommendation that result in a purchase.',
        metricFormat: 'decimal-to-percent',
        loadingStateKeys: [ProductTableKeys.BTR],
    },
]
