import type React from 'react'

import type { MetricTrendFormat } from 'domains/reporting/pages/common/utils'
import type { TooltipData } from 'domains/reporting/pages/types'

export type KpiMetric = {
    hidden?: boolean
    isLoading: boolean
    title?: string
    hint?: TooltipData
    value?: number | null
    prevValue?: number | null
    currency?: string
    metricFormat?: MetricTrendFormat
    'data-candu-id'?: string
    action?: React.ReactNode
    hideTrend?: boolean
}
