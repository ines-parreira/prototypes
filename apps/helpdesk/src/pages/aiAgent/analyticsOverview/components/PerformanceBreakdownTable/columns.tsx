import { formatMetricValue, NOT_AVAILABLE_PLACEHOLDER } from '@repo/reporting'

import type { ColumnDef } from '@gorgias/axiom'
import { Box, Icon, Skeleton, Text } from '@gorgias/axiom'

import css from 'pages/aiAgent/analyticsOverview/components/PerformanceBreakdownTable/PerformanceBreakdownTable.less'
import { SortableHeaderCell } from 'pages/aiAgent/analyticsOverview/components/PerformanceBreakdownTable/SortableHeaderCell'
import type {
    FeatureMetrics,
    PerformanceMetricsPerFeature,
} from 'pages/aiAgent/analyticsOverview/hooks/usePerformanceMetricsPerFeature'

export const PERFORMANCE_BREAKDOWN_TABLE = {
    title: 'Performance breakdown',
    description:
        'Automation performance metrics per feature, including automation rate, automated interactions, handovers, cost saved, and time saved.',
}

type LoadingStates = PerformanceMetricsPerFeature['loadingStates']
type MetricFormat = Parameters<typeof formatMetricValue>[1]

type PerformanceColumnConfig = {
    accessorKey: keyof Omit<FeatureMetrics, 'feature'>
    label: string
    tooltipTitle: string
    tooltipCaption: string
    metricFormat: MetricFormat
    loadingStateKeys: (keyof LoadingStates)[]
    skeletonWidth?: string
    showNotAvailable?: boolean
}

export const PERFORMANCE_BREAKDOWN_COLUMNS: PerformanceColumnConfig[] = [
    {
        accessorKey: 'automationRate',
        label: 'Overall automation rate',
        tooltipTitle: 'Overall automation rate',
        tooltipCaption:
            'The number of interactions automated by all automation features as a % of total customer interactions.',
        metricFormat: 'percent-precision-1',
        loadingStateKeys: ['automationRate'],
    },
    {
        accessorKey: 'automatedInteractions',
        label: 'Automated interactions',
        tooltipTitle: 'Automated interactions',
        tooltipCaption:
            'The number of fully automated interactions solved without any human agent intervention.',
        metricFormat: 'decimal',
        loadingStateKeys: ['automatedInteractions'],
    },
    {
        accessorKey: 'handoverCount',
        label: 'Handover interactions',
        tooltipTitle: 'Handover interactions',
        tooltipCaption:
            "The number of interactions AI Agent transferred to a human because it couldn't confidently resolve the customer's request or because the customer explicitly requested to speak with a human agent.",
        metricFormat: 'decimal',
        loadingStateKeys: ['handovers'],
    },
    {
        accessorKey: 'costSaved',
        label: 'Cost saved',
        tooltipTitle: 'Cost saved',
        tooltipCaption:
            'The estimated amount saved by automating interactions that would have otherwise been handled by agents, based on Helpdesk ticket cost plus the benchmark agent cost of $3.10 per ticket.',
        metricFormat: 'currency-precision-1',
        loadingStateKeys: ['costSaved'],
        showNotAvailable: true,
    },
    {
        accessorKey: 'timeSaved',
        label: 'Time saved by agents',
        tooltipTitle: 'Time saved by agents',
        tooltipCaption:
            'The time agent would have spent resolving customer inquiries without all automation features.',
        metricFormat: 'duration',
        loadingStateKeys: ['automatedInteractions', 'timeSaved'],
        skeletonWidth: '80px',
    },
]

export function buildFeatureColumnDef(): ColumnDef<FeatureMetrics> {
    return {
        accessorKey: 'feature',
        header: (info) => {
            const sortDirection = info.column.getIsSorted()
            return (
                <Box
                    display="flex"
                    alignItems="center"
                    gap="xxxs"
                    className={css.featureName}
                >
                    <Text size="sm" variant="bold">
                        Feature
                    </Text>
                    <span
                        style={{
                            visibility: sortDirection ? 'visible' : 'hidden',
                        }}
                    >
                        <Icon
                            name={
                                sortDirection === 'asc'
                                    ? 'arrow-down'
                                    : 'arrow-up'
                            }
                            size="xs"
                        />
                    </span>
                </Box>
            )
        },
        meta: { displayName: 'Feature' },
        cell: (info) => (
            <Text size="md" variant="bold" className={css.featureName}>
                {info.getValue() as string}
            </Text>
        ),
        enableHiding: false,
    }
}

export function buildMetricColumnDefs(
    loadingStates: LoadingStates,
): ColumnDef<FeatureMetrics>[] {
    return PERFORMANCE_BREAKDOWN_COLUMNS.map((config) => ({
        accessorKey: config.accessorKey,
        enableHiding: true,
        meta: { displayName: config.label },
        header: (info) => {
            const sortDirection = info.column.getIsSorted()
            return (
                <SortableHeaderCell
                    label={config.label}
                    sortDirection={sortDirection}
                    tooltipTitle={config.tooltipTitle}
                    tooltipCaption={config.tooltipCaption}
                    className={css.headerWithIcon}
                />
            )
        },
        cell: (info) => {
            const value = info.getValue() as number | null
            const feature = info.row.original.feature
            const isLoading = config.loadingStateKeys.some(
                (key) => loadingStates[key],
            )
            if (isLoading && value === null) {
                return (
                    <Skeleton
                        key={`${feature}-${config.accessorKey}`}
                        width={config.skeletonWidth ?? '60px'}
                        height="20px"
                    />
                )
            }

            if (config.showNotAvailable && value !== null && isNaN(value)) {
                return NOT_AVAILABLE_PLACEHOLDER
            }

            return formatMetricValue(value, config.metricFormat, 'USD', true)
        },
    }))
}
