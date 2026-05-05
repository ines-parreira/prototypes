import type { ReactNode } from 'react'

import type { MetricTooltipConfig } from '../../types'
import type { formatMetricValue } from '../../utils/helpers'

export type MetricLoadingStates = Record<string, boolean>

type MetricFormat = Parameters<typeof formatMetricValue>[1]

export type MetricColumnConfig = {
    accessorKey: string
    label: string
    tooltipConfig?: MetricTooltipConfig
    /** @deprecated Use tooltipConfig instead */
    tooltipTitle?: string
    /** @deprecated Use tooltipConfig instead */
    tooltipCaption?: string
    /** @deprecated Use tooltipConfig instead */
    tooltipLink?: string
    metricFormat: MetricFormat
    loadingStateKeys: (keyof MetricLoadingStates)[]
    skeletonWidth?: string
    showNotAvailable?: boolean
    renderCell?: (
        value: number | null,
        row: Record<string, unknown>,
    ) => ReactNode | null
}

export type NameColumnConfig = {
    accessor: string
    label: string
    displayNames?: Record<string, string>
    formatName?: (value: string) => string
    getHref?: (value: string) => string | undefined
    getAvatarProps?: (value: string) => { url?: string; name: string }
    renderDrilldown?: (value: string) => ReactNode
}
