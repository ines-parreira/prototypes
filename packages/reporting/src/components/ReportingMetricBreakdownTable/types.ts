import type { formatMetricValue } from '../../utils/helpers'

export type MetricLoadingStates = Record<string, boolean>

type MetricFormat = Parameters<typeof formatMetricValue>[1]

export type MetricColumnConfig = {
    accessorKey: string
    label: string
    tooltipTitle: string
    tooltipCaption: string
    metricFormat: MetricFormat
    loadingStateKeys: (keyof MetricLoadingStates)[]
    skeletonWidth?: string
    showNotAvailable?: boolean
}

export type NameColumnConfig = {
    accessor: string
    label: string
    displayNames?: Record<string, string>
    formatName?: (value: string) => string
    getHref?: (value: string) => string | undefined
}
