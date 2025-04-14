import React from 'react'

import { MetricTrendFormat } from 'pages/stats/common/utils'
import { TooltipData } from 'pages/stats/types'

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
